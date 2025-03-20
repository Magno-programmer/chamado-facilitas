import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import UsuariosTable from './components/UsuariosTable';
import CreateEditUsuarioDialog from './components/CreateEditUsuarioDialog';
import DeleteUsuarioDialog from './components/DeleteUsuarioDialog';
import ResetPasswordDialog from './components/ResetPasswordDialog';
import { generateSecurePassword, hashPassword } from '@/lib/passwordUtils';

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

const UsuariosPage = () => {
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
  
  const isAdmin = user?.role === 'ADMIN';

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
        description: "Não foi possível excluir o usu��rio.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openResetPassword = (usuario: Usuario) => {
    const randomPassword = generateSecurePassword();
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
        .update({ senha_hash: hashPassword(newPassword) })
        .eq('id', resetPasswordUser.id);
      
      if (error) throw error;
      
      toast({
        title: "Senha redefinida",
        description: `A senha do usuário "${resetPasswordUser.nome}" foi redefinida com sucesso.`,
      });
      setResetPasswordDialog(false);
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

  const handleSaveUsuario = async (values: any, isEditing: boolean) => {
    try {
      setLoading(true);
      
      const userData = {
        nome: values.nome,
        email: values.email,
        setor_id: parseInt(values.setorId),
        role: values.role
      };
      
      if (isEditing && editingUsuario) {
        const updateData = { ...userData };
        if (values.senha) {
          updateData.senha_hash = values.senha;
        }
        
        const { error } = await supabase
          .from('usuarios')
          .update(updateData)
          .eq('id', editingUsuario.id);
        
        if (error) throw error;
        
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
        const newUserData = {
          ...userData,
          senha_hash: values.senha,
          id: crypto.randomUUID()
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
          <UsuariosTable 
            usuarios={usuarios}
            loading={loading}
            isAdmin={isAdmin}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteClick}
            onResetPassword={openResetPassword}
          />
        </CardContent>
      </Card>

      <CreateEditUsuarioDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        usuario={editingUsuario}
        setores={setores}
        onSave={handleSaveUsuario}
        loading={loading}
      />

      <DeleteUsuarioDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        usuario={deletingUsuario}
        onDelete={handleDelete}
        loading={loading}
      />

      <ResetPasswordDialog 
        open={resetPasswordDialog}
        onOpenChange={setResetPasswordDialog}
        usuario={resetPasswordUser}
        password={newPassword}
        onComplete={handleResetPassword}
      />
    </div>
  );
};

export default UsuariosPage;
