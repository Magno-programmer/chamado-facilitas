
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Initialize the Supabase client
const supabaseUrl = 'https://ryskqkqgjvzcloibkykl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5c2txa3FnanZ6Y2xvaWJreWtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYxMjQ0MzEsImV4cCI6MjAzMTcwMDQzMX0.yQtVTQnFWPgvJsvUkRUYiVrJRExDO24kXW4OtM3uBJI'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Helper functions for auth
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// User profile functions
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

// Tickets (chamados) functions
export const getTickets = async () => {
  const { data, error } = await supabase
    .from('chamados')
    .select(`
      *,
      setor:setores(*),
      solicitante:usuarios!chamados_solicitante_id_fkey(*),
      responsavel:usuarios!chamados_responsavel_id_fkey(*)
    `)
    .order('data_criacao', { ascending: false })
  
  if (error) throw error
  return data
}

export const getTicketById = async (id: number) => {
  const { data, error } = await supabase
    .from('chamados')
    .select(`
      *,
      setor:setores(*),
      solicitante:usuarios!chamados_solicitante_id_fkey(*),
      responsavel:usuarios!chamados_responsavel_id_fkey(*)
    `)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export const createTicket = async (ticket: Database['public']['Tables']['chamados']['Insert']) => {
  const { data, error } = await supabase
    .from('chamados')
    .insert(ticket)
    .select()
  
  if (error) throw error
  return data[0]
}

export const updateTicket = async (id: number, updates: Database['public']['Tables']['chamados']['Update']) => {
  const { data, error } = await supabase
    .from('chamados')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

// Sectors (setores) functions
export const getSectors = async () => {
  const { data, error } = await supabase
    .from('setores')
    .select('*')
    .order('nome')
  
  if (error) throw error
  return data
}

// Deadlines (prazos) functions
export const getDeadlines = async () => {
  const { data, error } = await supabase
    .from('prazos')
    .select(`
      *,
      setor:setores(*)
    `)
  
  if (error) throw error
  return data
}

// Statistics for dashboard
export const getTicketStats = async () => {
  // Get all tickets
  const { data: tickets, error } = await supabase
    .from('chamados')
    .select(`
      *,
      setor:setores(*)
    `)
  
  if (error) throw error
  
  // Get all sectors
  const { data: sectors } = await supabase
    .from('setores')
    .select('*')
  
  if (!tickets || !sectors) {
    return {
      totalTickets: 0,
      openTickets: 0,
      inProgressTickets: 0,
      completedTickets: 0,
      lateTickets: 0,
      ticketsBySector: []
    }
  }
  
  // Calculate statistics
  const stats = {
    totalTickets: tickets.length,
    openTickets: tickets.filter(t => t.status === 'Aberto').length,
    inProgressTickets: tickets.filter(t => t.status === 'Em Andamento').length,
    completedTickets: tickets.filter(t => t.status === 'Concluído').length,
    lateTickets: tickets.filter(t => t.status === 'Atrasado').length,
    ticketsBySector: sectors.map(sector => ({
      sectorId: sector.id,
      sectorName: sector.nome,
      count: tickets.filter(t => t.setor_id === sector.id).length
    }))
  }
  
  return stats
}
