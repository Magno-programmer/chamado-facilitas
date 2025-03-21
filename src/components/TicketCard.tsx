
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, User } from 'lucide-react';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import RemainingTime from './RemainingTime';
import { TicketWithDetails } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TicketCardProps {
  ticket: TicketWithDetails;
  className?: string;
  onClick?: () => void;
  onStatusChange?: (ticketId: number, newStatus: string) => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ 
  ticket, 
  className,
  onClick,
  onStatusChange
}) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
  };

  const handleExpired = () => {
    if (ticket.status !== 'Concluído' && ticket.status !== 'Atrasado') {
      onStatusChange?.(ticket.id, 'Atrasado');
    }
  };

  return (
    <div 
      className={cn(
        'bg-white rounded-xl border shadow-sm p-5 transition-all duration-200 hover:shadow-md',
        'transform hover:-translate-y-1 cursor-pointer animate-scale-in',
        className
      )}
      onClick={onClick}
    >
      <div className="mb-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{ticket.title}</h3>
          <StatusBadge status={ticket.status} />
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {ticket.description}
        </p>
      </div>
      
      <ProgressBar 
        percentage={ticket.percentageRemaining} 
        deadline={ticket.deadline} 
        createdAt={ticket.createdAt} 
        autoUpdate={true}
        className="mb-4" 
      />
      
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-2">
        <div className="flex items-center">
          <User className="h-3.5 w-3.5 mr-1" />
          <span>{ticket.sector?.name || 'Setor não definido'}</span>
        </div>
        <div className="flex items-center justify-end">
          <Clock className="h-3.5 w-3.5 mr-1" />
          <span>
            {formatDate(ticket.deadline)}
          </span>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground">
        <div className="flex items-center justify-end">
          <Clock className="h-3.5 w-3.5 mr-1" />
          <span>Tempo restante: <RemainingTime 
            deadline={ticket.deadline} 
            createdAt={ticket.createdAt} 
            onExpired={handleExpired}
          /></span>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
