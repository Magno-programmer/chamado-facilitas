
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, TableIcon } from 'lucide-react';
import { TicketWithDetails } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { getDashboardStats, getTickets } from '@/services/ticketService';
import StatsCards from '@/components/dashboard/StatsCards';
import UserTicketsTable from '@/components/dashboard/UserTicketsTable';
import StatusDistributionChart from '@/components/dashboard/StatusDistributionChart';
import SectorBarChart from '@/components/dashboard/SectorBarChart';
import RecentTickets from '@/components/dashboard/RecentTickets';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    completedTickets: 0,
    lateTickets: 0,
    ticketsBySector: [],
  });
  const [recentTickets, setRecentTickets] = useState<TicketWithDetails[]>([]);
  const [userTickets, setUserTickets] = useState<TicketWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Obter estatísticas do dashboard
        const dashboardStats = await getDashboardStats();
        setStats(dashboardStats);
        
        // Obter tickets do usuário
        const isAdmin = user.role === 'ADMIN';
        const allTickets = await getTickets(user.id, isAdmin);
        
        // Ordenar por data de criação para tickets recentes
        const sorted = [...allTickets].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 5);
        
        setRecentTickets(sorted);
        
        // Filtrar tickets do usuário atual
        const currentUserTickets = allTickets.filter(ticket => 
          ticket.requesterId === user.id || ticket.responsibleId === user.id
        );
        
        setUserTickets(currentUserTickets);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate, user]);

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema de chamados</p>
      </div>

      <StatsCards stats={stats} />

      <div className="bg-white rounded-xl border shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center">
            <TableIcon className="h-5 w-5 mr-2 text-primary" />
            Meus Chamados
          </h2>
          <button 
            onClick={() => navigate('/tickets')}
            className="inline-flex items-center text-primary hover:underline text-sm font-medium"
          >
            <TableIcon className="h-4 w-4 mr-1" />
            Ver Todos
          </button>
        </div>

        <UserTicketsTable userTickets={userTickets} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 space-y-8">
          <StatusDistributionChart stats={stats} />
          <SectorBarChart sectorData={stats.ticketsBySector} />
        </div>

        <RecentTickets recentTickets={recentTickets} />
      </div>
    </div>
  );
};

export default Dashboard;
