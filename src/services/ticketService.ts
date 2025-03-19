
import { Ticket, TicketWithDetails, DashboardStats } from '@/lib/types';
import { ticketsApi } from '@/lib/api';
import { getSectorById } from './sectorService';
import { getUserById } from './userService';

export const getTickets = async (): Promise<Ticket[]> => {
  try {
    const response = await ticketsApi.getAll();
    
    // Map from backend format to our app format
    return response.map((ticket: any) => ({
      id: ticket.id,
      title: ticket.titulo,
      description: ticket.descricao,
      sectorId: ticket.setor_id,
      requesterId: ticket.solicitante_id,
      responsibleId: ticket.responsavel_id,
      status: ticket.status,
      createdAt: ticket.data_criacao,
      deadline: ticket.prazo
    }));
  } catch (error) {
    console.error('Error fetching tickets:', error);
    throw error;
  }
};

export const getTicketWithDetails = async (id: number): Promise<TicketWithDetails | null> => {
  try {
    const tickets = await getTickets();
    const ticket = tickets.find(t => t.id === id);
    
    if (!ticket) {
      return null;
    }
    
    const [sector, requester, responsible] = await Promise.all([
      getSectorById(ticket.sectorId),
      getUserById(ticket.requesterId),
      ticket.responsibleId ? getUserById(ticket.responsibleId) : Promise.resolve(null)
    ]);
    
    // Calculate percentage remaining based on deadline
    const percentageRemaining = calculatePercentageRemaining(ticket.deadline);
    
    return {
      ...ticket,
      sector: sector || { id: 0, name: 'Setor não encontrado' },
      requester: requester || { id: 0, name: 'Usuário não encontrado', email: '', sectorId: 0, role: 'CLIENT' },
      responsible: responsible,
      percentageRemaining
    };
  } catch (error) {
    console.error(`Error fetching ticket ${id} with details:`, error);
    return null;
  }
};

export const getRecentTickets = async (limit = 5): Promise<TicketWithDetails[]> => {
  try {
    const tickets = await getTickets();
    
    // Sort by creation date (newest first) and limit
    const sortedTickets = [...tickets].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, limit);
    
    // Enrich tickets with details
    const enrichedTickets = await Promise.all(
      sortedTickets.map(async ticket => {
        const [sector, requester, responsible] = await Promise.all([
          getSectorById(ticket.sectorId),
          getUserById(ticket.requesterId),
          ticket.responsibleId ? getUserById(ticket.responsibleId) : Promise.resolve(null)
        ]);
        
        return {
          ...ticket,
          sector: sector || { id: 0, name: 'Setor não encontrado' },
          requester: requester || { id: 0, name: 'Usuário não encontrado', email: '', sectorId: 0, role: 'CLIENT' },
          responsible: responsible,
          percentageRemaining: calculatePercentageRemaining(ticket.deadline)
        };
      })
    );
    
    return enrichedTickets;
  } catch (error) {
    console.error('Error fetching recent tickets:', error);
    return [];
  }
};

export const getUserTickets = async (userId: number): Promise<TicketWithDetails[]> => {
  try {
    const tickets = await getTickets();
    
    // Filter tickets by user (either requester or responsible)
    const userTickets = tickets.filter(ticket => 
      ticket.requesterId === userId || ticket.responsibleId === userId
    );
    
    // Enrich tickets with details
    const enrichedTickets = await Promise.all(
      userTickets.map(async ticket => {
        const [sector, requester, responsible] = await Promise.all([
          getSectorById(ticket.sectorId),
          getUserById(ticket.requesterId),
          ticket.responsibleId ? getUserById(ticket.responsibleId) : Promise.resolve(null)
        ]);
        
        return {
          ...ticket,
          sector: sector || { id: 0, name: 'Setor não encontrado' },
          requester: requester || { id: 0, name: 'Usuário não encontrado', email: '', sectorId: 0, role: 'CLIENT' },
          responsible: responsible,
          percentageRemaining: calculatePercentageRemaining(ticket.deadline)
        };
      })
    );
    
    return enrichedTickets;
  } catch (error) {
    console.error(`Error fetching tickets for user ${userId}:`, error);
    return [];
  }
};

