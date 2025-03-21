
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketWithDetails } from '@/lib/types/ticket.types';
import TicketCard from '@/components/TicketCard';

interface TicketsGridProps {
  tickets: TicketWithDetails[];
}

const TicketsGrid: React.FC<TicketsGridProps> = ({ tickets }) => {
  const navigate = useNavigate();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tickets.map(ticket => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          onClick={() => navigate(`/tickets/${ticket.id}`)}
        />
      ))}
    </div>
  );
};

export default TicketsGrid;
