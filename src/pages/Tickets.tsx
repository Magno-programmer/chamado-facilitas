
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Plus, RefreshCw, Search } from 'lucide-react';
import { TicketStatus, TicketWithDetails } from '@/lib/types';
import { getEnrichedTickets, mockSectors } from '@/lib/mockData';
import TicketCard from '@/components/TicketCard';
import StatusBadge from '@/components/StatusBadge';

const Tickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [sectorFilter, setSectorFilter] = useState<number | 'all'>('all');

  // Check if logged in
  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
      navigate('/login');
      return;
    }

    // Simulate loading data
    const timer = setTimeout(() => {
      const enrichedTickets = getEnrichedTickets();
      setTickets(enrichedTickets);
      setFilteredTickets(enrichedTickets);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [navigate]);

  // Apply filters when any filter changes
  useEffect(() => {
    if (tickets.length === 0) return;

    let result = [...tickets];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(ticket => 
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(ticket => ticket.status === statusFilter);
    }

    // Apply sector filter
    if (sectorFilter !== 'all') {
      result = result.filter(ticket => ticket.sectorId === sectorFilter);
    }

    setFilteredTickets(result);
  }, [searchTerm, statusFilter, sectorFilter, tickets]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col p-4 md:p-8 pt-20">
        <div className="flex items-center justify-center h-full">
          <RefreshCw className="h-12 w-12 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 pt-20 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Chamados</h1>
          <p className="text-muted-foreground">Gerencie e acompanhe todos os chamados</p>
        </div>
        <button
          onClick={() => navigate('/tickets/new')}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm inline-flex items-center justify-center whitespace-nowrap"
        >
          <Plus className="h-5 w-5 mr-2" />
          Novo Chamado
        </button>
      </div>

      {/* Filters */}
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
                {mockSectors.map(sector => (
                  <option key={sector.id} value={sector.id}>{sector.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredTickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-secondary rounded-full p-4 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">Nenhum resultado encontrado</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Não encontramos chamados com os filtros atuais. Tente ajustar seus critérios de busca.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setSectorFilter('all');
            }}
            className="bg-secondary hover:bg-secondary/70 text-foreground px-4 py-2 rounded-lg transition-all duration-200"
          >
            Limpar Filtros
          </button>
        </div>
      )}
    </div>
  );
};

export default Tickets;
