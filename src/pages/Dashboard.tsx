
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bell, Clock, FileText, List, Plus, RefreshCw, Settings } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart as RechartBarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { TicketWithDetails, UserRole } from '@/lib/types';
import { DashboardStats } from '@/lib/types/dashboard.types';
import { getTickets, getTicketStats } from '@/lib/supabase';
import TicketCard from '@/components/TicketCard';
import { useAuth } from '@/hooks/useAuth';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    completedTickets: 0,
    lateTickets: 0,
    ticketsBySector: []
  });
  const [recentTickets, setRecentTickets] = useState<TicketWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check if logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch statistics
        const statsData = await getTicketStats();
        setStats(statsData);
        
        // Fetch tickets
        const ticketsData = await getTickets();
        
        // Map to our TicketWithDetails type and sort by most recent
        const mappedTickets = ticketsData
          .map(ticket => ({
            id: ticket.id,
            title: ticket.titulo,
            description: ticket.descricao || '',
            sectorId: ticket.setor_id,
            requesterId: ticket.solicitante_id,
            responsibleId: ticket.responsavel_id,
            status: ticket.status as any,
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
          }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        
        setRecentTickets(mappedTickets);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Helper function to convert string role to UserRole type
  const convertToUserRole = (role: string): UserRole => {
    return role === 'ADMIN' ? 'ADMIN' : 'CLIENT';
  };

  // Calculate percentage of time remaining for a ticket
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

  const COLORS = ['#3b82f6', '#f59e0b', '#22c55e', '#ef4444'];
  const RADIAN = Math.PI / 180;

  const pieData = [
    { name: 'Abertos', value: stats.openTickets },
    { name: 'Em Andamento', value: stats.inProgressTickets },
    { name: 'Concluídos', value: stats.completedTickets },
    { name: 'Atrasados', value: stats.lateTickets },
  ];

  const barData = stats.ticketsBySector.map((item) => ({
    name: item.sectorName,
    Chamados: item.count,
  }));

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="font-medium text-xs"
      >
        {pieData[index].name} ({(percent * 100).toFixed(0)}%)
      </text>
    );
  };

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema de chamados</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { 
            title: 'Total de Chamados', 
            value: stats.totalTickets, 
            icon: <FileText className="h-6 w-6 text-primary" />,
            color: 'border-blue-200 bg-blue-50',
          },
          { 
            title: 'Em Andamento', 
            value: stats.inProgressTickets, 
            icon: <Clock className="h-6 w-6 text-amber-500" />,
            color: 'border-amber-200 bg-amber-50',
          },
          { 
            title: 'Concluídos', 
            value: stats.completedTickets, 
            icon: <FileText className="h-6 w-6 text-green-500" />,
            color: 'border-green-200 bg-green-50',
          },
          { 
            title: 'Atrasados', 
            value: stats.lateTickets, 
            icon: <Bell className="h-6 w-6 text-red-500" />,
            color: 'border-red-200 bg-red-50',
          },
        ].map((card, index) => (
          <div 
            key={index} 
            className={`rounded-xl border ${card.color} p-5 transition-transform duration-200 hover:scale-105`}
          >
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{card.title}</p>
                <h3 className="text-2xl font-bold">{card.value}</h3>
              </div>
              <div className="rounded-full bg-white p-2 shadow-sm">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Distribuição de Status</h2>
              <div className="bg-secondary rounded-md p-1">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Chamados por Setor</h2>
              <div className="bg-secondary rounded-md p-1">
                <BarChart className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartBarChart
                  data={barData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="Chamados" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </RechartBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Tickets */}
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
      </div>
    </div>
  );
};

export default Dashboard;