export const getEnrichedTickets = async (): Promise<TicketWithDetails[]> => {
  try {
    const tickets = await getTickets();
    
    // Enrich all tickets with details
    const enrichedTickets = await Promise.all(
      tickets.map(async ticket => {
        const [sector, requester, responsible] = await Promise.all([
          getSectorById(ticket.sectorId),
          getUserById(ticket.requesterId),
          ticket.responsibleId ? getUserById(ticket.responsibleId) : Promise.resolve(null)
        ]);
        
        return {
          ...ticket,
          sector: sector || { id: 0, name: 'Setor não encontrado' },
          requester: requester || { id: 0, name: 'Usuário não encontrado', email: '', sectorId: 0, role: 'CLIENT' },
          responsible: responsible,
          percentageRemaining: calculatePercentageRemaining(ticket.deadline)
        };
      })
    );
    
    return enrichedTickets;
  } catch (error) {
    console.error('Error fetching enriched tickets:', error);
    return [];
  }
};

export const getTicketDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const tickets = await getTickets();
    const sectors = await getSectors();
    
    // Count tickets by status
    const openTickets = tickets.filter(ticket => ticket.status === 'Aberto').length;
    const inProgressTickets = tickets.filter(ticket => ticket.status === 'Em Andamento').length;
    const completedTickets = tickets.filter(ticket => ticket.status === 'Concluído').length;
    const lateTickets = tickets.filter(ticket => ticket.status === 'Atrasado').length;
    
    // Count tickets by sector
    const ticketsBySector = sectors.map(sector => {
      const count = tickets.filter(ticket => ticket.sectorId === sector.id).length;
      return {
        sectorId: sector.id,
        sectorName: sector.name,
        count
      };
    }).filter(item => item.count > 0); // Only include sectors with tickets
    
    return {
      totalTickets: tickets.length,
      openTickets,
      inProgressTickets,
      completedTickets,
      lateTickets,
      ticketsBySector
    };
  } catch (error) {
    console.error('Error generating dashboard stats:', error);
    return {
      totalTickets: 0,
      openTickets: 0,
      inProgressTickets: 0,
      completedTickets: 0,
      lateTickets: 0,
      ticketsBySector: []
    };
  }
};

// Helper function to get all sectors (internal use)
const getSectors = async () => {
  try {
    const { getSectors } = await import('./sectorService');
    return await getSectors();
  } catch (error) {
    console.error('Error fetching sectors:', error);
    return [];
  }
};

// Helper function to calculate percentage of time remaining
export const calculatePercentageRemaining = (deadline: string): number => {
  try {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    
    if (now > deadlineDate) {
      return 0; // Past deadline
    }
    
    const creationDate = new Date();
    creationDate.setDate(creationDate.getDate() - 5); // Assume ticket was created 5 days ago for demo
    
    const totalDuration = deadlineDate.getTime() - creationDate.getTime();
    const elapsedDuration = now.getTime() - creationDate.getTime();
    
    const percentageElapsed = (elapsedDuration / totalDuration) * 100;
    const percentageRemaining = Math.max(0, Math.min(100, 100 - percentageElapsed));
    
    return Math.round(percentageRemaining);
  } catch (error) {
    console.error('Error calculating percentage remaining:', error);
    return 50; // Default value
  }
};

// Create ticket
export const createTicket = async (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'status'>): Promise<Ticket | null> => {
  try {
    const response = await ticketsApi.create({
      titulo: ticketData.title,
      descricao: ticketData.description,
      setor_id: ticketData.sectorId,
      prazo: ticketData.deadline
    });
    
    return {
      id: response.id,
      title: response.titulo,
      description: response.descricao,
      sectorId: response.setor_id,
      requesterId: response.solicitante_id,
      responsibleId: response.responsavel_id,
      status: response.status,
      createdAt: response.data_criacao,
      deadline: response.prazo
    };
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
};

// Update ticket status
export const updateTicketStatus = async (ticketId: number, status: string): Promise<boolean> => {
  try {
    await ticketsApi.updateStatus(ticketId, status);
    return true;
  } catch (error) {
    console.error(`Error updating ticket ${ticketId} status:`, error);
    throw error;
  }
};

// Delete ticket
export const deleteTicket = async (ticketId: number): Promise<boolean> => {
  try {
    await ticketsApi.delete(ticketId);
    return true;
  } catch (error) {
    console.error(`Error deleting ticket ${ticketId}:`, error);
    throw error;
  }
};
