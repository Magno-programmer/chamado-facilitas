
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketStatus, TicketWithDetails } from '@/lib/types';
import { getEnrichedTickets } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import our new components
import TicketsHeader from '@/components/tickets/TicketsHeader';
import TicketsFilter from '@/components/tickets/TicketsFilter';
import TicketsTable from '@/components/tickets/TicketsTable';
import TicketsCards from '@/components/tickets/TicketsCards';
import TicketsEmptyState from '@/components/tickets/TicketsEmptyState';
import TicketsLoading from '@/components/tickets/TicketsLoading';

const Tickets = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [sectorFilter, setSectorFilter] = useState<number | 'all'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

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

  const deleteTicket = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Get current user from localStorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const ticket = tickets.find(t => t.id === id);
    
    if (!ticket) return;
    
    // Check if user has permission to delete
    const isAdmin = currentUser?.role === 'ADMIN';
    const isRequester = ticket.requesterId === currentUser?.id;
    
    if (!isAdmin && !isRequester) {
      toast({
        title: 'Acesso negado',
        description: 'Você não tem permissão para excluir este chamado.',
        variant: 'destructive',
      });
      return;
    }
    
    // In a real app, this would be an API call
    setTickets(tickets.filter(t => t.id !== id));
    setFilteredTickets(filteredTickets.filter(t => t.id !== id));
    
    toast({
      title: 'Chamado excluído',
      description: `O chamado #${id} foi excluído com sucesso.`,
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSectorFilter('all');
  };

  if (isLoading) {
    return <TicketsLoading />;
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 pt-20 animate-slide-up">
      <TicketsHeader />

      {/* Filters */}
      <TicketsFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sectorFilter={sectorFilter}
        setSectorFilter={setSectorFilter}
      />

      {/* View mode tabs */}
      <Tabs defaultValue="table" className="mb-6" onValueChange={(value) => setViewMode(value as 'cards' | 'table')}>
        <TabsList className="bg-white border">
          <TabsTrigger value="table">Tabela</TabsTrigger>
          <TabsTrigger value="cards">Cartões</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Results */}
      {filteredTickets.length > 0 ? (
        <>
          {viewMode === 'cards' && <TicketsCards tickets={filteredTickets} />}
          {viewMode === 'table' && <TicketsTable tickets={filteredTickets} onDelete={deleteTicket} />}
        </>
      ) : (
        <TicketsEmptyState onClearFilters={clearFilters} />
      )}
    </div>
  );
};

export default Tickets;
