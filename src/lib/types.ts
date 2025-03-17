
export type UserRole = 'ADMIN' | 'CLIENT';

export interface User {
  id: number;
  name: string;
  email: string;
  sectorId: number;
  role: UserRole;
}

export interface Sector {
  id: number;
  name: string;
}

export interface Deadline {
  id: number;
  title: string;
  sectorId: number;
  deadline: string; // ISO duration string
}

export type TicketStatus = 'Aberto' | 'Em Andamento' | 'Concluído' | 'Atrasado';

export interface Ticket {
  id: number;
  title: string;
  description: string;
  sectorId: number;
  requesterId: number;
  responsibleId: number | null;
  status: TicketStatus;
  createdAt: string; // ISO date string
  deadline: string; // ISO date string
}

export interface TicketWithDetails extends Ticket {
  sector: Sector;
  requester: User;
  responsible: User | null;
  percentageRemaining: number;
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  completedTickets: number;
  lateTickets: number;
  ticketsBySector: {
    sectorId: number;
    sectorName: string;
    count: number;
  }[];
}
