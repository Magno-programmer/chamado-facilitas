
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { updateTicket, deleteTicket } from '@/lib/services/ticketService';
import { TicketStatus, TicketWithDetails } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parseISO, addHours } from 'date-fns';
import { getDeadlineById } from '@/lib/services/deadlineService';

// Update the schemas to include deadline
const completionSchema = z.object({
  completionDescription: z.string().min(20, {
    message: "A descrição de conclusão deve ter no mínimo 20 caracteres para concluir o chamado."
  }).optional()
});

const assignSchema = z.object({
  responsibleId: z.string().min(1, {
    message: "É necessário selecionar um funcionário responsável."
  }).optional(),
  deadlineId: z.string().min(1, {
    message: "É necessário selecionar um prazo."
  }).optional()
});

type CompletionFormValues = z.infer<typeof completionSchema>;
type AssignFormValues = z.infer<typeof assignSchema>;

export const useTicketActions = (
  ticket: TicketWithDetails | null, 
  setTicket: React.Dispatch<React.SetStateAction<TicketWithDetails | null>>,
  loadTicket: () => Promise<void>
) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const completionForm = useForm<CompletionFormValues>({
    resolver: zodResolver(completionSchema),
    defaultValues: {
      completionDescription: ticket?.completionDescription || '',
    },
  });

  const assignForm = useForm<AssignFormValues>({
    resolver: zodResolver(assignSchema),
    defaultValues: {
      responsibleId: ticket?.responsibleId || '',
      deadlineId: ''
    },
  });

  const handleDeleteTicket = async (canDeleteTicket: boolean) => {
    if (!ticket) return;
    
    if (!canDeleteTicket) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para excluir este chamado.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUpdating(true);
    try {
      await deleteTicket(ticket.id);
      
      toast({
        title: "Chamado excluído",
        description: "O chamado foi excluído com sucesso.",
      });
      navigate('/tickets');
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast({
        title: "Erro ao excluir o chamado",
        description: "Não foi possível excluir o chamado.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusUpdate = async (status: TicketStatus, canEditTicket: boolean) => {
    if (!ticket) return;
    
    if (!canEditTicket) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para atualizar este chamado.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUpdating(true);
    try {
      if (status === 'Concluído') {
        await completionForm.trigger('completionDescription');
        if (!completionForm.formState.isValid) {
          setIsUpdating(false);
          return;
        }
        
        const formValues = completionForm.getValues();
        
        await updateTicket(ticket.id, { 
          status: status,
          descricao_conclusao: formValues.completionDescription || ''
        });
      } else {
        await updateTicket(ticket.id, { 
          status: status
        });
      }
      
      toast({
        title: "Status atualizado",
        description: `O chamado foi atualizado para "${status}".`,
      });
      
      loadTicket();
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast({
        title: "Erro ao atualizar o status",
        description: "Não foi possível atualizar o status do chamado.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignTicket = async (canAssignTicket: boolean) => {
    if (!ticket) return;
    
    if (!canAssignTicket) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para atribuir este chamado.",
        variant: "destructive",
      });
      return;
    }
    
    await assignForm.trigger(['responsibleId', 'deadlineId']);
    if (!assignForm.formState.isValid) return;
    
    const formValues = assignForm.getValues();
    
    setIsUpdating(true);
    try {
      // First get the deadline details to calculate the new deadline date
      if (!formValues.deadlineId) {
        throw new Error("Prazo não selecionado");
      }
      
      const deadlineInfo = await getDeadlineById(parseInt(formValues.deadlineId));
      if (!deadlineInfo) {
        throw new Error("Prazo não encontrado");
      }
      
      // Parse the prazo field from the deadline (time) and add it to the current date
      const deadlineTime = deadlineInfo.prazo;
      const deadlineHours = parseInt(deadlineTime.split(':')[0]);
      const deadlineMinutes = parseInt(deadlineTime.split(':')[1]);
      
      // Calculate new deadline date - current date plus the hours and minutes from the deadline
      const newDeadlineDate = new Date();
      newDeadlineDate.setHours(newDeadlineDate.getHours() + deadlineHours);
      newDeadlineDate.setMinutes(newDeadlineDate.getMinutes() + deadlineMinutes);

      // Format for Supabase
      const formattedDeadline = format(newDeadlineDate, "yyyy-MM-dd'T'HH:mm:ssXXX");
      
      await updateTicket(ticket.id, { 
        responsavel_id: formValues.responsibleId || '',
        status: 'Em Andamento', // Change status to "Em Andamento" when assigned
        prazo: formattedDeadline
      });
      
      toast({
        title: "Chamado atribuído",
        description: "O chamado foi atribuído com sucesso com o novo prazo.",
      });
      
      loadTicket();
    } catch (error) {
      console.error('Error assigning ticket:', error);
      toast({
        title: "Erro ao atribuir o chamado",
        description: "Não foi possível atribuir o chamado ou definir o prazo.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    completionForm,
    assignForm,
    isUpdating,
    setIsUpdating,
    handleDeleteTicket,
    handleStatusUpdate,
    handleAssignTicket
  };
};
