
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: number
          nome: string
          email: string
          setor_id: number
          role: 'ADMIN' | 'CLIENT'
          created_at: string
        }
        Insert: {
          id?: number
          nome: string
          email: string
          setor_id: number
          role: 'ADMIN' | 'CLIENT'
          created_at?: string
        }
        Update: {
          id?: number
          nome?: string
          email?: string
          setor_id?: number
          role?: 'ADMIN' | 'CLIENT'
          created_at?: string
        }
      }
      setores: {
        Row: {
          id: number
          nome: string
          created_at: string
        }
        Insert: {
          id?: number
          nome: string
          created_at?: string
        }
        Update: {
          id?: number
          nome?: string
          created_at?: string
        }
      }
      prazos: {
        Row: {
          id: number
          titulo: string
          setor_id: number
          prazo: string // Armazenado como ISO duration string 'PT3600S'
          created_at: string
        }
        Insert: {
          id?: number
          titulo: string
          setor_id: number
          prazo: string
          created_at?: string
        }
        Update: {
          id?: number
          titulo?: string
          setor_id?: number
          prazo?: string
          created_at?: string
        }
      }
      chamados: {
        Row: {
          id: number
          titulo: string
          descricao: string
          setor_id: number
          solicitante_id: number
          responsavel_id: number | null
          status: 'Aberto' | 'Em Andamento' | 'Concluído' | 'Atrasado'
          data_criacao: string
          prazo: string
          created_at: string
        }
        Insert: {
          id?: number
          titulo: string
          descricao: string
          setor_id: number
          solicitante_id: number
          responsavel_id?: number | null
          status: 'Aberto' | 'Em Andamento' | 'Concluído' | 'Atrasado'
          data_criacao?: string
          prazo: string
          created_at?: string
        }
        Update: {
          id?: number
          titulo?: string
          descricao?: string
          setor_id?: number
          solicitante_id?: number
          responsavel_id?: number | null
          status?: 'Aberto' | 'Em Andamento' | 'Concluído' | 'Atrasado'
          data_criacao?: string
          prazo?: string
          created_at?: string
        }
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
  }
}
