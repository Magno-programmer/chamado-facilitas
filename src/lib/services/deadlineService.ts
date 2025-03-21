
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/lib/types/user.types';
import { Deadline } from '@/lib/types/sector.types';

// Get all deadlines
export const getDeadlines = async () => {
  const { data, error } = await supabase
    .from('prazos')
    .select('*, setor:setores(*)')
    .order('id', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

// Get a specific deadline by ID
export const getDeadlineById = async (id: number) => {
  const { data, error } = await supabase
    .from('prazos')
    .select('*, setor:setores(*)')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

// Create or update a deadline
export const saveDeadline = async (deadline: Partial<Deadline>, id?: number) => {
  if (id) {
    // Update existing deadline
    const { data, error } = await supabase
      .from('prazos')
      .update({
        titulo: deadline.titulo,
        prazo: deadline.prazo,
        setor_id: deadline.setor_id
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } else {
    // Create new deadline
    const { data, error } = await supabase
      .from('prazos')
      .insert({
        titulo: deadline.titulo,
        prazo: deadline.prazo,
        setor_id: deadline.setor_id
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Get deadlines based on user permissions
export const getDeadlinesForUser = async (user: User) => {
  if (!user) return [];
  
  // Admin from Geral sector can see all deadlines
  const isAdmin = user.role === 'ADMIN';
  const isSectorAdmin = user.role === 'GERENTE';
  
  // Check if user is from Geral sector
  const { data: userSector } = await supabase
    .from('setores')
    .select('nome')
    .eq('id', user.sectorId)
    .single();
  
  const isGeralSector = userSector?.nome === 'Geral';
  
  // Admins and Gerentes from Geral sector can see all deadlines
  if ((isAdmin || isSectorAdmin) && isGeralSector) {
    return getDeadlines();
  }
  
  // Get user's sector ID for filtering
  const sectorId = user.sectorId;
  
  // Query deadlines based on user's permissions
  const { data, error } = await supabase
    .from('prazos')
    .select('*, setor:setores(*)')
    .or(`setor_id.is.null,setor_id.eq.${sectorId}`)
    .order('id', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

// Check if user can manage (edit/delete) a deadline
export const canManageDeadline = async (user: User, deadline: Deadline) => {
  if (!user) return false;
  
  const isAdmin = user.role === 'ADMIN';
  const isSectorAdmin = user.role === 'GERENTE';
  
  // Check if user is from Geral sector
  const { data: userSector } = await supabase
    .from('setores')
    .select('nome')
    .eq('id', user.sectorId)
    .single();
  
  const isGeralSector = userSector?.nome === 'Geral';
  
  // Admins and Gerentes from Geral sector can manage all deadlines
  if ((isAdmin || isSectorAdmin) && isGeralSector) {
    return true;
  }
  
  // For specific sector admins/managers
  if (isAdmin || isSectorAdmin) {
    // They can manage deadlines from their sector or with no sector assigned
    return deadline.setor_id === null || deadline.setor_id === user.sectorId;
  }
  
  // Regular users can't manage deadlines
  return false;
};
