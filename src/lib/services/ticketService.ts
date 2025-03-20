
import { supabase } from '@/integrations/supabase/client';
import type { Ticket } from '@/lib/types/ticket.types';
import type { Database } from '@/lib/types/database.types';

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
    .order('data_criacao', { ascending: false });
  
  if (error) throw error;
  return data;
}

export const getTicketsByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from('chamados')
    .select(`
      *,
      setor:setores(*),
      solicitante:usuarios!chamados_solicitante_id_fkey(*),
      responsavel:usuarios!chamados_responsavel_id_fkey(*)
    `)
    .eq('solicitante_id', userId)
    .order('data_criacao', { ascending: false });
  
  if (error) throw error;
  return data;
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
    .single();
  
  if (error) throw error;
  return data;
}

export const createTicket = async (ticket: Database['public']['Tables']['chamados']['Insert']) => {
  const { data, error } = await supabase
    .from('chamados')
    .insert(ticket)
    .select();
  
  if (error) throw error;
  return data[0];
}

export const updateTicket = async (id: number, updates: Database['public']['Tables']['chamados']['Update']) => {
  const { data, error } = await supabase
    .from('chamados')
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data[0];
}
