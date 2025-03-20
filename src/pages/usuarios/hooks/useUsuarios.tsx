
import { useState } from 'react';
import { useEditCreateUsuario } from './useEditCreateUsuario';
import { useDeleteUsuario } from './useDeleteUsuario';
import { useResetPassword } from './useResetPassword';
import { useChangePassword } from './useChangePassword';
import { useFetchUsuarios } from './useFetchUsuarios';

export const useUsuarios = (setores: {id: number, nome: string}[]) => {
  const [loading, setLoading] = useState(false);
  const { usuarios, setUsuarios } = useFetchUsuarios(setLoading);
  
  // Edit/Create user
  const {
    isDialogOpen,
    setIsDialogOpen,
    editingUsuario,
    setEditingUsuario,
    handleOpenEdit,
    handleOpenCreate,
    handleSaveUsuario
  } = useEditCreateUsuario(usuarios, setUsuarios, setores, setLoading);
  
  // Delete user
  const {
    deleteDialogOpen,
    setDeleteDialogOpen,
    deletingUsuario,
    setDeletingUsuario,
    handleDeleteClick,
    handleDelete
  } = useDeleteUsuario(usuarios, setUsuarios, setLoading);
  
  // Reset password
  const {
    resetPasswordDialog,
    setResetPasswordDialog,
    resetPasswordUser,
    setResetPasswordUser,
    newPassword,
    setNewPassword,
    openResetPassword,
    handleResetPassword
  } = useResetPassword(setLoading);
  
  // Change password
  const {
    changePasswordDialog,
    setChangePasswordDialog,
    changePasswordUser,
    currentPassword,
    setCurrentPassword,
    newPassword: newChangePassword,
    setNewPassword: setNewChangePassword,
    confirmPassword,
    setConfirmPassword,
    openChangePassword,
    handleChangePassword
  } = useChangePassword(setLoading);

  return {
    usuarios,
    loading,
    handleOpenEdit,
    handleOpenCreate,
    handleSaveUsuario,
    handleDeleteClick,
    handleDelete,
    openResetPassword,
    handleResetPassword,
    openChangePassword,
    handleChangePassword,
    isDialogOpen,
    setIsDialogOpen,
    editingUsuario,
    deleteDialogOpen,
    setDeleteDialogOpen,
    deletingUsuario,
    resetPasswordDialog,
    setResetPasswordDialog,
    resetPasswordUser,
    newPassword,
    changePasswordDialog,
    setChangePasswordDialog,
    changePasswordUser,
    currentPassword,
    setCurrentPassword,
    newChangePassword,
    setNewChangePassword,
    confirmPassword,
    setConfirmPassword
  };
};
