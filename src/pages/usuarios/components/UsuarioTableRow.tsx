
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Key } from "lucide-react";

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
  isAdmin: boolean;
  onEdit: (usuario: Usuario) => void;
  onDelete: (usuario: Usuario) => void;
  onResetPassword: (usuario: Usuario) => void;
}

const UsuarioTableRow = ({ 
  usuario, 
  isAdmin, 
  onEdit, 
  onDelete, 
  onResetPassword 
}: UsuarioTableRowProps) => {
  return (
    <TableRow>
      <TableCell>{usuario.id.slice(0, 8)}...</TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{usuario.nome.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{usuario.nome}</span>
        </div>
      </TableCell>
      <TableCell>{usuario.email}</TableCell>
      <TableCell>{usuario.setor?.nome || 'N/A'}</TableCell>
      <TableCell>
        <Badge variant={usuario.role === "ADMIN" ? "destructive" : 
                      usuario.role === "Gerente" ? "default" : "secondary"}>
          {usuario.role}
        </Badge>
      </TableCell>
      {isAdmin && (
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => onResetPassword(usuario)}>
              <Key className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onEdit(usuario)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(usuario)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </TableCell>
      )}
    </TableRow>
  );
};

export default UsuarioTableRow;
