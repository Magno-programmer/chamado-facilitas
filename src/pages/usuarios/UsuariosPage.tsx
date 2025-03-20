
import React from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useSetores } from './hooks/useSetores';
import { useUsuarios } from './hooks/useUsuarios';
import UsuariosHeader from './components/UsuariosHeader';
import UsuariosContent from './components/UsuariosContent';
import UsuariosDialogs from './components/UsuariosDialogs';

const UsuariosPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const { setores } = useSetores();
  
  const {
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
    setConfirmPassword,
    currentUser
  } = useUsuarios(setores);

  return (
    <div className="container mx-auto py-8">
      <UsuariosHeader 
        onCreateClick={handleOpenCreate} 
        isAdmin={isAdmin} 
      />
      
      <UsuariosContent 
        usuarios={usuarios}
        loading={loading}
        isAdmin={isAdmin}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteClick}
        onResetPassword={openResetPassword}
        onChangePassword={openChangePassword}
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
