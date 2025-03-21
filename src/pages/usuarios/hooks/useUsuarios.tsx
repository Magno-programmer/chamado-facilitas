
import { useState } from 'react';
import { useEditCreateUsuario } from './useEditCreateUsuario';
import { useDeleteUsuario } from './useDeleteUsuario';
import { useResetPassword } from './useResetPassword';
import { useChangePassword } from './useChangePassword';
import { useFetchUsuarios } from './useFetchUsuarios';
import { useSetores } from './useSetores';

export const useUsuarios = () => {
  const [loading, setLoading] = useState(false);
  
  // Fetch usuarios and setores data
  const { usuarios, setUsuarios } = useFetchUsuarios();
  const { setores } = useSetores();
  
  // Edit/Create hooks
  const { 
    isDialogOpen, 
    setIsDialogOpen, 
    editingUsuario, 
    handleOpenEdit, 
    handleOpenCreate, 
    handleSaveUsuario 
  } = useEditCreateUsuario(usuarios, setUsuarios, setores, setLoading);
  
  // Delete hooks
  const {
    deleteDialogOpen,
    setDeleteDialogOpen,
    deletingUsuario,
    handleDeleteClick,
    handleDelete
  } = useDeleteUsuario(usuarios, setUsuarios, setLoading);
  
  // Reset password hooks
  const {
    resetPasswordDialog,
    setResetPasswordDialog,
    resetPasswordUser,
    newPassword,
    setNewPassword,
    handleResetPasswordClick, // Use this instead of openResetPassword
    handleResetPassword
  } = useResetPassword(setLoading);
  
  // Change password hooks
  const {
    changePasswordDialog,
    setChangePasswordDialog,
    changePasswordUser,
    currentPassword,
    setCurrentPassword,
    newChangePassword, // Use this instead of newPassword
    setNewChangePassword, // Use this instead of setNewPassword
    confirmPassword, 
    setConfirmPassword,
    handleChangePasswordClick, // Use this instead of openChangePassword
    handleChangePassword
  } = useChangePassword(setLoading);

  return {
    // Loading state
    loading,
    setLoading,
    
    // Data
    usuarios,
    setUsuarios,
    setores,
    
    // Edit/Create
    isDialogOpen,
    setIsDialogOpen,
    editingUsuario,
    handleOpenEdit,
    handleOpenCreate,
    handleSaveUsuario,
    
    // Delete
    deleteDialogOpen,
    setDeleteDialogOpen,
    deletingUsuario,
    handleDeleteClick,
    handleDelete,
    
    // Reset Password
    resetPasswordDialog,
    setResetPasswordDialog,
    resetPasswordUser,
    newPassword,
    handleResetPasswordClick,
    handleResetPassword,
    
    // Change Password
    changePasswordDialog,
    setChangePasswordDialog,
    changePasswordUser,
    currentPassword,
    setCurrentPassword,
    newChangePassword,
    setNewChangePassword,
    confirmPassword,
    setConfirmPassword,
    handleChangePasswordClick,
    handleChangePassword
  };
};
