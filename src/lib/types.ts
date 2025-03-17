
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

// Adicionar novas interfaces para gerenciar formulários

export interface UserFormData {
  name: string;
  email: string;
  sectorId: number;
  role: UserRole;
  password?: string;
}

export interface SectorFormData {
  name: string;
}

export interface DeadlineFormData {
  title: string;
  sectorId: number;
  deadline: string;
}

export interface TicketFormData {
  title: string;
  description: string;
  sectorId: number;
  deadlineId: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}
