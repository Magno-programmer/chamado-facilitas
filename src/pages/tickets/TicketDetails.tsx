
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Clock, RefreshCw, User } from 'lucide-react';
import { getTicketById } from '@/lib/services/ticketService';
import { TicketWithDetails, TicketStatus } from '@/lib/types/ticket.types';
import { UserRole } from '@/lib/types/user.types';
import StatusBadge from '@/components/StatusBadge';
import ProgressBar from '@/components/ProgressBar';
import RemainingTime from '@/components/RemainingTime';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const TicketDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [ticket, setTicket] = useState<TicketWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const loadTicket = async () => {
      setIsLoading(true);
      try {
        if (id) {
          const ticketData = await getTicketById(parseInt(id));
          
          const convertToUserRole = (role: string): UserRole => {
            return role === 'ADMIN' ? 'ADMIN' : 'CLIENT';
          };
          
          const mappedTicket: TicketWithDetails = {
            id: ticketData.id,
            title: ticketData.titulo,
            description: ticketData.descricao || '',
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
    
    if (isAuthenticated && id) {
      loadTicket();
    }
  }, [id, isAuthenticated, navigate]);

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

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
  };

  if (isLoading || authLoading) {
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
        <div className="flex items-center justify-center h-full flex-col">
          <h2 className="text-2xl font-bold mb-4">Chamado não encontrado</h2>
          <button
            onClick={() => navigate('/tickets')}
            className="flex items-center text-primary hover:underline"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar para a lista de chamados
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 pt-20 animate-slide-up">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/tickets')}
          className="flex items-center text-muted-foreground hover:text-foreground mr-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar
        </button>
        <h1 className="text-3xl font-bold">Detalhes do Chamado #{ticket.id}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-semibold">{ticket.title}</h2>
              <StatusBadge status={ticket.status} />
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Descrição</h3>
              <p className="whitespace-pre-line">{ticket.description || 'Sem descrição'}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Progresso</h3>
              <ProgressBar 
                percentage={ticket.percentageRemaining}
                deadline={ticket.deadline}
                createdAt={ticket.createdAt}
                autoUpdate={true}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Tempo Restante</h3>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <RemainingTime deadline={ticket.deadline} createdAt={ticket.createdAt} />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Setor</h3>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{ticket.sector?.name || 'Não definido'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Informações do Chamado</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Solicitante</p>
                <p className="font-medium">{ticket.requester?.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Responsável</p>
                <p className="font-medium">{ticket.responsible?.name || 'Não atribuído'}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Data de criação</p>
                <p className="font-medium">{formatDate(ticket.createdAt)}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Prazo</p>
                <p className="font-medium">{formatDate(ticket.deadline)}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={ticket.status} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
