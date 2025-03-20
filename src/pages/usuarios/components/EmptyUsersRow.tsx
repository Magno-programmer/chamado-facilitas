
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";

interface EmptyUsersRowProps {
  colSpan: number;
}

const EmptyUsersRow = ({ colSpan }: EmptyUsersRowProps) => {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="text-center py-6">
        Nenhum usuário encontrado
      </TableCell>
    </TableRow>
  );
};

export default EmptyUsersRow;
