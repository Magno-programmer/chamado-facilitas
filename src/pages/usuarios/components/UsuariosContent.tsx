
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import UsuariosTable from './UsuariosTable';
import LoadingSpinner from './LoadingSpinner';
import EmptyUsersRow from './EmptyUsersRow';

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

interface UsuariosContentProps {
  usuarios: Usuario[];
  loading: boolean;
  isAdmin: boolean;
  onEdit: (usuario: Usuario) => void;
  onDelete: (usuario: Usuario) => void;
  onResetPassword: (usuario: Usuario) => void;
  onChangePassword?: (usuario: Usuario) => void;
}

const UsuariosContent = ({ 
  usuarios, 
  loading, 
  isAdmin,
  onEdit,
  onDelete,
  onResetPassword,
  onChangePassword
}: UsuariosContentProps) => {
  return (
    <Card className="mt-6">
      <CardContent className="p-0">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <UsuariosTable
            usuarios={usuarios}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={onDelete}
            onResetPassword={onResetPassword}
            onChangePassword={onChangePassword}
            emptyComponent={<EmptyUsersRow />}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default UsuariosContent;
