import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate } from 'react-router-dom';

interface Setor {
  id: number;
  nome: string;
}

// Define form schema for validation
const setorSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres")
});

type SetorFormValues = z.infer<typeof setorSchema>;

const Setores = () => {
  const [setores, setSetores] = useState<Setor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSetor, setEditingSetor] = useState<Setor | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSetor, setDeletingSetor] = useState<Setor | null>(null);
  const { user } = useAuth();
  
  // Check if user is admin - only ADMIN can access this page
  const isAdmin = user?.role === 'ADMIN';

  // Redirect if user is not admin
  if (user && !isAdmin) {
    toast({
      title: "Acesso Restrito",
      description: "Apenas administradores podem gerenciar setores.",
      variant: "destructive",
    });
    return <Navigate to="/dashboard" replace />;
  }

  // Setup form for creating/editing sectors
  const form = useForm<SetorFormValues>({
    resolver: zodResolver(setorSchema),
    defaultValues: {
      nome: ""
    }
  });

  // Reset form and set editing setor when dialog opens/closes
  useEffect(() => {
    if (isDialogOpen) {
      if (editingSetor) {
        form.reset({ nome: editingSetor.nome });
      } else {
        form.reset({ nome: "" });
      }
    }
  }, [isDialogOpen, editingSetor, form]);

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
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os setores.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSetores();
  }, []);

  const handleOpenEdit = (setor: Setor) => {
    setEditingSetor(setor);
    setIsDialogOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingSetor(null);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (setor: Setor) => {
    setDeletingSetor(setor);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingSetor) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('setores')
        .delete()
        .eq('id', deletingSetor.id);
      
      if (error) throw error;
      
      setSetores(setores.filter(s => s.id !== deletingSetor.id));
      toast({
        title: "Setor excluído",
        description: `O setor "${deletingSetor.nome}" foi excluído com sucesso.`,
      });
      setDeleteDialogOpen(false);
      setDeletingSetor(null);
    } catch (error) {
      console.error('Erro ao excluir setor:', error);
      toast({
        title: "Erro ao excluir setor",
        description: "Não foi possível excluir o setor.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: SetorFormValues) => {
    try {
      setLoading(true);
      
      if (editingSetor) {
        // Update existing setor
        const { error } = await supabase
          .from('setores')
          .update({ nome: values.nome })
          .eq('id', editingSetor.id);
        
        if (error) throw error;
        
        setSetores(setores.map(s => 
          s.id === editingSetor.id ? { ...s, nome: values.nome } : s
        ));
        
        toast({
          title: "Setor atualizado",
          description: `O setor "${values.nome}" foi atualizado com sucesso.`,
        });
      } else {
        // Create new setor
        const { data, error } = await supabase
          .from('setores')
          .insert([{ nome: values.nome }])
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setSetores([...setores, data[0]]);
          toast({
            title: "Setor criado",
            description: `O setor "${values.nome}" foi criado com sucesso.`,
          });
        }
      }
      
      setIsDialogOpen(false);
      setEditingSetor(null);
      form.reset();
    } catch (error) {
      console.error('Erro ao salvar setor:', error);
      toast({
        title: "Erro ao salvar setor",
        description: "Não foi possível salvar o setor.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Setores</h1>
        {isAdmin && (
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Setor
          </Button>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Setores</CardTitle>
          <CardDescription>
            Visualize todos os setores da organização
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  {isAdmin && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {setores.length > 0 ? (
                  setores.map((setor) => (
                    <TableRow key={setor.id}>
                      <TableCell>{setor.id}</TableCell>
                      <TableCell className="font-medium">{setor.nome}</TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(setor)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(setor)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 3 : 2} className="text-center py-6">
                      Nenhum setor encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog for creating/editing a setor */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSetor ? 'Editar Setor' : 'Criar Novo Setor'}</DialogTitle>
            <DialogDescription>
              {editingSetor 
                ? 'Atualize as informações do setor abaixo.' 
                : 'Preencha as informações do novo setor abaixo.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Setor</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome do setor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {editingSetor ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog for deleting a setor */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o setor "{deletingSetor?.nome}"? 
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Setores;
