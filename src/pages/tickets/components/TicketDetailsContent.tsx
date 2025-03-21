
import React from 'react';
import { Clock, User, UserCheck, Check, Trash2 } from 'lucide-react';
import { TicketWithDetails } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import ProgressBar from '@/components/ProgressBar';
import RemainingTime from '@/components/RemainingTime';
import { Button } from '@/components/ui/button';
import { TicketStatus } from '@/lib/types/ticket.types';

interface TicketDetailsContentProps {
  ticket: TicketWithDetails;
  canEditTicket: boolean;
  canDeleteTicket: boolean;
  canAssignTicket: boolean;
  onOpenAssignDialog: () => void;
  onOpenStatusDialog: (status: TicketStatus) => void;
  onOpenDeleteDialog: () => void;
  handleTicketExpired: () => Promise<void>;
}

const TicketDetailsContent: React.FC<TicketDetailsContentProps> = ({
  ticket,
  canEditTicket,
  canDeleteTicket,
  canAssignTicket,
  onOpenAssignDialog,
  onOpenStatusDialog,
  onOpenDeleteDialog,
  handleTicketExpired
}) => {
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
            <RemainingTime 
              deadline={ticket.deadline} 
              createdAt={ticket.createdAt} 
              onExpired={handleTicketExpired}
            />
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
      
      {(canEditTicket || canDeleteTicket || canAssignTicket) && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Ações de Gerenciamento</h3>
          <div className="flex flex-wrap gap-4">
            {canAssignTicket && (
              <Button 
                variant="outline" 
                onClick={onOpenAssignDialog}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Atribuir a Funcionário
              </Button>
            )}
            
            {canEditTicket && ticket.status !== 'Em Andamento' && ticket.status !== 'Concluído' && (
              <Button 
                variant="secondary" 
                onClick={() => onOpenStatusDialog('Em Andamento')}
              >
                <Clock className="mr-2 h-4 w-4" />
                Iniciar Atendimento
              </Button>
            )}
            
            {canEditTicket && ticket.status !== 'Concluído' && (
              <Button 
                variant="default" 
                onClick={() => onOpenStatusDialog('Concluído')}
              >
                <Check className="mr-2 h-4 w-4" />
                Concluir Chamado
              </Button>
            )}
            
            {canDeleteTicket && (
              <Button 
                variant="destructive" 
                onClick={onOpenDeleteDialog}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir Chamado
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetailsContent;
