
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
  deadline: any | null;
  sectors: { id: number; nome: string }[];
  onSuccess: () => void;
}

const CreateEditDeadlineDialog = ({ 
  open, 
  onOpenChange, 
  deadline, 
  sectors, 
  onSuccess 
}: CreateEditDeadlineDialogProps) => {
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
        form.reset({ titulo: "", prazo: "", setorId: undefined });
      }
    }
  }, [open, deadline, form]);

  const onSubmit = async (values: DeadlineFormValues) => {
    try {
      const deadlineData = {
        titulo: values.titulo,
        prazo: values.prazo,
        setor_id: values.setorId ? parseInt(values.setorId) : null
      };
      
      if (deadline) {
        // Update existing deadline
        const { error } = await supabase
          .from('prazos')
          .update(deadlineData)
          .eq('id', deadline.id);
        
        if (error) throw error;
        
        toast({
          title: "Prazo atualizado",
          description: `O prazo "${values.titulo}" foi atualizado com sucesso.`,
        });
      } else {
        // Create new deadline
        const { error } = await supabase
          .from('prazos')
          .insert([deadlineData])
          .select();
        
        if (error) throw error;
        
        toast({
          title: "Prazo criado",
          description: `O prazo "${values.titulo}" foi criado com sucesso.`,
        });
      }
      
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
                  <FormLabel>Setor (opcional)</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um setor (ou deixe em branco para todos)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">Todos os setores</SelectItem>
                      {sectors.map((sector) => (
                        <SelectItem key={sector.id} value={String(sector.id)}>
                          {sector.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
