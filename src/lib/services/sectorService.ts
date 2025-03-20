
import { supabase } from '@/integrations/supabase/client';

// Sectors (setores) functions
export const getSectors = async () => {
  const { data, error } = await supabase
    .from('setores')
    .select('*')
    .order('nome');
  
  if (error) throw error;
  return data;
}
