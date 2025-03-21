
import { useState } from 'react';
import { TicketStatus, TicketWithDetails } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export const useTicketStatusManagement = (ticket: TicketWithDetails | null) => {
  const [isStatusUpdateDialogOpen, setIsStatusUpdateDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | null>(null);
  const { toast } = useToast();

  const handleTicketExpired = async (): Promise<void> => {
    if (!ticket || ticket.status === 'Concluído' || ticket.status === 'Atrasado') return;
    
    try {
      const { updateTicket } = await import('@/lib/services/ticketService');
      await updateTicket(ticket.id, { status: 'Atrasado' as TicketStatus });
      
      toast({
        title: "Status atualizado",
        description: "O chamado foi marcado como atrasado devido ao prazo expirado.",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  return {
    isStatusUpdateDialogOpen,
    setIsStatusUpdateDialogOpen,
    selectedStatus,
    setSelectedStatus,
    handleTicketExpired
  };
};
