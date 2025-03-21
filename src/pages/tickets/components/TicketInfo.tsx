
import React from 'react';
import { TicketWithDetails } from '@/lib/types/ticket.types';
import StatusBadge from '@/components/StatusBadge';
import ProgressBar from '@/components/ProgressBar';
import RemainingTime from '@/components/RemainingTime';
import { Clock, User } from 'lucide-react';

interface TicketInfoProps {
  ticket: TicketWithDetails;
}

const TicketInfo: React.FC<TicketInfoProps> = ({ ticket }) => {
  const isCompleted = ticket.status === 'Concluído';

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-semibold">{ticket.title}</h2>
        <StatusBadge status={ticket.status} />
      </div>
      
      <div className="mb-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Descrição</h3>
        <p className="whitespace-pre-line">{ticket.description || 'Sem descrição'}</p>
      </div>
      
      {ticket.completionDescription && (
        <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-sm font-medium text-green-700 mb-2">Descrição de Conclusão</h3>
          <p className="whitespace-pre-line text-green-800">{ticket.completionDescription}</p>
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Progresso</h3>
        <ProgressBar 
          percentage={ticket.percentageRemaining}
          deadline={ticket.deadline}
          createdAt={ticket.createdAt}
          autoUpdate={!isCompleted}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Tempo Restante</h3>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <RemainingTime deadline={ticket.deadline} createdAt={ticket.createdAt} />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Setor</h3>
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{ticket.sector?.name || 'Não definido'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketInfo;
