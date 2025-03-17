
import { Ticket, TicketFormData, TicketWithDetails, TicketStatus } from '@/lib/types';
import { addSeconds } from 'date-fns';
import { getEnrichedTickets } from '@/lib/mockData';
import { query } from '@/lib/database';

// Helper to parse ISO 8601 duration to seconds
const parseIsoDuration = (isoDuration: string): number => {
  const secondMatch = isoDuration.match(/PT(\d+)S/);
  const minuteMatch = isoDuration.match(/PT(\d+)M/);
  const hourMatch = isoDuration.match(/PT(\d+)H/);
  const dayMatch = isoDuration.match(/P(\d+)D/);
  
  if (secondMatch) return parseInt(secondMatch[1]);
  if (minuteMatch) return parseInt(minuteMatch[1]) * 60;
  if (hourMatch) return parseInt(hourMatch[1]) * 3600;
  if (dayMatch) return parseInt(dayMatch[1]) * 86400;
  
  return 3600; // Default 1 hour
};

// Calculate the percentage remaining for a ticket
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
  // Use mock data since we can't connect to PostgreSQL in browser
  console.log('Using mock ticket data');
  const mockTickets = getEnrichedTickets();
  return isAdmin 
    ? mockTickets
    : mockTickets.filter(t => t.requesterId === userId || t.responsibleId === userId);
};

export const getTicketById = async (id: number): Promise<TicketWithDetails | null> => {
  // Use mock data
  const mockTickets = getEnrichedTickets();
  const ticket = mockTickets.find(t => t.id === id);
  return ticket || null;
};

export const createTicket = async (ticketData: TicketFormData, userId: number): Promise<Ticket | null> => {
  try {
    // Simulate ticket creation
    const now = new Date();
    const deadlineId = ticketData.deadlineId;
    
    // Find deadline from mock data
    const deadlineData = {
      prazo: deadlineId === 1 ? 'PT3600S' : 
             deadlineId === 2 ? 'PT14400S' : 
             deadlineId === 3 ? 'PT86400S' : 'PT259200S'
    };
    
    const durationInSeconds = parseIsoDuration(deadlineData.prazo);
    const deadlineDate = addSeconds(now, durationInSeconds);

    // Create a new mock ticket
    const newTicket = {
      id: Math.floor(Math.random() * 1000) + 100,
      title: ticketData.title,
      description: ticketData.description,
      sectorId: ticketData.sectorId,
      requesterId: userId,
      responsibleId: null,
      status: 'Aberto' as TicketStatus,
      createdAt: now.toISOString(),
      deadline: deadlineDate.toISOString(),
    };

    return newTicket;
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
};

export const updateTicketStatus = async (id: number, status: TicketStatus, responsibleId?: number): Promise<Ticket | null> => {
  try {
    // Simulate updating a ticket
    const mockTickets = getEnrichedTickets();
    const ticketIndex = mockTickets.findIndex(t => t.id === id);
    
    if (ticketIndex === -1) {
      return null;
    }
    
    const updatedTicket = {
      ...mockTickets[ticketIndex],
      status,
      responsibleId: responsibleId || mockTickets[ticketIndex].responsibleId
    };
    
    return updatedTicket;
  } catch (error) {
    console.error(`Error updating ticket ${id} status:`, error);
    throw error;
  }
};

export const getDashboardStats = async (): Promise<any> => {
  // Get mock tickets to compute statistics
  const mockTickets = getEnrichedTickets();

  // Calculate statistics
  const totalTickets = mockTickets.length;
  const openTickets = mockTickets.filter(t => t.status === 'Aberto').length;
  const inProgressTickets = mockTickets.filter(t => t.status === 'Em Andamento').length;
  const completedTickets = mockTickets.filter(t => t.status === 'Concluído').length;
  const lateTickets = mockTickets.filter(t => t.status === 'Atrasado').length;

  // Group tickets by sector
  const sectorMap = new Map();
  mockTickets.forEach(ticket => {
    const sectorId = ticket.sectorId;
    const sectorName = ticket.sector.name;
    
    if (!sectorMap.has(sectorId)) {
      sectorMap.set(sectorId, { sectorId, sectorName, count: 0 });
    }
    
    sectorMap.get(sectorId).count++;
  });

  return {
    totalTickets,
    openTickets,
    inProgressTickets,
    completedTickets,
    lateTickets,
    ticketsBySector: Array.from(sectorMap.values()),
  };
};
