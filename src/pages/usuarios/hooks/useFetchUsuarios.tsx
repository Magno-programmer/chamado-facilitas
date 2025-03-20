
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: string;
  setor: {
    id: number;
    nome: string;
  };
}

export const useFetchUsuarios = (setExternalLoading?: (loading: boolean) => void) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        // If external loading state setter is provided, use it
        if (setExternalLoading) {
          setExternalLoading(true);
        }
        
        const { data, error } = await supabase
          .from('usuarios')
          .select(`
            *,
            setor:setores(id, nome)
          `);
        
        if (error) {
          throw error;
        }
        
        setUsuarios(data || []);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os usuários.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        // If external loading state setter is provided, use it
        if (setExternalLoading) {
          setExternalLoading(false);
        }
      }
    };

    fetchUsuarios();
  }, [setExternalLoading]);

  return { usuarios, setUsuarios, loading, setLoading };
};
