
import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Deadline } from '@/lib/types/sector.types';

interface DeadlinesTableProps {
  deadlines: Deadline[];
  canManageDeadlines: {[id: number]: boolean};
  onEdit: (deadline: Deadline) => void;
  onDelete: (deadline: Deadline) => void;
}

const DeadlinesTable = ({ 
  deadlines, 
  canManageDeadlines, 
  onEdit, 
  onDelete 
}: DeadlinesTableProps) => {
  // Function to format the prazo time string to a more readable format
  const formatDeadlineTime = (prazoString: string) => {
    // The prazo string comes in a time format, likely HH:MM:SS
    // Format it to display in a more user-friendly way
    return prazoString;
  };

  return (
    <Table>
      <TableCaption>Lista de prazos para os setores</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Título</TableHead>
          <TableHead>Setor</TableHead>
          <TableHead>Prazo</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deadlines.map((deadline) => (
          <TableRow key={deadline.id}>
            <TableCell className="font-medium">{deadline.titulo}</TableCell>
            <TableCell>
              {deadline.setor_id ? (
                <Badge variant="secondary">{deadline.setor?.nome || 'Setor não encontrado'}</Badge>
              ) : (
                <Badge variant="outline">Todos os setores</Badge>
              )}
            </TableCell>
            <TableCell>{formatDeadlineTime(deadline.prazo)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                {canManageDeadlines[deadline.id] && (
                  <>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(deadline)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(deadline)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
        {deadlines.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
              Nenhum prazo cadastrado
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default DeadlinesTable;
