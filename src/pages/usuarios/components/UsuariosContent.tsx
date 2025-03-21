
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import UsuarioTableRow from './UsuarioTableRow';
import EmptyUsersRow from './EmptyUsersRow';
import LoadingSpinner from './LoadingSpinner';
import { User } from '@/lib/types/user.types';

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
  onEdit: (usuario: Usuario) => void;
  onDelete: (usuario: Usuario) => void;
  onResetPassword: (usuario: Usuario) => void;
  onChangePassword: (usuario: Usuario) => void;
  isAdmin: boolean;
  currentUser: User | null;
}

const UsuariosContent = ({
  usuarios,
  loading,
  onEdit,
  onDelete,
  onResetPassword,
  onChangePassword,
  isAdmin,
  currentUser
}: UsuariosContentProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Função</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.length === 0 ? (
                <EmptyUsersRow />
              ) : (
                usuarios.map(usuario => (
                  <UsuarioTableRow
                    key={usuario.id}
                    usuario={usuario}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onResetPassword={onResetPassword}
                    onChangePassword={onChangePassword}
                    isAdmin={isAdmin}
                  />
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default UsuariosContent;
