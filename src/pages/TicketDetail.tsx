
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TicketWithDetails, TicketStatus } from '@/lib/types';
import { Clock, Edit, RefreshCw, User, Building, Calendar, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/StatusBadge';
import ProgressBar from '@/components/ProgressBar';
import { useToast } from '@/hooks/use-toast';
import { getEnrichedTickets } from '@/lib/mockData';

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
    return (
      <div className="min-h-screen flex flex-col p-4 md:p-8 pt-20">
        <div className="flex items-center justify-center h-full">
          <RefreshCw className="h-12 w-12 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col p-4 md:p-8 pt-20">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Chamado não encontrado</h2>
            <p className="text-muted-foreground mb-4">
              O chamado que você está procurando não existe ou foi removido.
            </p>
            <Button onClick={() => navigate('/tickets')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Chamados
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 pt-20 animate-slide-up">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/tickets')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Chamados
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{ticket.title}</h1>
              <StatusBadge status={ticket.status} />
            </div>
            <p className="text-muted-foreground mt-1">
              #{ticket.id} • Criado em {formatDate(ticket.createdAt)}
            </p>
          </div>
          
          {isAdmin && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/tickets/${ticket.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              
              <div className="bg-white rounded-lg border shadow-sm p-1 flex gap-1">
                <Button 
                  size="sm" 
                  variant={ticket.status === 'Aberto' ? 'default' : 'outline'}
                  onClick={() => updateTicketStatus('Aberto')}
                >
                  Aberto
                </Button>
                <Button 
                  size="sm" 
                  variant={ticket.status === 'Em Andamento' ? 'default' : 'outline'}
                  onClick={() => updateTicketStatus('Em Andamento')}
                >
                  Em Andamento
                </Button>
                <Button 
                  size="sm" 
                  variant={ticket.status === 'Concluído' ? 'default' : 'outline'}
                  onClick={() => updateTicketStatus('Concluído')}
                >
                  Concluído
                </Button>
                <Button 
                  size="sm" 
                  variant={ticket.status === 'Atrasado' ? 'default' : 'outline'}
                  onClick={() => updateTicketStatus('Atrasado')}
                  className="text-destructive"
                >
                  Atrasado
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Descrição</h2>
            <p className="text-foreground whitespace-pre-line">{ticket.description}</p>
          </div>
          
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Progresso</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Tempo restante
                  </span>
                  <span className="text-sm font-medium">
                    {ticket.percentageRemaining}%
                  </span>
                </div>
                <ProgressBar percentage={ticket.percentageRemaining} />
              </div>
              
              <div className="pt-4 border-t grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Data de criação</p>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    <span>{formatDate(ticket.createdAt)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Prazo</p>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    <span>{formatDate(ticket.deadline)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Detalhes</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Setor</p>
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-primary" />
                  <span>{ticket.sector.name}</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Solicitante</p>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-primary" />
                  <span>{ticket.requester.name}</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Responsável</p>
                {ticket.responsible ? (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-primary" />
                    <span>{ticket.responsible.name}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground italic">Não atribuído</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
