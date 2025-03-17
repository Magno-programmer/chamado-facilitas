
import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';

interface TicketProgressProps {
  percentageRemaining: number;
  createdAt: string;
  deadline: string;
  formatDate: (date: string) => string;
}

const TicketProgress: React.FC<TicketProgressProps> = ({
  percentageRemaining,
  createdAt,
  deadline,
  formatDate
}) => {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Progresso</h2>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Tempo restante
            </span>
            <span className="text-sm font-medium">
              {percentageRemaining}%
            </span>
          </div>
          <ProgressBar percentage={percentageRemaining} />
        </div>
        
        <div className="pt-4 border-t grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Data de criação</p>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              <span>{formatDate(createdAt)}</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Prazo</p>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              <span>{formatDate(deadline)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketProgress;
