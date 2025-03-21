import React, { useState } from 'react';
import { generateSecurePassword } from '@/lib/passwordUtils';
import { useAuth } from '@/hooks/useAuth';
import { useFetchUsuarios } from './hooks/useFetchUsuarios';
import { useSetores } from './hooks/useSetores';
import { useEditCreateUsuario } from './hooks/useEditCreateUsuario';
import { useDeleteUsuario } from './hooks/useDeleteUsuario';
import { useResetPassword } from './hooks/useResetPassword';
import { useChangePassword } from './hooks/useChangePassword';
import UsuariosHeader from './components/UsuariosHeader';
import UsuariosContent from './components/UsuariosContent';
import UsuariosDialogs from './components/UsuariosDialogs';
import { Navigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const UsuariosPage = () => {
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useAuth();
  
  // Check if user is admin - only ADMIN can access this page
  const isAdmin = currentUser?.role === 'ADMIN';

  // Redirect if user is not admin
  if (currentUser && !isAdmin) {
    toast({
      title: "Acesso Restrito",
      description: "Apenas administradores podem gerenciar usuários.",
      variant: "destructive",
    });
    return <Navigate to="/dashboard" replace />;
  }

  // Various hooks for user management
  const { usuarios, setUsuarios } = useFetchUsuarios();
  const { setores } = useSetores();
  
  const { 
    isDialogOpen, 
    setIsDialogOpen, 
    editingUsuario, 
    handleOpenEdit, 
    handleOpenCreate, 
    handleSaveUsuario 
  } = useEditCreateUsuario(usuarios, setUsuarios, setores, setLoading);
  
  const {
    deleteDialogOpen,
    setDeleteDialogOpen,
    deletingUsuario,
    handleDeleteClick,
    handleDelete
  } = useDeleteUsuario(usuarios, setUsuarios, setLoading);
  
  const {
    resetPasswordDialog,
    setResetPasswordDialog,
    resetPasswordUser,
    newPassword,
    handleResetPasswordClick,
    handleResetPassword
  } = useResetPassword(setLoading);
  
  const {
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
  } = useChangePassword(setLoading);

  return (
    <div className="container mx-auto py-8">
      <UsuariosHeader 
        onCreateClick={handleOpenCreate} 
        isAdmin={isAdmin} 
      />
      
      <UsuariosContent 
        usuarios={usuarios} 
        loading={loading} 
        onEdit={handleOpenEdit} 
        onDelete={handleDeleteClick} 
        onResetPassword={handleResetPasswordClick}
        onChangePassword={handleChangePasswordClick}
        isAdmin={isAdmin}
        currentUser={currentUser}
      />
      
      <UsuariosDialogs
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        editingUsuario={editingUsuario}
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        deletingUsuario={deletingUsuario}
        resetPasswordDialog={resetPasswordDialog}
        setResetPasswordDialog={setResetPasswordDialog}
        resetPasswordUser={resetPasswordUser}
        newPassword={newPassword}
        changePasswordDialog={changePasswordDialog}
        setChangePasswordDialog={setChangePasswordDialog}
        changePasswordUser={changePasswordUser}
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newChangePassword={newChangePassword}
        setNewChangePassword={setNewChangePassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        setores={setores}
        onSave={handleSaveUsuario}
        onDelete={handleDelete}
        onResetPassword={handleResetPassword}
        onChangePassword={handleChangePassword}
        loading={loading}
        currentUser={currentUser}
      />
    </div>
  );
};

export default UsuariosPage;
