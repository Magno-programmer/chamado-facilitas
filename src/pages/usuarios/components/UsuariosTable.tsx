
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import UsuarioTableRow from './UsuarioTableRow';
import EmptyUsersRow from './EmptyUsersRow';
import LoadingSpinner from './LoadingSpinner';

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

interface UsuariosTableProps {
  usuarios: Usuario[];
  loading: boolean;
  isAdmin: boolean;
  onEdit: (usuario: Usuario) => void;
  onDelete: (usuario: Usuario) => void;
  onResetPassword: (usuario: Usuario) => void;
}

const UsuariosTable = ({ 
  usuarios, 
  loading, 
  isAdmin, 
  onEdit, 
  onDelete, 
  onResetPassword 
}: UsuariosTableProps) => {
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Usuário</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Setor</TableHead>
          <TableHead>Função</TableHead>
          {isAdmin && <TableHead className="text-right">Ações</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {usuarios.length > 0 ? (
          usuarios.map((usuario) => (
            <UsuarioTableRow
              key={usuario.id}
              usuario={usuario}
              isAdmin={isAdmin}
              onEdit={onEdit}
              onDelete={onDelete}
              onResetPassword={onResetPassword}
            />
          ))
        ) : (
          <EmptyUsersRow colSpan={isAdmin ? 6 : 5} />
        )}
      </TableBody>
    </Table>
  );
};

export default UsuariosTable;
