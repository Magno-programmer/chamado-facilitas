
import { supabase } from '@/integrations/supabase/client';
import type { User } from './types';
import type { Database } from '@/integrations/supabase/types';
import { hashPassword, verifyPassword, createSecureHash } from './passwordUtils';

/**
 * Updates the user's password hash in the database using a UUID-like hash pattern
 * @param userId The ID of the user to update
 * @param password The password to rehash and store
 * @returns Promise<boolean> True if successful, false otherwise
 */
async function updatePasswordHash(userId: string, password: string): Promise<boolean> {
  try {
    // Generate a new hash using the Web Crypto API with UUID-like format
    const newHash = await createSecureHash(password);
    
    console.log('Generated new UUID-like hash:', newHash);
    
    const { error } = await supabase
      .from('usuarios')
      .update({ senha_hash: newHash })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating password hash:', error);
      return false;
    }
    
    console.log('Password hash updated successfully for user ID:', userId);
    return true;
  } catch (error) {
    console.error('Error in updatePasswordHash:', error);
    return false;
  }
}

// Custom login function that uses the usuarios table
export const customSignIn = async (email: string, password: string): Promise<User | null> => {
  try {
    console.log('Attempting login with email:', email);
    
    // We don't store plain passwords in the database, so we can only query by email
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) {
      console.error('Error fetching user:', error);
      return null;
    }
    
    console.log('Found user with email:', email);
    
    // Verify the password against the hashed value in the database
    if (!verifyPassword(password, data.senha_hash)) {
      console.error('Invalid password');
      console.log('Provided password hash:', hashPassword(password));
      console.log('Stored password hash:', data.senha_hash);
      return null;
    }
    
    console.log('Password verified successfully');
    
    // After successful verification, update the password hash using the improved algorithm
    // This refreshes the hash without changing the password
    await updatePasswordHash(data.id, password);
    
    // Map the database user to our User type
    const user: User = {
      id: data.id,
      name: data.nome,
      email: data.email,
      sectorId: data.setor_id,
      role: data.role === 'ADMIN' ? 'ADMIN' : 'CLIENT'
    };
    
    return user;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

// We'll keep these functions for compatibility, but they'll use our custom implementation
export const signIn = customSignIn;

export const signOut = async () => {
  // Since we're not using Supabase Auth, this is just a placeholder
  // In a real app, you might want to clear session storage or cookies
  return true;
}

// User profile functions
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
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
