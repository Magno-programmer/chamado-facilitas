
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
    const [hoursStr, minutesStr, secondsStr] = prazoTime.split(':');
    
    // Convert to numbers (using 0 as default if any part is missing)
    const hours = parseInt(hoursStr, 10) || 0;
    const minutes = parseInt(minutesStr, 10) || 0;
    const seconds = parseInt(secondsStr, 10) || 0;
    
    // Calculate total seconds for this deadline
    const totalDeadlineSeconds = (hours * 3600) + (minutes * 60) + seconds;
    
    // Create the deadline date by adding the total seconds to current time
    return new Date(currentDate.getTime() + totalDeadlineSeconds * 1000);
  };

  const handleSubmit = async (
    e: React.FormEvent,
    selectedDeadlineId: number | null,
    deadlines: Deadline[]
  ) => {
    e.preventDefault();
    
    if (!description) {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, preencha a descrição.',
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
      const isClient = user.role === 'CLIENT';
      const currentDate = new Date();
      
      // Default values for CLIENT users
      let sectorId = 1; // Default sector
      let deadlineDate = new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // Default 7 days
      let ticketTitle = "Novo chamado";
      let ticketStatus = 'Aguardando Prazo'; // Default status for client tickets
      
      // For non-CLIENT users, use the selected deadline if provided
      if (!isClient && selectedDeadlineId) {
        const selectedDeadline = deadlines.find((d) => d.id === selectedDeadlineId);
        
        if (selectedDeadline) {
          sectorId = selectedDeadline.setor_id ?? 1; // Default to 1 if null
          deadlineDate = calculateDeadlineDate(selectedDeadline);
          ticketTitle = selectedDeadline.titulo;
          ticketStatus = 'Aberto'; // Staff created tickets are "Aberto" by default
        }
      }

      // For CLIENT users, use the description as title if no title is provided
      if (isClient) {
        ticketTitle = title || description.substring(0, 50) + (description.length > 50 ? "..." : "");
      }

      const newTicket = {
        titulo: ticketTitle,
        descricao: description,
        setor_id: sectorId,
        solicitante_id: user.id,
        responsavel_id: null, // Don't set responsible ID initially
        status: ticketStatus,
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
