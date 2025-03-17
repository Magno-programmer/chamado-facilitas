
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bell, Clock, FileText, List, Plus, RefreshCw, Settings, Table as TableIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart as RechartBarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { mockDashboardStats, getEnrichedTickets } from '@/lib/mockData';
import { TicketWithDetails } from '@/lib/types';
import TicketCard from '@/components/TicketCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import StatusBadge from '@/components/StatusBadge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(mockDashboardStats);
  const [recentTickets, setRecentTickets] = useState<TicketWithDetails[]>([]);
  const [userTickets, setUserTickets] = useState<TicketWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check if logged in
  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
      navigate('/login');
      return;
    }

    // Simulate loading data
    const timer = setTimeout(() => {
      const enrichedTickets = getEnrichedTickets();
      // Sort by most recent and take first 5
      const sorted = [...enrichedTickets].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, 5);
      
      setRecentTickets(sorted);
      
      // Get user id from localStorage (in a real app this would come from auth context)
      const userId = localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId') || '1') : 1;
      
      // Get all tickets for current user
      const userTickets = enrichedTickets.filter(ticket => 
        ticket.requesterId === userId || ticket.responsibleId === userId
      );
      
      setUserTickets(userTickets);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [navigate]);

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
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

      {/* User Tickets Table */}
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
            <List className="h-4 w-4 mr-1" />
            Ver Todos
          </button>
        </div>

        {userTickets.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado Em</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead className="text-right">Progresso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userTickets.map((ticket) => (
                  <TableRow 
                    key={ticket.id} 
                    className="cursor-pointer hover:bg-muted/60"
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                  >
                    <TableCell className="font-medium">#{ticket.id}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{ticket.title}</TableCell>
                    <TableCell>{ticket.sector?.name}</TableCell>
                    <TableCell>
                      <StatusBadge status={ticket.status} />
                    </TableCell>
                    <TableCell>{formatDateTime(ticket.createdAt)}</TableCell>
                    <TableCell>{formatDateTime(ticket.deadline)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs font-medium">{ticket.percentageRemaining}%</span>
                        <Progress 
                          value={ticket.percentageRemaining} 
                          className="w-24"
                          // Apply different colors based on percentage
                          style={{
                            "--progress-color": ticket.percentageRemaining > 50 
                              ? "#22c55e" 
                              : ticket.percentageRemaining > 20 
                                ? "#f59e0b" 
                                : ticket.percentageRemaining > 10 
                                  ? "#ea580c" 
                                  : "#dc2626"
                          } as React.CSSProperties}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">Você não possui chamados.</p>
            <button
              onClick={() => navigate('/tickets/new')}
              className="mt-4 py-2 px-4 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-lg transition-colors inline-flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Chamado
            </button>
          </div>
        )}
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
