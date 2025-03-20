
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UsuariosTable from './UsuariosTable';

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
}

const UsuariosContent = ({ 
  usuarios, 
  loading, 
  isAdmin, 
  onEdit, 
  onDelete, 
  onResetPassword
}: UsuariosContentProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Usuários</CardTitle>
        <CardDescription>
          Visualize todos os usuários do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UsuariosTable 
          usuarios={usuarios}
          loading={loading}
          isAdmin={isAdmin}
          onEdit={onEdit}
          onDelete={onDelete}
          onResetPassword={onResetPassword}
        />
      </CardContent>
    </Card>
  );
};

export default UsuariosContent;
