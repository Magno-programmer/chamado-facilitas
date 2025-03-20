
// Import required types
import { Sector } from './sector.types';
import { User } from './user.types';

export type TicketStatus = 'Aberto' | 'Em Andamento' | 'Concluído' | 'Atrasado';

export interface Ticket {
  id: number;
  title: string;
  description: string;
  sectorId: number;
  requesterId: string; // Already string for compatibility with Supabase
  responsibleId: string | null; // Already string for compatibility with Supabase
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
