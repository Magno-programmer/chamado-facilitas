
import React from 'react';
import { TicketStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'Aberto':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Em Andamento':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Concluído':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Atrasado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border',
      getStatusStyles(),
      className
    )}>
      {status}
    </span>
  );
};

export default StatusBadge;
