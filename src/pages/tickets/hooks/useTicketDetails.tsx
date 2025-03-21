
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { getTicketById } from '@/lib/services/ticketService';
import { TicketWithDetails, TicketStatus } from '@/lib/types';
import { User as UserType } from '@/lib/types/user.types';
import { supabase } from '@/integrations/supabase/client';

export const useTicketDetails = (id: string | undefined) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [ticket, setTicket] = useState<TicketWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusUpdateDialogOpen, setIsStatusUpdateDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [sectorEmployees, setSectorEmployees] = useState<UserType[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isSectorManager = user?.role === 'Gerente';
  const isUserWithoutSector = user?.sectorId === null || user?.sectorId === 0;
  const canManageAllTickets = isAdmin || isSectorManager;
  
  const isOwnTicket = ticket && user && ticket.requesterId === user.id;
  
  const canDeleteTicket = canManageAllTickets || (isUserWithoutSector && isOwnTicket);
  const canEditTicket = canManageAllTickets && !isUserWithoutSector;
  const canAssignTicket = (isSectorManager || isAdmin) && ticket && (ticket.status === 'Aberto' || ticket.status === 'Aguardando Prazo');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

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

  const loadSectorEmployees = async (sectorId: number) => {
    setIsLoadingEmployees(true);
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('setor_id', sectorId)
        .eq('role', 'Funcionario');
      
      if (error) throw error;
      
      const employees = data.map(emp => ({
        id: emp.id,
        name: emp.nome,
        email: emp.email,
        sectorId: emp.setor_id,
        role: emp.role as UserType['role']
      }));
      
      setSectorEmployees(employees);
    } catch (error) {
      console.error('Error loading sector employees:', error);
      toast({
        title: "Erro ao carregar funcionários",
        description: "Não foi possível carregar a lista de funcionários do setor.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const loadTicket = async () => {
    setIsLoading(true);
    try {
      if (id) {
        const ticketData = await getTicketById(parseInt(id));
        
        const convertToUserRole = (role: string): UserType['role'] => {
          if (role === 'ADMIN') return 'ADMIN'; 
          if (role === 'Gerente') return 'Gerente';
          if (role === 'Funcionario') return 'Funcionario';
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
        if (mappedTicket.sectorId && (canAssignTicket)) {
          loadSectorEmployees(mappedTicket.sectorId);
        }
        
        // Check if user can view this ticket
        if (user && !canManageAllTickets && user.role !== 'Funcionario' && ticketData.solicitante_id !== user.id) {
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

  const handleTicketExpired = async () => {
    if (!ticket || ticket.status === 'Concluído' || ticket.status === 'Atrasado') return;
    
    try {
      const { updateTicket } = await import('@/lib/services/ticketService');
      await updateTicket(ticket.id, { status: 'Atrasado' });
      
      setTicket(prev => prev ? { ...prev, status: 'Atrasado' } : null);
      
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
    ticket,
    setTicket,
    isLoading,
    authLoading,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isStatusUpdateDialogOpen,
    setIsStatusUpdateDialogOpen,
    isAssignDialogOpen,
    setIsAssignDialogOpen,
    selectedStatus,
    setSelectedStatus,
    isUpdating,
    setIsUpdating,
    sectorEmployees,
    isLoadingEmployees,
    isAdmin,
    isSectorManager,
    isUserWithoutSector,
    canManageAllTickets,
    isOwnTicket,
    canDeleteTicket,
    canEditTicket,
    canAssignTicket,
    loadTicket,
    handleTicketExpired,
    user
  };
};
