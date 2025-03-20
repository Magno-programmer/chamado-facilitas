
import React from 'react';
import CreateEditUsuarioDialog from './CreateEditUsuarioDialog';
import DeleteUsuarioDialog from './DeleteUsuarioDialog';
import ResetPasswordDialog from './ResetPasswordDialog';
import ChangePasswordDialog from './ChangePasswordDialog';

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

interface UsuariosDialogsProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  editingUsuario: any;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  deletingUsuario: any;
  resetPasswordDialog: boolean;
  setResetPasswordDialog: (open: boolean) => void;
  resetPasswordUser: any;
  newPassword: string;
  changePasswordDialog: boolean;
  setChangePasswordDialog: (open: boolean) => void;
  changePasswordUser: any;
  currentPassword: string;
  setCurrentPassword: (password: string) => void;
  newChangePassword: string;
  setNewChangePassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  setores: any[];
  onSave: (values: any, isEditing: boolean) => void;
  onDelete: (id: string) => void;
  onResetPassword: (id: string, newPassword: string) => void;
  onChangePassword: (id: string, currentPassword: string, newPassword: string) => void;
  loading: boolean;
  currentUser?: any;
}

const UsuariosDialogs = ({
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
  setores,
  onSave,
  onDelete,
  onResetPassword,
  onChangePassword,
  loading,
  currentUser
}: UsuariosDialogsProps) => {
  return (
    <>
      <CreateEditUsuarioDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        usuario={editingUsuario}
        setores={setores}
        onSave={onSave}
        loading={loading}
        currentUser={currentUser}
      />
      
      <DeleteUsuarioDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        usuario={deletingUsuario}
        onDelete={() => deletingUsuario && onDelete(deletingUsuario.id)}
        loading={loading}
      />
      
      <ResetPasswordDialog
        open={resetPasswordDialog}
        onOpenChange={setResetPasswordDialog}
        usuario={resetPasswordUser}
        password={newPassword}
        onComplete={() => resetPasswordUser && onResetPassword(resetPasswordUser.id, newPassword)}
      />
      
      <ChangePasswordDialog
        open={changePasswordDialog}
        onOpenChange={setChangePasswordDialog}
        usuario={changePasswordUser}
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newPassword={newChangePassword}
        setNewPassword={setNewChangePassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        onComplete={() => changePasswordUser && onChangePassword(changePasswordUser.id, currentPassword, newChangePassword)}
        loading={loading}
      />
    </>
  );
};

export default UsuariosDialogs;
