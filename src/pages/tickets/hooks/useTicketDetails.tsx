
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketStatus, TicketWithDetails } from '@/lib/types/ticket.types';
import { UserRole } from '@/lib/types/user.types';
import { getTicketById, updateTicket, deleteTicket } from '@/lib/services/ticketService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const completionSchema = z.object({
  completionDescription: z.string().min(20, {
    message: "A descrição de conclusão deve ter no mínimo 20 caracteres para concluir o chamado."
  })
});

export type CompletionFormValues = z.infer<typeof completionSchema>;

export const useTicketDetails = (id: string | undefined) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [ticket, setTicket] = useState<TicketWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusUpdateDialogOpen, setIsStatusUpdateDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm<CompletionFormValues>({
    resolver: zodResolver(completionSchema),
    defaultValues: {
      completionDescription: '',
    },
  });

  // Check if user is an admin or manager - both can manage tickets
  const canManageTickets = user?.role === 'ADMIN' || user?.role === 'Gerente';

  const calculatePercentageRemaining = (createdAt: string, deadline: string) => {
    const now = new Date();
    const start = new Date(createdAt);
    const end = new Date(deadline);
    
    const totalTime = end.getTime() - start.getTime();
    const elapsedTime = now.getTime() - start.getTime();
    
    if (totalTime <= 0) return 0;
    
    const percentage = 100 - (elapsedTime / totalTime) * 100;
    return Math.max(0, Math.min(100, percentage));
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const loadTicket = async () => {
    setIsLoading(true);
    try {
      if (id) {
        const ticketData = await getTicketById(parseInt(id));
        
        const convertToUserRole = (role: string): UserRole => {
          if (role === 'ADMIN') return 'ADMIN'; 
          if (role === 'Gerente') return 'Gerente';
          return 'CLIENT';
        };
        
        const mappedTicket: TicketWithDetails = {
          id: ticketData.id,
          title: ticketData.titulo,
          description: ticketData.descricao || '',
          completionDescription: ticketData.descricao_conclusao,
          sectorId: ticketData.setor_id,
          requesterId: ticketData.solicitante_id,
          responsibleId: ticketData.responsavel_id,
          status: ticketData.status as TicketStatus,
          createdAt: ticketData.data_criacao,
          deadline: ticketData.prazo,
          sector: {
            id: ticketData.setor.id,
            name: ticketData.setor.nome
          },
          requester: {
            id: ticketData.solicitante.id,
            name: ticketData.solicitante.nome,
            email: ticketData.solicitante.email,
            sectorId: ticketData.solicitante.setor_id,
            role: convertToUserRole(ticketData.solicitante.role)
          },
          responsible: ticketData.responsavel ? {
            id: ticketData.responsavel.id,
            name: ticketData.responsavel.nome,
            email: ticketData.responsavel.email,
            sectorId: ticketData.responsavel.setor_id,
            role: convertToUserRole(ticketData.responsavel.role)
          } : null,
          percentageRemaining: calculatePercentageRemaining(ticketData.data_criacao, ticketData.prazo)
        };
        
        setTicket(mappedTicket);
        // Pre-fill the form with existing completion description if any
        if (ticketData.descricao_conclusao) {
          form.setValue('completionDescription', ticketData.descricao_conclusao);
        }
      }
    } catch (error) {
      console.error('Error loading ticket:', error);
      toast({
        title: "Erro ao carregar o chamado",
        description: "Não foi possível carregar os detalhes do chamado.",
        variant: "destructive",
      });
      navigate('/tickets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && id) {
      loadTicket();
    }
  }, [id, isAuthenticated, navigate]);

  const handleDeleteTicket = async () => {
    if (!ticket) return;
    
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
      setIsDeleteDialogOpen(false);
    }
  };

  const handleStatusUpdate = async (status: TicketStatus) => {
    if (!ticket) return;
    
    setIsUpdating(true);
    try {
      if (status === 'Concluído') {
        await form.trigger();
        if (!form.formState.isValid) {
          setIsUpdating(false);
          return;
        }
        
        const formValues = form.getValues();
        
        await updateTicket(ticket.id, { 
          status: status,
          descricao_conclusao: formValues.completionDescription
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
      
      setIsStatusUpdateDialogOpen(false);
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

  const openStatusDialog = (status: TicketStatus) => {
    setSelectedStatus(status);
    setIsStatusUpdateDialogOpen(true);
  };

  return {
    ticket,
    isLoading,
    authLoading,
    canManageTickets,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isStatusUpdateDialogOpen,
    setIsStatusUpdateDialogOpen,
    selectedStatus,
    isUpdating,
    form,
    handleDeleteTicket,
    handleStatusUpdate,
    openStatusDialog,
  };
};
