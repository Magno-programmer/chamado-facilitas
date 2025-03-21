import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { saveDeadline } from '@/lib/services/deadlineService';
import { toast } from '@/hooks/use-toast';
import { User } from '@/lib/types/user.types';
import { Deadline } from '@/lib/types/sector.types';

// Define the deadline schema for form validation
const deadlineSchema = z.object({
  titulo: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  prazo: z.string().min(1, "O prazo é obrigatório"),
  setorId: z.string().optional()
});

type DeadlineFormValues = z.infer<typeof deadlineSchema>;

interface CreateEditDeadlineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deadline: Deadline | null;
  sectors: { id: number; nome: string }[];
  user: User | null;
  isSectorAdmin: boolean;
  onSuccess: () => void;
}

const CreateEditDeadlineDialog = ({ 
  open, 
  onOpenChange, 
  deadline, 
  sectors, 
  user,
  isSectorAdmin,
  onSuccess 
}: CreateEditDeadlineDialogProps) => {
  const [availableSectors, setAvailableSectors] = useState<{ id: number; nome: string }[]>([]);
  const isAdmin = user?.role === 'ADMIN';
  
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

  // Setup form for creating/editing deadlines
  const form = useForm<DeadlineFormValues>({
    resolver: zodResolver(deadlineSchema),
    defaultValues: {
      titulo: "",
      prazo: "",
      setorId: ""
    }
  });

  // Reset form and set editing deadline when dialog opens/closes
  useEffect(() => {
    if (open) {
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
    }
  }, [open, deadline, form, isSectorAdmin, isAdmin, user, sectors]);

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
        setor_id: values.setorId ? parseInt(values.setorId) : null
      };
      
      await saveDeadline(deadlineData, deadline?.id);
      
      toast({
        title: deadline ? "Prazo atualizado" : "Prazo criado",
        description: `O prazo "${values.titulo}" foi ${deadline ? "atualizado" : "criado"} com sucesso.`,
      });
      
      onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{deadline ? 'Editar Prazo' : 'Criar Novo Prazo'}</DialogTitle>
          <DialogDescription>
            {deadline 
              ? 'Atualize as informações do prazo abaixo.' 
              : 'Preencha as informações do novo prazo abaixo.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o título do prazo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="prazo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prazo (HH:MM)</FormLabel>
                  <FormControl>
                    <Input 
                      type="time" 
                      placeholder="00:00" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="setorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Setor {isSectorFieldDisabled() && '(determinado pelo seu setor)'}</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || undefined} 
                    defaultValue={field.value || undefined}
                    disabled={isSectorFieldDisabled()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um setor (ou deixe em branco para todos)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all_sectors">Todos os setores</SelectItem>
                      {availableSectors.map((sector) => (
                        <SelectItem key={sector.id} value={String(sector.id)}>
                          {sector.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isSectorFieldDisabled() && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Como gerente de setor, você só pode criar prazos para o seu próprio setor.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {deadline ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEditDeadlineDialog;
