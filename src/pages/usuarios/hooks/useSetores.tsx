
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useSetores = () => {
  const [setores, setSetores] = useState<{id: number, nome: string}[]>([]);
  
  useEffect(() => {
    const fetchSetores = async () => {
      try {
        const { data, error } = await supabase
          .from('setores')
          .select('*')
          .order('nome', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        setSetores(data || []);
      } catch (error) {
        console.error('Erro ao buscar setores:', error);
      }
    };

    fetchSetores();
  }, []);

  return { setores };
};
