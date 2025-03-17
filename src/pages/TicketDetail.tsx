
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TicketWithDetails, TicketStatus } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { getEnrichedTickets } from '@/lib/mockData';
import TicketsLoading from '@/components/tickets/TicketsLoading';
import TicketHeader from '@/components/tickets/TicketHeader';
import TicketDescription from '@/components/tickets/TicketDescription';
import TicketProgress from '@/components/tickets/TicketProgress';
import TicketDetails from '@/components/tickets/TicketDetails';
import TicketNotFound from '@/components/tickets/TicketNotFound';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ticket, setTicket] = useState<TicketWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser?.role === 'ADMIN';

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
      navigate('/login');
      return;
    }

    // Simulating API call to get ticket details
    const timer = setTimeout(() => {
      const allTickets = getEnrichedTickets();
      const ticketData = allTickets.find(t => t.id === Number(id));
      
      if (ticketData) {
        // Check if the user has access to this ticket
        if (isAdmin || ticketData.requesterId === currentUser?.id) {
          setTicket(ticketData);
        } else {
          toast({
            title: 'Acesso negado',
            description: 'Você não tem permissão para visualizar este chamado.',
            variant: 'destructive',
          });
          navigate('/tickets');
        }
      } else {
        toast({
          title: 'Chamado não encontrado',
          description: 'O chamado solicitado não foi encontrado.',
          variant: 'destructive',
        });
        navigate('/tickets');
      }
      
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [id, navigate, toast, isAdmin, currentUser?.id]);

  const updateTicketStatus = (status: TicketStatus) => {
    if (ticket) {
      // In a real app, this would be an API call
      setTicket({ ...ticket, status });
      toast({
        title: 'Status atualizado',
        description: `O status do chamado foi alterado para ${status}.`,
      });
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM, yyyy", { locale: ptBR });
  };

  if (isLoading) {
    return <TicketsLoading />;
  }

  if (!ticket) {
    return <TicketNotFound />;
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 pt-20 animate-slide-up">
      <TicketHeader
        id={ticket.id}
        title={ticket.title}
        status={ticket.status}
        createdAt={ticket.createdAt}
        isAdmin={isAdmin}
        onStatusChange={updateTicketStatus}
        formatDate={formatDate}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2 space-y-6">
          <TicketDescription description={ticket.description} />
          <TicketProgress
            percentageRemaining={ticket.percentageRemaining}
            createdAt={ticket.createdAt}
            deadline={ticket.deadline}
            formatDate={formatDate}
          />
        </div>
        
        <div className="space-y-6">
          <TicketDetails
            sector={ticket.sector}
            requester={ticket.requester}
            responsible={ticket.responsible}
          />
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
