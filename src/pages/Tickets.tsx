import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Plus, RefreshCw, Search } from 'lucide-react';
import { TicketStatus, TicketWithDetails } from '@/lib/types/ticket.types';
import { UserRole } from '@/lib/types/user.types';
import { getSectors, getTickets } from '@/lib/supabase';
import TicketCard from '@/components/TicketCard';
import { useAuth } from '@/hooks/useAuth';

const Tickets = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [sectorFilter, setSectorFilter] = useState<number | 'all'>('all');
  const [sectors, setSectors] = useState<{id: number, nome: string}[]>([]);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const convertToUserRole = (role: string): UserRole => {
    return role === 'ADMIN' ? 'ADMIN' : role === 'Gerente' ? 'Gerente' : 'CLIENT';
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const sectorsData = await getSectors();
        setSectors(sectorsData);
        
        const ticketsData = await getTickets();
        
        const mappedTickets = ticketsData.map(ticket => ({
          id: ticket.id,
          title: ticket.titulo,
          description: ticket.descricao || '',
          completionDescription: ticket.descricao_conclusao,
          sectorId: ticket.setor_id,
          requesterId: ticket.solicitante_id,
          responsibleId: ticket.responsavel_id,
          status: ticket.status as TicketStatus,
          createdAt: ticket.data_criacao,
          deadline: ticket.prazo,
          sector: {
            id: ticket.setor.id,
            name: ticket.setor.nome
          },
          requester: {
            id: ticket.solicitante.id,
            name: ticket.solicitante.nome,
            email: ticket.solicitante.email,
            sectorId: ticket.solicitante.setor_id,
            role: convertToUserRole(ticket.solicitante.role)
          },
          responsible: ticket.responsavel ? {
            id: ticket.responsavel.id,
            name: ticket.responsavel.nome,
            email: ticket.responsavel.email,
            sectorId: ticket.responsavel.setor_id,
            role: convertToUserRole(ticket.responsavel.role)
          } : null,
          percentageRemaining: calculatePercentageRemaining(ticket.data_criacao, ticket.prazo)
        }));
        
        const userTickets = isAdmin 
          ? mappedTickets 
          : mappedTickets.filter(ticket => ticket.requesterId === user?.id);
        
        setTickets(userTickets);
        setFilteredTickets(userTickets);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated && user) {
      loadData();
    }
  }, [isAuthenticated, user, isAdmin]);

  const calculatePercentageRemaining = (createdAt: string, deadline: string) => {
    const now = new Date();
    const start = new Date(createdAt);
    const end = new Date(deadline);
    
    const totalTime = end.getTime() - start.getTime();
    const elapsedTime = now.getTime() - start.getTime();
    
    if (totalTime <= 0) return 0;
    
    const percentage = 100 - (elapsedTime / totalTime) * 100;
    return Math.max(0, Math.min(100, percentage));
  };

  useEffect(() => {
    if (tickets.length === 0) return;

    let result = [...tickets];

    if (searchTerm) {
      result = result.filter(ticket => 
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(ticket => ticket.status === statusFilter);
    }

    if (sectorFilter !== 'all') {
      result = result.filter(ticket => ticket.sectorId === sectorFilter);
    }

    setFilteredTickets(result);
  }, [searchTerm, statusFilter, sectorFilter, tickets]);

  if (isLoading || authLoading) {
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
          <p className="text-muted-foreground">
            {isAdmin 
              ? "Gerencie e acompanhe todos os chamados" 
              : "Gerencie e acompanhe seus chamados"}
          </p>
        </div>
        <button
          onClick={() => navigate('/tickets/new')}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm inline-flex items-center justify-center whitespace-nowrap"
        >
          <Plus className="h-5 w-5 mr-2" />
          Novo Chamado
        </button>
      </div>

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
