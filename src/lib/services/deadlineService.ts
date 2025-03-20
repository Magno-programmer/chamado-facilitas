
import { supabase } from '@/integrations/supabase/client';
import { Deadline } from '@/lib/types/sector.types';

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
