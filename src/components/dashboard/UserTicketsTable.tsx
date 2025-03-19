
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Plus } from 'lucide-react';
import { TicketWithDetails } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import StatusBadge from '@/components/StatusBadge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserTicketsTableProps {
  userTickets: TicketWithDetails[];
}

const UserTicketsTable: React.FC<UserTicketsTableProps> = ({ userTickets }) => {
  const navigate = useNavigate();

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  if (userTickets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground text-sm">Você não possui chamados.</p>
        <button
          onClick={() => navigate('/tickets/new')}
          className="mt-4 py-2 px-4 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-lg transition-colors inline-flex items-center justify-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Chamado
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Setor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Criado Em</TableHead>
            <TableHead>Prazo</TableHead>
            <TableHead className="text-right">Progresso</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {userTickets.map((ticket) => (
            <TableRow 
              key={ticket.id} 
              className="cursor-pointer hover:bg-muted/60"
              onClick={() => navigate(`/tickets/${ticket.id}`)}
            >
              <TableCell className="font-medium">#{ticket.id}</TableCell>
              <TableCell className="max-w-[200px] truncate">{ticket.title}</TableCell>
              <TableCell>{ticket.sector?.name}</TableCell>
              <TableCell>
                <StatusBadge status={ticket.status} />
              </TableCell>
              <TableCell>{formatDateTime(ticket.createdAt)}</TableCell>
              <TableCell>{formatDateTime(ticket.deadline)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-xs font-medium">{ticket.percentageRemaining}%</span>
                  <Progress 
                    value={ticket.percentageRemaining} 
                    className="w-24"
                    style={{
                      "--progress-color": ticket.percentageRemaining > 50 
                        ? "#22c55e" 
                        : ticket.percentageRemaining > 20 
                          ? "#f59e0b" 
                          : ticket.percentageRemaining > 10 
                            ? "#ea580c" 
                            : "#dc2626"
                    } as React.CSSProperties}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTicketsTable;
