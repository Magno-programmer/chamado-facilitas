
import { useState, useEffect } from 'react';
import { TicketWithDetails, UserRole } from '@/lib/types';
import { DashboardStats } from '@/lib/types/dashboard.types';
import { getTickets, getTicketsByUserId } from '@/lib/services/ticketService';
import { getTicketStats } from '@/lib/services/statsService';

interface DashboardDataProps {
  isAuthenticated: boolean;
  user: { id: string; role: UserRole } | null;
}

export const useDashboardData = ({ isAuthenticated, user }: DashboardDataProps) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    completedTickets: 0,
    lateTickets: 0,
    ticketsBySector: []
  });
  const [allTickets, setAllTickets] = useState<TicketWithDetails[]>([]);
  const [recentTickets, setRecentTickets] = useState<TicketWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to convert string role to UserRole type
  const convertToUserRole = (role: string): UserRole => {
    return role === 'ADMIN' ? 'ADMIN' : role === 'Gerente' ? 'Gerente' : 'CLIENT';
  };

  // Calculate percentage of time remaining for a ticket
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
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch tickets
        const ticketsData = await getTickets();
        
        // Map to our TicketWithDetails type and sort by most recent
        let mappedTickets = ticketsData
          .map(ticket => ({
            id: ticket.id,
            title: ticket.titulo,
            description: ticket.descricao || '',
            completionDescription: ticket.descricao_conclusao,
            sectorId: ticket.setor_id,
            requesterId: ticket.solicitante_id,
            responsibleId: ticket.responsavel_id,
            status: ticket.status as any,
            createdAt: ticket.data_criacao,
            deadline: ticket.prazo,
            sector: {
              id: ticket.setor.id,
              name: ticket.setor.nome
            },
            requester: {
              id: ticket.solicitante.id,
              name: ticket.solicitante.nome,
              email: ticket.solicitante.email,
              sectorId: ticket.solicitante.setor_id,
              role: convertToUserRole(ticket.solicitante.role)
            },
            responsible: ticket.responsavel ? {
              id: ticket.responsavel.id,
              name: ticket.responsavel.nome,
              email: ticket.responsavel.email,
              sectorId: ticket.responsavel.setor_id,
              role: convertToUserRole(ticket.responsavel.role)
            } : null,
            percentageRemaining: calculatePercentageRemaining(ticket.data_criacao, ticket.prazo)
          }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // If user is CLIENT, filter tickets to only show their own
        if (user && user.role === 'CLIENT') {
          mappedTickets = mappedTickets.filter(ticket => ticket.requesterId === user.id);
        }
        
        setAllTickets(mappedTickets);
        setRecentTickets(mappedTickets.slice(0, 5));
        
        // Fetch statistics based on filtered tickets if user is CLIENT
        if (user && user.role === 'CLIENT') {
          // Calculate stats from filtered tickets
          const clientStats: DashboardStats = {
            totalTickets: mappedTickets.length,
            openTickets: mappedTickets.filter(t => t.status === 'Aberto').length,
            inProgressTickets: mappedTickets.filter(t => t.status === 'Em Andamento').length,
            completedTickets: mappedTickets.filter(t => t.status === 'Concluído').length,
            lateTickets: mappedTickets.filter(t => t.status === 'Atrasado').length,
            ticketsBySector: []
          };
          
          // Calculate tickets by sector
          const sectorMap = new Map<number, { sectorId: number, sectorName: string, count: number }>();
          mappedTickets.forEach(ticket => {
            const { sectorId, sector } = ticket;
            if (!sectorMap.has(sectorId)) {
              sectorMap.set(sectorId, { sectorId, sectorName: sector.name, count: 0 });
            }
            const sectorData = sectorMap.get(sectorId);
            if (sectorData) {
              sectorData.count += 1;
            }
          });
          
          clientStats.ticketsBySector = Array.from(sectorMap.entries()).map(([_, value]) => value);
          setStats(clientStats);
        } else {
          // Admin sees all stats
          const statsData = await getTicketStats();
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated && user) {
      loadData();
    }
  }, [isAuthenticated, user]);

  return { stats, allTickets, recentTickets, isLoading };
};
