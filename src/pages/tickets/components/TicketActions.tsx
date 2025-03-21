
import React, { useState } from 'react';
import { Clock, RefreshCw, Trash2, Check } from 'lucide-react';
import { TicketStatus, TicketWithDetails } from '@/lib/types/ticket.types';
import { Button } from '@/components/ui/button';

interface TicketActionsProps {
  ticket: TicketWithDetails;
  canManageTickets: boolean;
  openStatusDialog: (status: TicketStatus) => void;
  onDeleteClick: () => void;
}

const TicketActions: React.FC<TicketActionsProps> = ({ 
  ticket, 
  canManageTickets, 
  openStatusDialog, 
  onDeleteClick 
}) => {
  if (!canManageTickets) return null;

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Ações de Gerenciamento</h3>
      <div className="flex flex-wrap gap-4">
        {ticket.status !== 'Em Andamento' && ticket.status !== 'Concluído' && (
          <Button 
            variant="secondary" 
            onClick={() => openStatusDialog('Em Andamento')}
          >
            <Clock className="mr-2 h-4 w-4" />
            Iniciar Atendimento
          </Button>
        )}
        
        {ticket.status !== 'Concluído' && (
          <Button 
            variant="default" 
            onClick={() => openStatusDialog('Concluído')}
          >
            <Check className="mr-2 h-4 w-4" />
            Concluir Chamado
          </Button>
        )}
        
        <Button 
          variant="destructive" 
          onClick={onDeleteClick}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir Chamado
        </Button>
      </div>
    </div>
  );
};

export default TicketActions;
