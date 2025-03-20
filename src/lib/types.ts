// Original types
export type UserRole = 'ADMIN' | 'CLIENT';

export interface User {
  id: string; // Changed to string for compatibility with Supabase
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

// Supabase Database Types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      chamados: {
        Row: {
          data_criacao: string
          descricao: string | null
          id: number
          prazo: string
          responsavel_id: string
          setor_id: number
          solicitante_id: string
          status: string
          titulo: string
        }
        Insert: {
          data_criacao: string
          descricao?: string | null
          id?: number
          prazo: string
          responsavel_id: string
          setor_id: number
          solicitante_id: string
          status: string
          titulo: string
        }
        Update: {
          data_criacao?: string
          descricao?: string | null
          id?: number
          prazo?: string
          responsavel_id?: string
          setor_id?: number
          solicitante_id?: string
          status?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "chamados_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chamados_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chamados_solicitante_id_fkey"
            columns: ["solicitante_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      prazos: {
        Row: {
          id: number
          prazo: string
          setor_id: number | null
          titulo: string
        }
        Insert: {
          id?: number
          prazo: string
          setor_id?: number | null
          titulo: string
        }
        Update: {
          id?: number
          prazo?: string
          setor_id?: number | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "prazos_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
        ]
      }
      setores: {
        Row: {
          id: number
          nome: string
        }
        Insert: {
          id?: number
          nome: string
        }
        Update: {
          id?: number
          nome?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          email: string
          id: string
          nome: string
          role: string
          senha_hash: string
          setor_id: number
        }
        Insert: {
          email: string
          id: string
          nome: string
          role?: string
          senha_hash: string
          setor_id: number
        }
        Update: {
          email?: string
          id?: string
          nome?: string
          role?: string
          senha_hash?: string
          setor_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
