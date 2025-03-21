
import React from 'react';
import { Filter, Search } from 'lucide-react';
import { TicketStatus } from '@/lib/types/ticket.types';

interface TicketsFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: TicketStatus | 'all';
  setStatusFilter: (status: TicketStatus | 'all') => void;
  sectorFilter: number | 'all';
  setSectorFilter: (sectorId: number | 'all') => void;
  sectors: {id: number, nome: string}[];
}

const TicketsFilter: React.FC<TicketsFilterProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  sectorFilter,
  setSectorFilter,
  sectors
}) => {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="col-span-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Buscar chamados..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        
        <div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as TicketStatus | 'all')}
              className="w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todos os Status</option>
              <option value="Aberto">Aberto</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Concluído">Concluído</option>
              <option value="Atrasado">Atrasado</option>
            </select>
          </div>
        </div>
        
        <div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <select
              value={sectorFilter}
              onChange={e => setSectorFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todos os Setores</option>
              {sectors.map(sector => (
                <option key={sector.id} value={sector.id}>{sector.nome}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketsFilter;
