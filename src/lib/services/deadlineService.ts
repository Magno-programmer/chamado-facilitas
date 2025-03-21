
import { supabase } from '@/integrations/supabase/client';
import { Deadline } from '@/lib/types/sector.types';
import { User } from '@/lib/types/user.types';

// Deadlines (prazos) functions
export const getDeadlines = async (): Promise<Deadline[]> => {
  const { data, error } = await supabase
    .from('prazos')
    .select(`
      *,
      setor:setores(*)
    `);
  
  if (error) throw error;
  return data as Deadline[];
}

// Get deadlines based on user permissions
export const getDeadlinesForUser = async (user: User): Promise<Deadline[]> => {
  // For ADMIN users, return all deadlines
  if (user.role === 'ADMIN') {
    return getDeadlines();
  }
  
  // For Gerente (sector admin), check their sector
  const { data: sectorData, error: sectorError } = await supabase
    .from('setores')
    .select('nome')
    .eq('id', user.sectorId)
    .single();
  
  if (sectorError) throw sectorError;
  
  // If the sector admin belongs to "Geral" sector, they can see all deadlines
  if (sectorData && sectorData.nome === 'Geral' && user.role === 'Gerente') {
    return getDeadlines();
  }
  
  // For regular users and sector admins of specific sectors,
  // only show deadlines for their sector or with no sector (applicable to all)
  const { data, error } = await supabase
    .from('prazos')
    .select(`
      *,
      setor:setores(*)
    `)
    .or(`setor_id.eq.${user.sectorId},setor_id.is.null`);
  
  if (error) throw error;
  return data as Deadline[];
}

// Create or update a deadline
export const saveDeadline = async (deadline: Partial<Deadline>, deadlineId?: number): Promise<Deadline> => {
  // Prepare the data for insertion/update
  const deadlineData = {
    titulo: deadline.titulo,
    prazo: deadline.prazo,
    setor_id: deadline.setor_id
  };
  
  if (deadlineId) {
    // Update existing deadline
    const { data, error } = await supabase
      .from('prazos')
      .update(deadlineData)
      .eq('id', deadlineId)
      .select(`
        *,
        setor:setores(*)
      `)
      .single();
    
    if (error) throw error;
    return data as Deadline;
  } else {
    // Create new deadline
    const { data, error } = await supabase
      .from('prazos')
      .insert(deadlineData)
      .select(`
        *,
        setor:setores(*)
      `)
      .single();
    
    if (error) throw error;
    return data as Deadline;
  }
}

// Delete a deadline
export const deleteDeadline = async (deadlineId: number): Promise<void> => {
  const { error } = await supabase
    .from('prazos')
    .delete()
    .eq('id', deadlineId);
  
  if (error) throw error;
}

// Check if user can manage a specific deadline
export const canManageDeadline = async (user: User, deadline: Deadline): Promise<boolean> => {
  // Admin can manage all deadlines
  if (user.role === 'ADMIN') {
    return true;
  }
  
  // Not a Gerente role, cannot manage
  if (user.role !== 'Gerente') {
    return false;
  }
  
  // Check if user belongs to "Geral" sector
  const { data: sectorData, error: sectorError } = await supabase
    .from('setores')
    .select('nome')
    .eq('id', user.sectorId)
    .single();
  
  if (sectorError) return false;
  
  // "Geral" sector admin can manage all deadlines
  if (sectorData && sectorData.nome === 'Geral') {
    return true;
  }
  
  // Sector admin can only manage deadlines for their sector or with no sector
  return deadline.setor_id === null || deadline.setor_id === user.sectorId;
}
