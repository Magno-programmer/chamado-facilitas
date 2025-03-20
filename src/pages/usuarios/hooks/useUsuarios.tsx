
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
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

interface UseUsuariosReturn {
  usuarios: Usuario[];
  loading: boolean;
  setLoading: (loading: boolean) => void;
  handleOpenEdit: (usuario: Usuario) => void;
  handleOpenCreate: () => void;
  handleSaveUsuario: (values: any, isEditing: boolean) => Promise<void>;
  handleDeleteClick: (usuario: Usuario) => void;
  handleDelete: () => Promise<void>;
  openResetPassword: (usuario: Usuario) => void;
  handleResetPassword: () => Promise<void>;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  editingUsuario: Usuario | null;
  setEditingUsuario: (usuario: Usuario | null) => void;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  deletingUsuario: Usuario | null;
  setDeletingUsuario: (usuario: Usuario | null) => void;
  resetPasswordDialog: boolean;
  setResetPasswordDialog: (open: boolean) => void;
  resetPasswordUser: Usuario | null;
  setResetPasswordUser: (usuario: Usuario | null) => void;
  newPassword: string;
  setNewPassword: (password: string) => void;
}

export const useUsuarios = (setores: {id: number, nome: string}[]): UseUsuariosReturn => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingUsuario, setDeletingUsuario] = useState<Usuario | null>(null);
  const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<Usuario | null>(null);
  const [newPassword, setNewPassword] = useState("");

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
        const updateData: any = { ...userData };
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

  return {
    usuarios,
    loading,
    setLoading,
    handleOpenEdit,
    handleOpenCreate,
    handleSaveUsuario,
    handleDeleteClick,
    handleDelete,
    openResetPassword,
    handleResetPassword,
    isDialogOpen,
    setIsDialogOpen,
    editingUsuario,
    setEditingUsuario,
    deleteDialogOpen,
    setDeleteDialogOpen,
    deletingUsuario,
    setDeletingUsuario,
    resetPasswordDialog,
    setResetPasswordDialog,
    resetPasswordUser,
    setResetPasswordUser,
    newPassword,
    setNewPassword
  };
};
