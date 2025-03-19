import { Ticket, TicketFormData, TicketWithDetails, TicketStatus } from '@/lib/types';
import { ticketsApi } from '@/lib/api';
import { getSectorById } from './sectorService';
import { getUserById } from './userService';

// Helper to calculate the percentage remaining for a ticket
const calculatePercentageRemaining = (ticket: any): number => {
  const now = new Date();
  const created = new Date(ticket.data_criacao || ticket.createdAt);
  const deadline = new Date(ticket.prazo || ticket.deadline);
  
  // If the deadline has passed
  if (now > deadline) {
    return 0;
  }
  
  // If it's completed
  if (ticket.status === 'Concluído') {
    return 100;
  }
  
  const totalDuration = deadline.getTime() - created.getTime();
  const elapsedDuration = now.getTime() - created.getTime();
  const remainingPercentage = 100 - Math.floor((elapsedDuration / totalDuration) * 100);
  
  return Math.max(0, Math.min(100, remainingPercentage));
};

export const getTickets = async (userId: number, isAdmin: boolean): Promise<TicketWithDetails[]> => {
  try {
    const response = await ticketsApi.getAll();
    
    if (!response || !Array.isArray(response)) {
      console.error('Resposta inválida da API de tickets:', response);
      return [];
    }
    
    // Filter tickets based on user role
    const userTickets = isAdmin 
      ? response 
      : response.filter((t: any) => t.solicitante_id === userId || t.responsavel_id === userId);
    
    // Enrich tickets with details
    const enrichedTickets = await Promise.all(userTickets.map(async (ticket: any) => {
      // Get sector details
      const sector = await getSectorById(ticket.setor_id);
      
      // Get requester details
      const requester = await getUserById(ticket.solicitante_id);
      
      // Get responsible details if assigned
      const responsible = ticket.responsavel_id 
        ? await getUserById(ticket.responsavel_id) 
        : null;
      
      return {
        id: ticket.id,
        title: ticket.titulo,
        description: ticket.descricao,
        sectorId: ticket.setor_id,
        requesterId: ticket.solicitante_id,
        responsibleId: ticket.responsavel_id,
        status: ticket.status as TicketStatus,
        createdAt: ticket.data_criacao,
        deadline: ticket.prazo,
        sector,
        requester,
        responsible,
        percentageRemaining: calculatePercentageRemaining(ticket),
      };
    }));
    
    return enrichedTickets;
  } catch (error) {
    console.error('Erro ao buscar tickets:', error);
    return [];
  }
};

export const getTicketById = async (id: number): Promise<TicketWithDetails | null> => {
  try {
    // API doesn't have endpoint to get ticket by ID, so we get all and filter
    const tickets = await ticketsApi.getAll();
    
    if (!tickets || !Array.isArray(tickets)) {
      console.error('Resposta inválida da API de tickets:', tickets);
      return null;
    }
    
    const ticket = tickets.find((t: any) => t.id === id);
    
    if (!ticket) {
      return null;
    }
    
    // Get related data
    const sector = await getSectorById(ticket.setor_id);
    const requester = await getUserById(ticket.solicitante_id);
    const responsible = ticket.responsavel_id 
      ? await getUserById(ticket.responsavel_id) 
      : null;
    
    return {
      id: ticket.id,
      title: ticket.titulo,
      description: ticket.descricao,
      sectorId: ticket.setor_id,
      requesterId: ticket.solicitante_id,
      responsibleId: ticket.responsavel_id,
      status: ticket.status as TicketStatus,
      createdAt: ticket.data_criacao,
      deadline: ticket.prazo,
      sector,
      requester,
      responsible,
      percentageRemaining: calculatePercentageRemaining(ticket),
    };
  } catch (error) {
    console.error(`Erro ao buscar ticket ${id}:`, error);
    return null;
  }
};

export const createTicket = async (ticketData: TicketFormData, userId: number): Promise<Ticket | null> => {
  try {
    const backendData = {
      titulo: ticketData.title,
      descricao: ticketData.description,
      setor_id: ticketData.sectorId,
      prazo: new Date(Date.now() + 3600000).toISOString(), // Default 1 hour from now
    };
    
    const response = await ticketsApi.create(backendData);
    
    return {
      id: response.id,
      title: response.titulo,
      description: response.descricao,
      sectorId: response.setor_id,
      requesterId: userId,
      responsibleId: null,
      status: 'Aberto' as TicketStatus,
      createdAt: response.data_criacao,
      deadline: response.prazo,
    };
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
};

export const updateTicketStatus = async (id: number, status: TicketStatus, responsibleId?: number): Promise<Ticket | null> => {
  try {
    const response = await ticketsApi.updateStatus(id, status);
    
    // Get the full ticket details after update
    const tickets = await ticketsApi.getAll();
    const updatedTicket = tickets.find((t: any) => t.id === id);
    
    if (!updatedTicket) {
      return null;
    }
    
    return {
      id: updatedTicket.id,
      title: updatedTicket.titulo,
      description: updatedTicket.descricao,
      sectorId: updatedTicket.setor_id,
      requesterId: updatedTicket.solicitante_id,
      responsibleId: updatedTicket.responsavel_id,
      status: updatedTicket.status as TicketStatus,
      createdAt: updatedTicket.data_criacao,
      deadline: updatedTicket.prazo,
    };
  } catch (error) {
    console.error(`Error updating ticket ${id} status:`, error);
    throw error;
  }
};

export const getDashboardStats = async (): Promise<any> => {
  try {
    // Get all tickets to compute statistics
    const tickets = await ticketsApi.getAll();
    
    if (!tickets || !Array.isArray(tickets)) {
      console.error('Resposta inválida da API de tickets para estatísticas:', tickets);
      return {
        totalTickets: 0,
        openTickets: 0,
        inProgressTickets: 0,
        completedTickets: 0,
        lateTickets: 0,
        ticketsBySector: [],
      };
    }
    
    // Calculate statistics
    const totalTickets = tickets.length;
    const openTickets = tickets.filter((t: any) => t.status === 'Aberto').length;
    const inProgressTickets = tickets.filter((t: any) => t.status === 'Em Andamento').length;
    const completedTickets = tickets.filter((t: any) => t.status === 'Concluído').length;
    const lateTickets = tickets.filter((t: any) => t.status === 'Atrasado').length;
    
    // Group tickets by sector
    const sectorMap = new Map();
    
    for (const ticket of tickets) {
      const sectorId = ticket.setor_id;
      const sector = await getSectorById(sectorId);
      const sectorName = sector?.name || 'Setor não encontrado';
      
      if (!sectorMap.has(sectorId)) {
        sectorMap.set(sectorId, { sectorId, sectorName, count: 0 });
      }
      
      sectorMap.get(sectorId).count++;
    }
    
    return {
      totalTickets,
      openTickets,
      inProgressTickets,
      completedTickets,
      lateTickets,
      ticketsBySector: Array.from(sectorMap.values()),
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas do dashboard:', error);
    return {
      totalTickets: 0,
      openTickets: 0,
      inProgressTickets: 0,
      completedTickets: 0,
      lateTickets: 0,
      ticketsBySector: [],
    };
  }
};
