
import React from 'react';
import { TicketWithDetails } from '@/lib/types';
import TicketsTable from '@/components/TicketsTable';

interface TicketsTableViewProps {
  tickets: TicketWithDetails[];
  userRole: 'ADMIN' | 'CLIENT';
}

const TicketsTableView: React.FC<TicketsTableViewProps> = ({ tickets, userRole }) => {
  const title = userRole === 'CLIENT' ? 'Meus Chamados' : 'Todos os Chamados';

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 mb-8">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <TicketsTable tickets={tickets} />
    </div>
  );
};

export default TicketsTableView;
