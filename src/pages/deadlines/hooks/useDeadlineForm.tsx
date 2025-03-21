import { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from '@/hooks/use-toast';
import { saveDeadline } from '@/lib/services/deadlineService';
import { User } from '@/lib/types/user.types';
import { Deadline } from '@/lib/types/sector.types';
import { deadlineSchema, DeadlineFormValues } from '../components/dialogs/DeadlineFormSchema';

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
  
  // Setup form for creating/editing deadlines
  const form = useForm<DeadlineFormValues>({
    resolver: zodResolver(deadlineSchema),
    defaultValues: {
      titulo: "",
      prazo: "",
      setorId: ""
    }
  });

  // Filter available sectors based on user permissions
  useEffect(() => {
    if (!user) return;
    
    // If admin, show all sectors
    if (isAdmin) {
      setAvailableSectors(sectors);
      return;
    }
    
    // If sector admin, check if they're from "Geral" sector
    const userSector = sectors.find(s => s.id === user.sectorId);
    if (isSectorAdmin && userSector) {
      if (userSector.nome === 'Geral') {
        // "Geral" sector admin can choose any sector
        setAvailableSectors(sectors);
      } else {
        // Other sector admins can only select their own sector or no sector
        setAvailableSectors([userSector]);
      }
    } else {
      // Default to empty list if user doesn't have permissions
      setAvailableSectors([]);
    }
  }, [user, sectors, isAdmin, isSectorAdmin]);

  // Reset form and set editing deadline when dialog opens/closes
  useEffect(() => {
    if (deadline) {
      form.reset({ 
        titulo: deadline.titulo,
        prazo: deadline.prazo,
        setorId: deadline.setor_id ? String(deadline.setor_id) : undefined
      });
    } else {
      // For new deadlines, preselect user's sector if they're a sector admin
      if (isSectorAdmin && !isAdmin && user) {
        const defaultSectorId = user.sectorId.toString();
        // Check if this is not a "Geral" sector admin - if it is, don't preselect
        const userSector = sectors.find(s => s.id === user.sectorId);
        if (userSector && userSector.nome !== 'Geral') {
          form.reset({ titulo: "", prazo: "", setorId: defaultSectorId });
        } else {
          form.reset({ titulo: "", prazo: "", setorId: undefined });
        }
      } else {
        form.reset({ titulo: "", prazo: "", setorId: undefined });
      }
    }
  }, [deadline, form, isSectorAdmin, isAdmin, user, sectors]);

  const onSubmit = async (values: DeadlineFormValues) => {
    try {
      // Get user's sector for validation
      const userSector = sectors.find(s => s.id === user?.sectorId);
      
      // Validate that sector admins can only create/edit deadlines for their sector
      if (isSectorAdmin && !isAdmin && userSector?.nome !== 'Geral') {
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
  // For sector admins who are not from "Geral" sector, they can only use their own sector
  const isSectorFieldDisabled = () => {
    if (!user || isAdmin) return false;
    
    if (isSectorAdmin) {
      const userSector = sectors.find(s => s.id === user.sectorId);
      return userSector?.nome !== 'Geral';
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
