
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Copy, Key } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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

// Define form schema for validation
const usuarioSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  setorId: z.string().min(1, "Setor é obrigatório"),
  role: z.string().min(1, "Função é obrigatória"),
  senha: z.string().optional()
});

type UsuarioFormValues = z.infer<typeof usuarioSchema>;

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingUsuario, setDeletingUsuario] = useState<Usuario | null>(null);
  const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<Usuario | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [setores, setSetores] = useState<{id: number, nome: string}[]>([]);
  const { user } = useAuth();
  
  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN';

  // Setup form for creating/editing users
  const form = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      nome: "",
      email: "",
      setorId: "",
      role: "",
      senha: ""
    }
  });

  // Load setores for dropdown
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

  // Reset form and set editing user when dialog opens/closes
  useEffect(() => {
    if (isDialogOpen) {
      if (editingUsuario) {
        form.reset({
          nome: editingUsuario.nome,
          email: editingUsuario.email,
          setorId: String(editingUsuario.setor?.id || ""),
          role: editingUsuario.role,
          senha: ""
        });
      } else {
        form.reset({
          nome: "",
          email: "",
          setorId: "",
          role: "CLIENT",
          senha: ""
        });
      }
    }
  }, [isDialogOpen, editingUsuario, form]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
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
      }
    };

    fetchUsuarios();
  }, []);

  const handleOpenEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setIsDialogOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingUsuario(null);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (usuario: Usuario) => {
    setDeletingUsuario(usuario);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingUsuario) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', deletingUsuario.id);
      
      if (error) throw error;
      
      setUsuarios(usuarios.filter(u => u.id !== deletingUsuario.id));
      toast({
        title: "Usuário excluído",
        description: `O usuário "${deletingUsuario.nome}" foi excluído com sucesso.`,
      });
      setDeleteDialogOpen(false);
      setDeletingUsuario(null);
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: "Erro ao excluir usuário",
        description: "Não foi possível excluir o usuário.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openResetPassword = (usuario: Usuario) => {
    // Generate random password
    const randomPassword = Math.random().toString(36).slice(-8);
    setNewPassword(randomPassword);
    setResetPasswordUser(usuario);
    setResetPasswordDialog(true);
  };

  const handleResetPassword = async () => {
    if (!resetPasswordUser || !newPassword) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('usuarios')
        .update({ senha_hash: newPassword })
        .eq('id', resetPasswordUser.id);
      
      if (error) throw error;
      
      toast({
        title: "Senha redefinida",
        description: `A senha do usuário "${resetPasswordUser.nome}" foi redefinida com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      toast({
        title: "Erro ao redefinir senha",
        description: "Não foi possível redefinir a senha.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newPassword);
    toast({
      title: "Senha copiada",
      description: "A senha foi copiada para a área de transferência.",
    });
  };

  const onSubmit = async (values: UsuarioFormValues) => {
    try {
      setLoading(true);
      
      const userData = {
        nome: values.nome,
        email: values.email,
        setor_id: parseInt(values.setorId),
        role: values.role
      };
      
      if (editingUsuario) {
        // Update existing user
        const updateData = { ...userData };
        if (values.senha) {
          // @ts-ignore - Add senha_hash if provided
          updateData.senha_hash = values.senha;
        }
        
        const { error } = await supabase
          .from('usuarios')
          .update(updateData)
          .eq('id', editingUsuario.id);
        
        if (error) throw error;
        
        // Update local state
        setUsuarios(usuarios.map(u => {
          if (u.id === editingUsuario.id) {
            return {
              ...u,
              nome: values.nome,
              email: values.email,
              role: values.role,
              setor: {
                id: parseInt(values.setorId),
                nome: setores.find(s => s.id === parseInt(values.setorId))?.nome || ''
              }
            };
          }
          return u;
        }));
        
        toast({
          title: "Usuário atualizado",
          description: `O usuário "${values.nome}" foi atualizado com sucesso.`,
        });
      } else {
        // Create new user
        if (!values.senha) {
          throw new Error("A senha é obrigatória para criar um novo usuário");
        }
        
        // Add senha_hash for new user
        const newUserData = {
          ...userData,
          senha_hash: values.senha,
          id: crypto.randomUUID() // Generate a UUID for the user ID
        };
        
        const { data, error } = await supabase
          .from('usuarios')
          .insert([newUserData])
          .select(`
            *,
            setor:setores(id, nome)
          `);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setUsuarios([...usuarios, data[0]]);
          toast({
            title: "Usuário criado",
            description: `O usuário "${values.nome}" foi criado com sucesso.`,
          });
        }
      }
      
      setIsDialogOpen(false);
      setEditingUsuario(null);
      form.reset();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast({
        title: "Erro ao salvar usuário",
        description: error instanceof Error ? error.message : "Não foi possível salvar o usuário.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Usuários</h1>
        {isAdmin && (
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            Visualize todos os usuários do sistema
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
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Função</TableHead>
                  {isAdmin && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.length > 0 ? (
                  usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell>{usuario.id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{usuario.nome.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{usuario.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>{usuario.setor?.nome || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={usuario.role === "ADMIN" ? "destructive" : 
                                      usuario.role === "Gerente" ? "default" : "secondary"}>
                          {usuario.role}
                        </Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openResetPassword(usuario)}>
                              <Key className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(usuario)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(usuario)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-6">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog for creating/editing a user */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUsuario ? 'Editar Usuário' : 'Criar Novo Usuário'}</DialogTitle>
            <DialogDescription>
              {editingUsuario 
                ? 'Atualize as informações do usuário abaixo.' 
                : 'Preencha as informações do novo usuário abaixo.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemplo.com" {...field} />
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
                    <FormLabel>Setor</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um setor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {setores.map((setor) => (
                          <SelectItem key={setor.id} value={String(setor.id)}>
                            {setor.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Função</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma função" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ADMIN">Administrador</SelectItem>
                        <SelectItem value="Gerente">Gerente</SelectItem>
                        <SelectItem value="CLIENT">Usuário Comum</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{editingUsuario ? 'Nova Senha (opcional)' : 'Senha'}</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder={editingUsuario ? "Deixe em branco para manter a senha atual" : "Digite a senha"} 
                        {...field} 
                      />
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
                  {editingUsuario ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog for deleting a user */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o usuário "{deletingUsuario?.nome}"? 
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

      {/* Dialog for resetting password */}
      <Dialog open={resetPasswordDialog} onOpenChange={setResetPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redefinir Senha</DialogTitle>
            <DialogDescription>
              Nova senha para o usuário "{resetPasswordUser?.nome}".
              Esta senha será exibida apenas uma vez!
            </DialogDescription>
          </DialogHeader>
          <div className="bg-secondary p-3 rounded-md flex justify-between items-center">
            <code className="font-mono text-lg">{newPassword}</code>
            <Button variant="ghost" size="icon" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Após fechar esta janela, a senha não poderá ser recuperada.
            Certifique-se de copiá-la ou anotá-la.
          </p>
          <DialogFooter>
            <Button onClick={() => {
              handleResetPassword();
              setResetPasswordDialog(false);
            }}>
              Concluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Usuarios;
