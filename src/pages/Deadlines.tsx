
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDeadlines, getSectors } from '@/lib/supabase';
import { Clock, Plus, Pencil, Trash2 } from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Define the deadline schema for form validation
const deadlineSchema = z.object({
  titulo: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  prazo: z.string().min(1, "O prazo é obrigatório"),
  setorId: z.string().optional()
});

type DeadlineFormValues = z.infer<typeof deadlineSchema>;

const Deadlines = () => {
  const { data: deadlines, isLoading, error, refetch } = useQuery({
    queryKey: ['deadlines'],
    queryFn: getDeadlines,
  });

  const [sectors, setSectors] = useState<{id: number, nome: string}[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDeadline, setDeletingDeadline] = useState<any | null>(null);
  const { user } = useAuth();
  
  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN';

  // Setup form for creating/editing deadlines
  const form = useForm<DeadlineFormValues>({
    resolver: zodResolver(deadlineSchema),
    defaultValues: {
      titulo: "",
      prazo: "",
      setorId: ""
    }
  });

  // Load sectors for the dropdown
  useEffect(() => {
    const loadSectors = async () => {
      try {
        const sectorsData = await getSectors();
        setSectors(sectorsData);
      } catch (error) {
        console.error('Error loading sectors:', error);
      }
    };
    
    loadSectors();
  }, []);

  // Reset form and set editing deadline when dialog opens/closes
  useEffect(() => {
    if (isDialogOpen) {
      if (editingDeadline) {
        form.reset({ 
          titulo: editingDeadline.titulo,
          prazo: editingDeadline.prazo,
          setorId: editingDeadline.setor_id ? String(editingDeadline.setor_id) : undefined
        });
      } else {
        form.reset({ titulo: "", prazo: "", setorId: undefined });
      }
    }
  }, [isDialogOpen, editingDeadline, form]);

  const handleOpenEdit = (deadline: any) => {
    setEditingDeadline(deadline);
    setIsDialogOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingDeadline(null);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (deadline: any) => {
    setDeletingDeadline(deadline);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingDeadline) return;
    
    try {
      const { error } = await supabase
        .from('prazos')
        .delete()
        .eq('id', deletingDeadline.id);
      
      if (error) throw error;
      
      toast({
        title: "Prazo excluído",
        description: `O prazo "${deletingDeadline.titulo}" foi excluído com sucesso.`,
      });
      setDeleteDialogOpen(false);
      setDeletingDeadline(null);
      refetch();
    } catch (error) {
      console.error('Erro ao excluir prazo:', error);
      toast({
        title: "Erro ao excluir prazo",
        description: "Não foi possível excluir o prazo.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: DeadlineFormValues) => {
    try {
      const deadlineData = {
        titulo: values.titulo,
        prazo: values.prazo,
        setor_id: values.setorId ? parseInt(values.setorId) : null
      };
      
      if (editingDeadline) {
        // Update existing deadline
        const { error } = await supabase
          .from('prazos')
          .update(deadlineData)
          .eq('id', editingDeadline.id);
        
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
      
      setIsDialogOpen(false);
      setEditingDeadline(null);
      form.reset();
      refetch();
    } catch (error) {
      console.error('Erro ao salvar prazo:', error);
      toast({
        title: "Erro ao salvar prazo",
        description: "Não foi possível salvar o prazo.",
        variant: "destructive",
      });
    }
  };

  // Function to format the prazo time string to a more readable format
  const formatDeadlineTime = (prazoString: string) => {
    // The prazo string comes in a time format, likely HH:MM:SS
    // Format it to display in a more user-friendly way
    return prazoString;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Prazos
            </CardTitle>
            <CardDescription>Gerenciamento de prazos para os setores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center h-40">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-6 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-500">Erro ao carregar prazos</CardTitle>
            <CardDescription>
              Ocorreu um erro ao tentar carregar os prazos. Por favor, tente novamente mais tarde.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Prazos</h1>
        {isAdmin && (
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Prazo
          </Button>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Prazos
          </CardTitle>
          <CardDescription>Gerenciamento de prazos para os setores</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Lista de prazos para os setores</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Prazo</TableHead>
                {isAdmin && <TableHead className="text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {deadlines?.map((deadline) => (
                <TableRow key={deadline.id}>
                  <TableCell className="font-medium">{deadline.titulo}</TableCell>
                  <TableCell>
                    {deadline.setor ? (
                      <Badge variant="secondary">{deadline.setor.nome}</Badge>
                    ) : (
                      <Badge variant="outline">Todos os setores</Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDeadlineTime(deadline.prazo)}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(deadline)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(deadline)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {deadlines?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 4 : 3} className="text-center py-6 text-muted-foreground">
                    Nenhum prazo cadastrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog for creating/editing a deadline */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDeadline ? 'Editar Prazo' : 'Criar Novo Prazo'}</DialogTitle>
            <DialogDescription>
              {editingDeadline 
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
                        <SelectItem value="">Todos os setores</SelectItem>
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
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingDeadline ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog for deleting a deadline */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o prazo "{deletingDeadline?.titulo}"? 
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Deadlines;
