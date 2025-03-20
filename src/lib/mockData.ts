
import { User } from './types/user.types';
import { Sector } from './types/sector.types';
import { Deadline } from './types/sector.types';
import { Ticket, TicketStatus } from './types/ticket.types';
import { DashboardStats } from './types/dashboard.types';

export const mockUsers: User[] = [
  {
    id: "1",
    name: 'Admin User',
    email: 'admin@example.com',
    sectorId: 1,
    role: 'ADMIN',
  },
  {
    id: "2",
    name: 'Client User',
    email: 'client@example.com',
    sectorId: 2,
    role: 'CLIENT',
  },
  {
    id: "3",
    name: 'Support Team Member',
    email: 'support@example.com',
    sectorId: 3,
    role: 'ADMIN',
  },
];

export const mockSectors: Sector[] = [
  { id: 1, name: 'Administração' },
  { id: 2, name: 'Recursos Humanos' },
  { id: 3, name: 'TI' },
  { id: 4, name: 'Financeiro' },
];

export const mockDeadlines: Deadline[] = [
  { id: 1, title: 'Urgente', sectorId: 3, deadline: 'PT24H' }, // 24 hours
  { id: 2, title: 'Alta Prioridade', sectorId: 3, deadline: 'P3D' }, // 3 days
  { id: 3, title: 'Normal', sectorId: 2, deadline: 'P7D' }, // 7 days
  { id: 4, title: 'Baixa Prioridade', sectorId: 2, deadline: 'P14D' }, // 14 days
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
    sectorId: mockSectors[Math.floor(Math.random() * mockSectors.length)].id,
    requesterId: mockUsers[Math.floor(Math.random() * mockUsers.length)].id,
    responsibleId: Math.random() > 0.3 ? mockUsers[Math.floor(Math.random() * mockUsers.length)].id : null,
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
  ticketsBySector: mockSectors.map(sector => ({
    sectorId: sector.id,
    sectorName: sector.name,
    count: mockTickets.filter(t => t.sectorId === sector.id).length,
  })),
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
  
  const sector = mockSectors.find(s => s.id === ticket.sectorId);
  const requester = mockUsers.find(u => u.id === ticket.requesterId);
  const responsible = ticket.responsibleId 
    ? mockUsers.find(u => u.id === ticket.responsibleId) 
    : null;
  
  return {
    ...ticket,
    sector,
    requester,
    responsible,
    percentageRemaining: calculatePercentageRemaining(ticket),
  };
};

export const mockLogin = (email: string, password: string): User | null => {
  const user = mockUsers.find(u => u.email === email);
  return user || null;
};

export const getEnrichedTickets = () => {
  return mockTickets.map(ticket => {
    const sector = mockSectors.find(s => s.id === ticket.sectorId);
    const requester = mockUsers.find(u => u.id === ticket.requesterId);
    const responsible = ticket.responsibleId 
      ? mockUsers.find(u => u.id === ticket.responsibleId) 
      : null;
    
    return {
      ...ticket,
      sector,
      requester,
      responsible,
      percentageRemaining: calculatePercentageRemaining(ticket),
    };
  });
};
