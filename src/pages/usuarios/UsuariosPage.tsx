
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
    isDialogOpen,
    setIsDialogOpen,
    editingUsuario,
    deleteDialogOpen,
    setDeleteDialogOpen,
    deletingUsuario,
    resetPasswordDialog,
    setResetPasswordDialog,
    resetPasswordUser,
    newPassword
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
        setores={setores}
        onSave={handleSaveUsuario}
        onDelete={handleDelete}
        onResetPassword={handleResetPassword}
        loading={loading}
      />
    </div>
  );
};

export default UsuariosPage;
