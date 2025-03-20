
import React from 'react';
import { List } from 'lucide-react';
import { TicketWithDetails } from '@/lib/types';
import TicketCard from '@/components/TicketCard';

interface RecentTicketsProps {
  tickets: TicketWithDetails[];
  userRole: 'ADMIN' | 'CLIENT';
}

const RecentTickets: React.FC<RecentTicketsProps> = ({ tickets, userRole }) => {
  const title = userRole === 'CLIENT' ? 'Meus Chamados Recentes' : 'Chamados Recentes';

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="bg-secondary rounded-md p-1">
          <List className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
      <div className="space-y-4">
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))
        ) : (
          <p className="text-muted-foreground text-center py-4">
            Nenhum chamado recente encontrado.
          </p>
        )}
      </div>
    </div>
  );
};

export default RecentTickets;
