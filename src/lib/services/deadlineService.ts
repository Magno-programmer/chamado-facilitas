
import { supabase } from '@/integrations/supabase/client';

// Deadlines (prazos) functions
export const getDeadlines = async () => {
  const { data, error } = await supabase
    .from('prazos')
    .select(`
      *,
      setor:setores(*)
    `);
  
  if (error) throw error;
  return data;
}
