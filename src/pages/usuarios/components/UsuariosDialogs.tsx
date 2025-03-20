
import React from 'react';
import CreateEditUsuarioDialog from './CreateEditUsuarioDialog';
import DeleteUsuarioDialog from './DeleteUsuarioDialog';
import ResetPasswordDialog from './ResetPasswordDialog';

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
  setores: {id: number, nome: string}[];
  onSave: (values: any, isEditing: boolean) => Promise<void>;
  onDelete: () => Promise<void>;
  onResetPassword: () => Promise<void>;
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
  setores,
  onSave,
  onDelete,
  onResetPassword,
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
    </>
  );
};

export default UsuariosDialogs;
