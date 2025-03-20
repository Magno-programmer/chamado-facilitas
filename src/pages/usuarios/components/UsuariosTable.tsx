
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import UsuarioTableRow from './UsuarioTableRow';

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
  isAdmin: boolean;
  onEdit: (usuario: Usuario) => void;
  onDelete: (usuario: Usuario) => void;
  onResetPassword: (usuario: Usuario) => void;
  onChangePassword?: (usuario: Usuario) => void;
  emptyComponent: React.ReactNode;
}

const UsuariosTable = ({ 
  usuarios, 
  isAdmin, 
  onEdit, 
  onDelete,
  onResetPassword,
  onChangePassword,
  emptyComponent 
}: UsuariosTableProps) => {
  return (
    <div className="rounded-md border">
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
            // Render empty state
            <>{emptyComponent}</>
          ) : (
            // Render usuarios
            usuarios.map((usuario) => (
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
    </div>
  );
};

export default UsuariosTable;
