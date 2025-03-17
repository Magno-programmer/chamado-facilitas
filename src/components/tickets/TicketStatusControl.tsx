
import React from 'react';
import { Button } from '@/components/ui/button';
import { TicketStatus } from '@/lib/types';

interface TicketStatusControlProps {
  currentStatus: TicketStatus;
  onStatusChange: (status: TicketStatus) => void;
}

const TicketStatusControl: React.FC<TicketStatusControlProps> = ({
  currentStatus,
  onStatusChange,
}) => {
  return (
    <div className="bg-white rounded-lg border shadow-sm p-1 flex gap-1">
      <Button 
        size="sm" 
        variant={currentStatus === 'Aberto' ? 'default' : 'outline'}
        onClick={() => onStatusChange('Aberto')}
      >
        Aberto
      </Button>
      <Button 
        size="sm" 
        variant={currentStatus === 'Em Andamento' ? 'default' : 'outline'}
        onClick={() => onStatusChange('Em Andamento')}
      >
        Em Andamento
      </Button>
      <Button 
        size="sm" 
        variant={currentStatus === 'Concluído' ? 'default' : 'outline'}
        onClick={() => onStatusChange('Concluído')}
      >
        Concluído
      </Button>
      <Button 
        size="sm" 
        variant={currentStatus === 'Atrasado' ? 'default' : 'outline'}
        onClick={() => onStatusChange('Atrasado')}
        className="text-destructive"
      >
        Atrasado
      </Button>
    </div>
  );
};

export default TicketStatusControl;
