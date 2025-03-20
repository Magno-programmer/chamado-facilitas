
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
  editingUsuario: Usuario | null;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  deletingUsuario: Usuario | null;
  resetPasswordDialog: boolean;
  setResetPasswordDialog: (open: boolean) => void;
  resetPasswordUser: Usuario | null;
  newPassword: string;
  changePasswordDialog?: boolean;
  setChangePasswordDialog?: (open: boolean) => void;
  changePasswordUser?: Usuario | null;
  currentPassword?: string;
  setCurrentPassword?: (value: string) => void;
  newChangePassword?: string;
  setNewChangePassword?: (value: string) => void;
  confirmPassword?: string;
  setConfirmPassword?: (value: string) => void;
  setores: { id: number; nome: string }[];
  onSave: (values: any, isEditing: boolean) => void;
  onDelete: () => void;
  onResetPassword: () => void;
  onChangePassword?: () => void;
  loading: boolean;
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
  changePasswordDialog = false,
  setChangePasswordDialog = () => {},
  changePasswordUser = null,
  currentPassword = "",
  setCurrentPassword = () => {},
  newChangePassword = "",
  setNewChangePassword = () => {},
  confirmPassword = "",
  setConfirmPassword = () => {},
  setores,
  onSave,
  onDelete,
  onResetPassword,
  onChangePassword = () => {},
  loading
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
      />
      
      <DeleteUsuarioDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        usuario={deletingUsuario}
        onDelete={onDelete}
        loading={loading}
      />
      
      <ResetPasswordDialog
        open={resetPasswordDialog}
        onOpenChange={setResetPasswordDialog}
        usuario={resetPasswordUser}
        password={newPassword}
        onComplete={onResetPassword}
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
        onComplete={onChangePassword}
        loading={loading}
      />
    </>
  );
};

export default UsuariosDialogs;
