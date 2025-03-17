
import React from 'react';
import { Deadline } from '@/lib/types';
import { Edit, Trash, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockSectors } from '@/lib/mockData';

interface DeadlinesTableProps {
  deadlines: Deadline[];
  isAdmin: boolean;
  onEdit: (deadline: Deadline) => void;
  onDelete: (deadlineId: number) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const DeadlinesTable: React.FC<DeadlinesTableProps> = ({ 
  deadlines, 
  isAdmin, 
  onEdit, 
  onDelete,
  searchTerm,
  setSearchTerm
}) => {
  const filteredDeadlines = searchTerm 
    ? deadlines.filter(deadline => 
        deadline.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : deadlines;

  const getSectorName = (sectorId: number) => {
    const sector = mockSectors.find(s => s.id === sectorId);
    return sector ? sector.name : 'Setor não encontrado';
  };

  const formatDeadline = (deadline: string) => {
    // Format ISO duration string to human readable format
    // Example: PT60M -> 60 minutos, PT120M -> 120 minutos, P1D -> 1440 minutos
    const minuteMatch = deadline.match(/PT(\d+)M/);
    const dayMatch = deadline.match(/P(\d+)D/);
    const hourMatch = deadline.match(/PT(\d+)H/);
    
    if (minuteMatch) {
      const minutes = parseInt(minuteMatch[1]);
      return minutes === 1 ? '1 minuto' : `${minutes} minutos`;
    } else if (dayMatch) {
      const days = parseInt(dayMatch[1]);
      const minutes = days * 1440; // 1 day = 1440 minutes
      return `${minutes} minutos (${days} ${days === 1 ? 'dia' : 'dias'})`;
    } else if (hourMatch) {
      const hours = parseInt(hourMatch[1]);
      const minutes = hours * 60; // 1 hour = 60 minutes
      return `${minutes} minutos (${hours} ${hours === 1 ? 'hora' : 'horas'})`;
    }
    
    return deadline;
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Setor</TableHead>
            <TableHead>Prazo</TableHead>
            {isAdmin && <TableHead className="text-right">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDeadlines.length > 0 ? (
            filteredDeadlines.map(deadline => (
              <TableRow key={deadline.id}>
                <TableCell className="font-medium">{deadline.id}</TableCell>
                <TableCell>{deadline.title}</TableCell>
                <TableCell>{getSectorName(deadline.sectorId)}</TableCell>
                <TableCell>{formatDeadline(deadline.deadline)}</TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => onEdit(deadline)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => onDelete(deadline.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={isAdmin ? 5 : 4} className="text-center py-10">
                <div className="flex flex-col items-center justify-center">
                  <div className="bg-secondary rounded-full p-4 mb-4">
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Nenhum prazo encontrado</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    Não encontramos prazos com os critérios de busca atuais.
                  </p>
                  {searchTerm && (
                    <Button variant="outline" onClick={() => setSearchTerm('')}>
                      Limpar Filtros
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DeadlinesTable;
