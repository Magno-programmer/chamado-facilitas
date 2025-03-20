
import { useFetchUsuarios } from './useFetchUsuarios';
import { useEditCreateUsuario } from './useEditCreateUsuario';
import { useDeleteUsuario } from './useDeleteUsuario';
import { useResetPassword } from './useResetPassword';

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
  // Use the smaller, focused hooks
  const { usuarios, setUsuarios, loading, setLoading } = useFetchUsuarios();
  
  const { 
    isDialogOpen, setIsDialogOpen,
    editingUsuario, setEditingUsuario,
    handleOpenEdit, handleOpenCreate,
    handleSaveUsuario 
  } = useEditCreateUsuario(usuarios, setUsuarios, setores, setLoading);
  
  const {
    deleteDialogOpen, setDeleteDialogOpen,
    deletingUsuario, setDeletingUsuario,
    handleDeleteClick, handleDelete
  } = useDeleteUsuario(usuarios, setUsuarios, setLoading);
  
  const {
    resetPasswordDialog, setResetPasswordDialog,
    resetPasswordUser, setResetPasswordUser,
    newPassword, setNewPassword,
    openResetPassword, handleResetPassword
  } = useResetPassword(setLoading);

  // Return all the properties and methods from the smaller hooks
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
