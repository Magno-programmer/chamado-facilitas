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
  // First check if the user belongs to the "GERAL" sector
  const { data: sectorData, error: sectorError } = await supabase
    .from('setores')
    .select('nome')
    .eq('id', user.sectorId)
    .single();
  
  if (sectorError) throw sectorError;
  const isGeralSector = sectorData && sectorData.nome === 'GERAL';
  
  // For ADMIN users in "GERAL" sector, return all deadlines
  if (user.role === 'ADMIN' && isGeralSector) {
    return getDeadlines();
  }
  
  // For ADMIN users in specific sectors, only show deadlines for their sector
  if (user.role === 'ADMIN') {
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
  
  // For GERENTE (sector admin) of "GERAL" sector, they can see all deadlines
  if (user.role === 'GERENTE' && isGeralSector) {
    return getDeadlines();
  }
  
  // For sector admins of specific sectors, only show deadlines for their sector
  if (user.role === 'GERENTE') {
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
  
  // For regular users, only show deadlines for their sector or with no sector
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
  // Check if user belongs to "GERAL" sector
  const { data: sectorData, error: sectorError } = await supabase
    .from('setores')
    .select('nome')
    .eq('id', user.sectorId)
    .single();
  
  if (sectorError) return false;
  const isGeralSector = sectorData && sectorData.nome === 'GERAL';
  
  // "GERAL" sector admin or "GERAL" ADMIN can manage all deadlines
  if (isGeralSector && (user.role === 'ADMIN' || user.role === 'GERENTE')) {
    return true;
  }
  
  // Specific sector ADMIN or GERENTE can only manage deadlines for their sector or with no sector
  if (user.role === 'ADMIN' || user.role === 'GERENTE') {
    return deadline.setor_id === null || deadline.setor_id === user.sectorId;
  }
  
  // Regular users cannot manage deadlines
  return false;
}
