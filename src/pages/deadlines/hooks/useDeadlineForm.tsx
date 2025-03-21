
import { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from '@/hooks/use-toast';
import { saveDeadline } from '@/lib/services/deadlineService';
import { User } from '@/lib/types/user.types';
import { Deadline } from '@/lib/types/sector.types';
import { deadlineSchema, DeadlineFormValues } from '../components/dialogs/DeadlineFormSchema';
import { supabase } from '@/integrations/supabase/client';

interface UseDeadlineFormProps {
  deadline: Deadline | null;
  sectors: { id: number; nome: string }[];
  user: User | null;
  isSectorAdmin: boolean;
  isAdmin: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

export const useDeadlineForm = ({
  deadline,
  sectors,
  user,
  isSectorAdmin,
  isAdmin,
  onSuccess,
  onClose
}: UseDeadlineFormProps) => {
  const [availableSectors, setAvailableSectors] = useState<{ id: number; nome: string }[]>([]);
  const [isGeralSector, setIsGeralSector] = useState(false);
  
  // Setup form for creating/editing deadlines
  const form = useForm<DeadlineFormValues>({
    resolver: zodResolver(deadlineSchema),
    defaultValues: {
      titulo: "",
      prazo: "",
      setorId: ""
    }
  });

  // Check if user is from "Geral" sector
  useEffect(() => {
    if (!user) return;
    
    const checkSector = async () => {
      const { data, error } = await supabase
        .from('setores')
        .select('nome')
        .eq('id', user.sectorId)
        .single();
      
      if (error) return;
      setIsGeralSector(data?.nome === 'Geral');
    };
    
    checkSector();
  }, [user]);
  
  // Filter available sectors based on user permissions
  useEffect(() => {
    if (!user) return;
    
    // If admin or sector admin from "Geral", show all sectors
    if ((isAdmin || isSectorAdmin) && isGeralSector) {
      setAvailableSectors(sectors);
      return;
    }
    
    // For admin or sector admin from specific sector
    if ((isAdmin || isSectorAdmin)) {
      // Get user's sector
      const userSector = sectors.find(s => s.id === user.sectorId);
      if (userSector) {
        // They can only select their own sector
        setAvailableSectors([userSector]);
      } else {
        setAvailableSectors([]);
      }
    } else {
      // Default to empty list if user doesn't have permissions
      setAvailableSectors([]);
    }
  }, [user, sectors, isAdmin, isSectorAdmin, isGeralSector]);

  // Reset form and set editing deadline when dialog opens/closes
  useEffect(() => {
    if (deadline) {
      form.reset({ 
        titulo: deadline.titulo,
        prazo: deadline.prazo,
        setorId: deadline.setor_id ? String(deadline.setor_id) : undefined
      });
    } else {
      // For new deadlines, preselect user's sector if they're not from "Geral"
      if ((isAdmin || isSectorAdmin) && !isGeralSector && user) {
        const defaultSectorId = user.sectorId.toString();
        form.reset({ titulo: "", prazo: "", setorId: defaultSectorId });
      } else {
        form.reset({ titulo: "", prazo: "", setorId: undefined });
      }
    }
  }, [deadline, form, isAdmin, isSectorAdmin, isGeralSector, user]);

  const onSubmit = async (values: DeadlineFormValues) => {
    try {
      // Validate that sector-specific admins/managers can only create/edit deadlines for their sector
      if ((isAdmin || isSectorAdmin) && !isGeralSector) {
        const selectedSectorId = values.setorId ? parseInt(values.setorId) : null;
        
        // If trying to set a sector that's not their own
        if (selectedSectorId !== null && selectedSectorId !== user?.sectorId) {
          toast({
            title: "Erro ao salvar prazo",
            description: "Você só pode criar prazos para o seu próprio setor ou sem setor definido.",
            variant: "destructive",
          });
          return;
        }
      }
      
      const deadlineData: Partial<Deadline> = {
        titulo: values.titulo,
        prazo: values.prazo,
        setor_id: values.setorId === "all_sectors" ? null : (values.setorId ? parseInt(values.setorId) : null)
      };
      
      await saveDeadline(deadlineData, deadline?.id);
      
      toast({
        title: deadline ? "Prazo atualizado" : "Prazo criado",
        description: `O prazo "${values.titulo}" foi ${deadline ? "atualizado" : "criado"} com sucesso.`,
      });
      
      onClose();
      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar prazo:', error);
      toast({
        title: "Erro ao salvar prazo",
        description: "Não foi possível salvar o prazo.",
        variant: "destructive",
      });
    }
  };

  // Determine if the sector field should be disabled
  // For non-Geral sector admins/managers, they can only use their own sector
  const isSectorFieldDisabled = () => {
    if (!user) return false;
    
    // If user is admin or sector admin but not from "Geral" sector
    // then they can only manage their own sector deadlines
    if ((isAdmin || isSectorAdmin) && !isGeralSector) {
      return true;
    }
    
    return false;
  };

  return {
    form,
    availableSectors,
    onSubmit,
    isSectorFieldDisabled
  };
};
