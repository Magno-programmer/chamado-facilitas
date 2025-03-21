
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, KeyRound, Key } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface UsuarioTableRowProps {
  usuario: Usuario;
  onEdit: (usuario: Usuario) => void;
  onDelete: (usuario: Usuario) => void;
  onResetPassword: (usuario: Usuario) => void;
  onChangePassword?: (usuario: Usuario) => void;
  isAdmin: boolean;
}

const UsuarioTableRow = ({
  usuario,
  onEdit,
  onDelete,
  onResetPassword,
  onChangePassword,
  isAdmin
}: UsuarioTableRowProps) => {
  // Função para exibir o nome da função corretamente
  const displayRole = (role: string) => {
    switch(role) {
      case "ADMIN": return "Administrador";
      case "GERENTE": return "Gerente";
      case "FUNCIONARIO": return "Funcionário";
      case "CLIENT": return "Cliente";
      default: return role;
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{usuario.nome}</TableCell>
      <TableCell>{usuario.email}</TableCell>
      <TableCell>{usuario.setor?.nome || "-"}</TableCell>
      <TableCell>{displayRole(usuario.role)}</TableCell>
      <TableCell className="text-right">
        {isAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(usuario)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(usuario)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onResetPassword(usuario)}>
                <KeyRound className="mr-2 h-4 w-4" />
                Redefinir Senha
              </DropdownMenuItem>
              {onChangePassword && (
                <DropdownMenuItem onClick={() => onChangePassword(usuario)}>
                  <Key className="mr-2 h-4 w-4" />
                  Alterar Senha
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TableCell>
    </TableRow>
  );
};

export default UsuarioTableRow;
