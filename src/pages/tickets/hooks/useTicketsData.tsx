
import { useState, useEffect } from 'react';
import { TicketStatus, TicketWithDetails } from '@/lib/types/ticket.types';
import { UserRole } from '@/lib/types/user.types';
import { getSectors, getTickets } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export const useTicketsData = () => {
  const { user, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [sectorFilter, setSectorFilter] = useState<number | 'all'>('all');
  const [sectors, setSectors] = useState<{id: number, nome: string}[]>([]);

  const isAdmin = user?.role === 'ADMIN';

  const convertToUserRole = (role: string): UserRole => {
    if (role === 'ADMIN') return 'ADMIN'; 
    if (role === 'Gerente') return 'Gerente';
    return 'CLIENT';
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const sectorsData = await getSectors();
        setSectors(sectorsData);
        
        const ticketsData = await getTickets();
        
        const mappedTickets = ticketsData.map(ticket => ({
          id: ticket.id,
          title: ticket.titulo,
          description: ticket.descricao || '',
          completionDescription: ticket.descricao_conclusao,
          sectorId: ticket.setor_id,
          requesterId: ticket.solicitante_id,
          responsibleId: ticket.responsavel_id,
          status: ticket.status as TicketStatus,
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
        }));
        
        const userTickets = isAdmin 
          ? mappedTickets 
          : mappedTickets.filter(ticket => ticket.requesterId === user?.id);
        
        setTickets(userTickets);
        setFilteredTickets(userTickets);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated && user) {
      loadData();
    }
  }, [isAuthenticated, user, isAdmin]);

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
    if (tickets.length === 0) return;

    let result = [...tickets];

    if (searchTerm) {
      result = result.filter(ticket => 
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(ticket => ticket.status === statusFilter);
    }

    if (sectorFilter !== 'all') {
      result = result.filter(ticket => ticket.sectorId === sectorFilter);
    }

    setFilteredTickets(result);
  }, [searchTerm, statusFilter, sectorFilter, tickets]);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSectorFilter('all');
  };

  return {
    tickets,
    filteredTickets,
    isLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sectorFilter,
    setSectorFilter,
    sectors,
    resetFilters,
    isAdmin
  };
};
