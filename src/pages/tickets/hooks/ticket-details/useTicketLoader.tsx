
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { getTicketById } from '@/lib/services/ticketService';
import { TicketWithDetails, TicketStatus } from '@/lib/types';
import { User as UserType, UserRole } from '@/lib/types/user.types';

export const useTicketLoader = (
  id: string | undefined, 
  user: UserType | null,
  canManageAllTickets: boolean,
  loadSectorEmployees: (sectorId: number) => Promise<void>,
  canAssignTicket: boolean
) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ticket, setTicket] = useState<TicketWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const loadTicket = async () => {
    setIsLoading(true);
    try {
      if (id) {
        const ticketData = await getTicketById(parseInt(id));
        
        const convertToUserRole = (role: string): UserType['role'] => {
          if (role === 'ADMIN') return 'ADMIN'; 
          if (role === 'GERENTE') return 'GERENTE';
          if (role === 'FUNCIONARIO') return 'FUNCIONARIO';
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
        
        // If this is a ticket with a sector, load employees for that sector
        if (mappedTicket.sectorId && canAssignTicket) {
          loadSectorEmployees(mappedTicket.sectorId);
        }
        
        // Check if user can view this ticket
        if (user && !canManageAllTickets && user.role !== 'FUNCIONARIO' && ticketData.solicitante_id !== user.id) {
          toast({
            title: "Acesso negado",
            description: "Você só pode visualizar seus próprios chamados.",
            variant: "destructive",
          });
          navigate('/tickets');
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

  // Initial ticket loading
  useEffect(() => {
    if (id) {
      loadTicket();
    }
  }, [id]);

  return {
    ticket,
    setTicket,
    isLoading,
    loadTicket
  };
};
