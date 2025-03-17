
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/StatusBadge';
import { TicketStatus } from '@/lib/types';
import TicketStatusControl from './TicketStatusControl';

interface TicketHeaderProps {
  id: number;
  title: string;
  status: TicketStatus;
  createdAt: string;
  isAdmin: boolean;
  onStatusChange: (status: TicketStatus) => void;
  formatDate: (date: string) => string;
}

const TicketHeader: React.FC<TicketHeaderProps> = ({
  id,
  title,
  status,
  createdAt,
  isAdmin,
  onStatusChange,
  formatDate,
}) => {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <Button 
        variant="outline" 
        onClick={() => navigate('/tickets')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Chamados
      </Button>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{title}</h1>
            <StatusBadge status={status} />
          </div>
          <p className="text-muted-foreground mt-1">
            #{id} • Criado em {formatDate(createdAt)}
          </p>
        </div>
        
        {isAdmin && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/tickets/${id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            
            <TicketStatusControl 
              currentStatus={status} 
              onStatusChange={onStatusChange} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketHeader;
