
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { createTicket } from '@/lib/services/ticketService';
import { Deadline } from '@/lib/types/sector.types';

export const useTicketCreation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const calculateDeadlineDate = (selectedDeadline: Deadline) => {
    // Create a new Date object for the current time
    const currentDate = new Date();
    
    // Parse the deadline duration string "HH:MM:SS"
    const prazoTime = selectedDeadline.prazo;
    const [hoursStr, minutesStr] = prazoTime.split(':');
    
    // Convert to numbers (using 0 as default if any part is missing)
    const hours = parseInt(hoursStr, 10) || 0;
    const minutes = parseInt(minutesStr, 10) || 0;
    
    // Calculate total minutes for this deadline
    const totalDeadlineMinutes = (hours * 60) + minutes;
    
    // Create the deadline date by adding the total minutes to current time
    return new Date(currentDate.getTime() + totalDeadlineMinutes * 60 * 1000);
  };

  const handleSubmit = async (
    e: React.FormEvent,
    selectedDeadlineId: number | null,
    deadlines: Deadline[]
  ) => {
    e.preventDefault();
    
    if (!selectedDeadlineId || !description) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, selecione um prazo e preencha a descrição.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Erro de autenticação',
        description: 'Você precisa estar logado para criar um chamado.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedDeadline = deadlines.find((d) => d.id === selectedDeadlineId);
      
      if (!selectedDeadline) {
        throw new Error('Prazo selecionado não encontrado');
      }

      const sectorId = selectedDeadline.setor_id ?? 1; // Default to 1 if null
      const currentDate = new Date();
      const deadlineDate = calculateDeadlineDate(selectedDeadline);

      console.log('Current date:', currentDate);
      console.log('Deadline prazo:', selectedDeadline.prazo);
      console.log('Calculated deadline date:', deadlineDate);

      const newTicket = {
        titulo: title,
        descricao: description,
        setor_id: sectorId,
        solicitante_id: user.id,
        responsavel_id: user.id, // Adding responsavel_id
        status: 'Aberto',
        data_criacao: currentDate.toISOString(),
        prazo: deadlineDate.toISOString(),
      };

      await createTicket(newTicket);
      
      toast({
        title: 'Chamado criado',
        description: 'Seu chamado foi criado com sucesso!',
      });
      
      navigate('/tickets');
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o chamado. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/tickets');
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    isSubmitting,
    handleSubmit,
    handleCancel
  };
};
