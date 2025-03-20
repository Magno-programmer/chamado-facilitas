import { User } from './types/user.types';
import { Sector } from './types/sector.types';
import { Deadline } from './types/sector.types';
import { Ticket, TicketStatus } from './types/ticket.types';
import { DashboardStats } from './types/dashboard.types';

export const mockDeadlines: Deadline[] = [
  { id: 1, titulo: 'Urgente', setor_id: 3, prazo: 'PT24H' }, // 24 hours
  { id: 2, titulo: 'Alta Prioridade', setor_id: 3, prazo: 'P3D' }, // 3 days
  { id: 3, titulo: 'Normal', setor_id: 2, prazo: 'P7D' }, // 7 days
  { id: 4, titulo: 'Baixa Prioridade', setor_id: 2, prazo: 'P14D' }, // 14 days
];

const getRandomStatus = (): TicketStatus => {
  const statuses: TicketStatus[] = ['Aberto', 'Em Andamento', 'Concluído', 'Atrasado'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

const generateRandomDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

const generateDeadlineDate = (createdDate: string, days: number) => {
  const date = new Date(createdDate);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

export const mockTickets: Ticket[] = Array.from({ length: 20 }, (_, i) => {
  const createdAt = generateRandomDate(Math.floor(Math.random() * 30));
  const deadlineDays = [1, 3, 7, 14][Math.floor(Math.random() * 4)];
  
  return {
    id: i + 1,
    title: `Chamado #${i + 1} - ${['Problema', 'Solicitação', 'Dúvida', 'Melhoria'][Math.floor(Math.random() * 4)]}`,
    description: `Descrição detalhada do chamado ${i + 1}. Este é um texto de exemplo para simular o conteúdo de um chamado real.`,
    sectorId: 1,
    requesterId: "1",
    responsibleId: "1",
    status: getRandomStatus(),
    createdAt,
    deadline: generateDeadlineDate(createdAt, deadlineDays),
  };
});

export const mockDashboardStats: DashboardStats = {
  totalTickets: mockTickets.length,
  openTickets: mockTickets.filter(t => t.status === 'Aberto').length,
  inProgressTickets: mockTickets.filter(t => t.status === 'Em Andamento').length,
  completedTickets: mockTickets.filter(t => t.status === 'Concluído').length,
  lateTickets: mockTickets.filter(t => t.status === 'Atrasado').length,
  ticketsBySector: [],
};

export const calculatePercentageRemaining = (ticket: Ticket): number => {
  const now = new Date();
  const created = new Date(ticket.createdAt);
  const deadline = new Date(ticket.deadline);
  
  if (now > deadline) {
    return 0;
  }
  
  if (ticket.status === 'Concluído') {
    return 100;
  }
  
  const totalDuration = deadline.getTime() - created.getTime();
  const elapsedDuration = now.getTime() - created.getTime();
  const remainingPercentage = 100 - Math.floor((elapsedDuration / totalDuration) * 100);
  
  return Math.max(0, Math.min(100, remainingPercentage));
};

export const getTicketWithDetails = (ticketId: number): any => {
  const ticket = mockTickets.find(t => t.id === ticketId);
  if (!ticket) return null;
  
  const sector = { id: 1, name: 'Administração' };
  const requester = {
    id: "1",
    name: 'Admin User',
    email: 'admin@example.com',
    sectorId: 1,
    role: 'ADMIN',
  };
  const responsible = {
    id: "1",
    name: 'Admin User',
    email: 'admin@example.com',
    sectorId: 1,
    role: 'ADMIN',
  };
  
  return {
    ...ticket,
    sector,
    requester,
    responsible,
    percentageRemaining: calculatePercentageRemaining(ticket),
  };
};

export const mockLogin = (email: string, password: string): User | null => {
  return null;
};

export const getEnrichedTickets = () => {
  return mockTickets.map(ticket => {
    const sector = { id: 1, name: 'Administração' };
    const requester = {
      id: "1",
      name: 'Admin User',
      email: 'admin@example.com',
      sectorId: 1,
      role: 'ADMIN',
    };
    const responsible = {
      id: "1",
      name: 'Admin User',
      email: 'admin@example.com',
      sectorId: 1,
      role: 'ADMIN',
    };
    
    return {
      ...ticket,
      sector,
      requester,
      responsible,
      percentageRemaining: calculatePercentageRemaining(ticket),
    };
  });
};
