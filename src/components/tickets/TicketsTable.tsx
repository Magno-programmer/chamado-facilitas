
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash } from 'lucide-react';
import { TicketWithDetails } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import StatusBadge from '@/components/StatusBadge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TicketsTableProps {
  tickets: TicketWithDetails[];
  onDelete: (id: number, e: React.MouseEvent) => void;
}

const TicketsTable: React.FC<TicketsTableProps> = ({ tickets, onDelete }) => {
  const navigate = useNavigate();
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Solicitante</TableHead>
              <TableHead>Criação</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map(ticket => (
              <TableRow 
                key={ticket.id}
                className="cursor-pointer hover:bg-muted/60"
                onClick={() => navigate(`/tickets/${ticket.id}`)}
              >
                <TableCell className="font-medium">#{ticket.id}</TableCell>
                <TableCell className="max-w-[150px] truncate">{ticket.title}</TableCell>
                <TableCell className="max-w-[200px] truncate">{ticket.description}</TableCell>
                <TableCell><StatusBadge status={ticket.status} /></TableCell>
                <TableCell>{ticket.sector?.name}</TableCell>
                <TableCell>{ticket.responsible?.name || "Não atribuído"}</TableCell>
                <TableCell>{ticket.requester?.name}</TableCell>
                <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                <TableCell>{formatDate(ticket.deadline)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{ticket.percentageRemaining}%</span>
                    <Progress 
                      value={ticket.percentageRemaining} 
                      className="w-24"
                      color={
                        ticket.percentageRemaining > 50 ? "#22c55e" : 
                        ticket.percentageRemaining > 20 ? "#f59e0b" : 
                        ticket.percentageRemaining > 10 ? "#ea580c" : "#dc2626"
                      }
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => onDelete(ticket.id, e)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TicketsTable;
