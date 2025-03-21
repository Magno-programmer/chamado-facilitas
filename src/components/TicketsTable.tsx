
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import RemainingTime from './RemainingTime';
import { TicketWithDetails } from '@/lib/types/ticket.types';

interface TicketsTableProps {
  tickets: TicketWithDetails[];
  pageSize?: number;
}

const TicketsTable: React.FC<TicketsTableProps> = ({ 
  tickets, 
  pageSize = 10 
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = React.useState(1);
  
  const totalPages = Math.ceil(tickets.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTickets = tickets.slice(startIndex, startIndex + pageSize);
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
  };
  
  const handleRowClick = (ticketId: number) => {
    navigate(`/tickets/${ticketId}`);
  };
  
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead>Solicitante</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead>Tempo Restante</TableHead>
              <TableHead>Progresso</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTickets.length > 0 ? (
              paginatedTickets.map((ticket) => (
                <TableRow 
                  key={ticket.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(ticket.id)}
                >
                  <TableCell className="font-medium">#{ticket.id}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{ticket.title}</TableCell>
                  <TableCell>{ticket.sector?.name}</TableCell>
                  <TableCell>{ticket.requester?.name}</TableCell>
                  <TableCell>{ticket.responsible?.name || '-'}</TableCell>
                  <TableCell>
                    <StatusBadge status={ticket.status} />
                  </TableCell>
                  <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                  <TableCell>{formatDate(ticket.deadline)}</TableCell>
                  <TableCell>
                    <RemainingTime deadline={ticket.deadline} createdAt={ticket.createdAt} />
                  </TableCell>
                  <TableCell className="w-[150px]">
                    <ProgressBar 
                      percentage={ticket.percentageRemaining} 
                      deadline={ticket.deadline} 
                      createdAt={ticket.createdAt} 
                      autoUpdate={true}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  Nenhum chamado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink 
                  isActive={currentPage === page}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default TicketsTable;
