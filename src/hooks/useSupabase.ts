
import { useContext, createContext } from 'react';
import supabase from '@/lib/supabase';

const SupabaseContext = createContext(supabase);

export const useSupabase = () => {
  return useContext(SupabaseContext);
};

export default supabase;
