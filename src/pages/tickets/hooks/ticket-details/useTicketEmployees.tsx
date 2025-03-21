
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { User as UserType } from '@/lib/types/user.types';
import { supabase } from '@/integrations/supabase/client';

export const useTicketEmployees = () => {
  const { toast } = useToast();
  const [sectorEmployees, setSectorEmployees] = useState<UserType[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  const loadSectorEmployees = async (sectorId: number) => {
    if (!sectorId) return;
    
    setIsLoadingEmployees(true);
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('setor_id', sectorId)
        .eq('role', 'Funcionario');
      
      if (error) throw error;
      
      const employees = data.map(emp => ({
        id: emp.id,
        name: emp.nome,
        email: emp.email,
        sectorId: emp.setor_id,
        role: emp.role as UserType['role']
      }));
      
      setSectorEmployees(employees);
    } catch (error) {
      console.error('Error loading sector employees:', error);
      toast({
        title: "Erro ao carregar funcionários",
        description: "Não foi possível carregar a lista de funcionários do setor.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  return {
    sectorEmployees,
    isLoadingEmployees,
    loadSectorEmployees
  };
};
