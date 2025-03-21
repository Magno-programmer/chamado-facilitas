
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TicketWithDetails } from '@/lib/types/ticket.types';
import StatusBadge from '@/components/StatusBadge';

interface TicketMetadataProps {
  ticket: TicketWithDetails;
}

const TicketMetadata: React.FC<TicketMetadataProps> = ({ ticket }) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Informações do Chamado</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Solicitante</p>
          <p className="font-medium">{ticket.requester?.name}</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">Responsável</p>
          <p className="font-medium">{ticket.responsible?.name || 'Não atribuído'}</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">Data de criação</p>
          <p className="font-medium">{formatDate(ticket.createdAt)}</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">Prazo</p>
          <p className="font-medium">{formatDate(ticket.deadline)}</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <StatusBadge status={ticket.status} />
        </div>
      </div>
    </div>
  );
};

export default TicketMetadata;
