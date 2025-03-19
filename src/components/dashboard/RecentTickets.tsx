
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Plus } from 'lucide-react';
import { TicketWithDetails } from '@/lib/types';

interface RecentTicketsProps {
  recentTickets: TicketWithDetails[];
}

const RecentTickets: React.FC<RecentTicketsProps> = ({ recentTickets }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Chamados Recentes</h2>
        <button 
          onClick={() => navigate('/tickets')}
          className="inline-flex items-center text-primary hover:underline text-sm font-medium"
        >
          <List className="h-4 w-4 mr-1" />
          Ver Todos
        </button>
      </div>
      
      <div className="space-y-4">
        {recentTickets.length > 0 ? (
          recentTickets.map((ticket) => (
            <div 
              key={ticket.id}
              className="p-3 rounded-lg border bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors"
              onClick={() => navigate(`/tickets/${ticket.id}`)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-sm line-clamp-1">{ticket.title}</h3>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{ticket.sector?.name}</span>
                <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                  #{ticket.id}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">Nenhum chamado recente.</p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={() => navigate('/tickets/new')}
          className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-lg transition-colors inline-flex items-center justify-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Chamado
        </button>
      </div>
    </div>
  );
};

export default RecentTickets;
