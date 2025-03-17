
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Plus, RefreshCw, Search, Trash, Clock, Edit } from 'lucide-react';
import { TicketStatus, TicketWithDetails } from '@/lib/types';
import { getEnrichedTickets, mockSectors } from '@/lib/mockData';
import TicketCard from '@/components/TicketCard';
import StatusBadge from '@/components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

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

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

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
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTickets.map(ticket => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                />
              ))}
            </div>
          )}

          {viewMode === 'table' && (
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Setor</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Solicitante</TableHead>
                      <TableHead>Criação</TableHead>
                      <TableHead>Prazo</TableHead>
                      <TableHead>Progresso</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map(ticket => (
                      <TableRow 
                        key={ticket.id}
                        className="cursor-pointer hover:bg-muted/60"
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                      >
                        <TableCell className="font-medium">#{ticket.id}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{ticket.title}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{ticket.description}</TableCell>
                        <TableCell><StatusBadge status={ticket.status} /></TableCell>
                        <TableCell>{ticket.sector?.name}</TableCell>
                        <TableCell>{ticket.responsible?.name || "Não atribuído"}</TableCell>
                        <TableCell>{ticket.requester?.name}</TableCell>
                        <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                        <TableCell>{formatDate(ticket.deadline)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{ticket.percentageRemaining}%</span>
                            <Progress 
                              value={ticket.percentageRemaining} 
                              className="w-24"
                              color={
                                ticket.percentageRemaining > 50 ? "#22c55e" : 
                                ticket.percentageRemaining > 20 ? "#f59e0b" : 
                                ticket.percentageRemaining > 10 ? "#ea580c" : "#dc2626"
                              }
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => navigate(`/tickets/${ticket.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={(e) => deleteTicket(ticket.id, e)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </>
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
