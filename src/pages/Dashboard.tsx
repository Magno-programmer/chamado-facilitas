
import React, { useState, ReactNode } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentTickets from '@/components/dashboard/RecentTickets';
import StatusDistributionChart from '@/components/dashboard/StatusDistributionChart';
import SectorBarChart from '@/components/dashboard/SectorBarChart';
import TicketsTableView from '@/components/dashboard/TicketsTableView';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import { UserRole } from '@/lib/types/user.types';

const Dashboard = () => {
  const [currentView, setCurrentView] = useState<'card' | 'table'>('card');
  const { user, isAuthenticated } = useAuth();
  
  // Use custom hook to manage dashboard data
  const { stats, allTickets, recentTickets, isLoading } = useDashboardData({
    isAuthenticated,
    user
  });

  const renderDashboardContent = () => {
    // For any authenticated user
    return (
      <>
        <DashboardStats stats={stats} loading={isLoading} />
        
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mt-6">
          <Card className="md:col-span-4">
            <CardContent className="p-0">
              <StatusDistributionChart 
                openTickets={stats.openTickets} 
                inProgressTickets={stats.inProgressTickets} 
                completedTickets={stats.completedTickets} 
                lateTickets={stats.lateTickets}
                loading={isLoading}
              />
            </CardContent>
          </Card>
          
          <Card className="md:col-span-3">
            <CardContent className="p-0">
              <SectorBarChart 
                data={stats.ticketsBySector} 
                loading={isLoading}
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Tabs defaultValue="recent">
            <TabsList className="mb-4">
              <TabsTrigger value="recent">Chamados Recentes</TabsTrigger>
              <TabsTrigger value="all">Todos os Chamados</TabsTrigger>
            </TabsList>
            <TabsContent value="recent" className="space-y-4">
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <RecentTickets tickets={recentTickets} loading={isLoading} />
                  <CardFooter className="flex justify-end py-4">
                    <TabsTrigger 
                      value="all" 
                      onClick={() => setCurrentView('table')}
                      className="bg-primary text-white hover:bg-primary/90"
                    >
                      Ver Todos os Chamados
                    </TabsTrigger>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="all">
              <Card>
                <CardContent className="p-0">
                  <div className="flex justify-end p-4">
                    <div className="flex space-x-2">
                      <button 
                        className={`px-3 py-1 rounded-md ${currentView === 'card' ? 'bg-primary text-white' : 'bg-secondary'}`}
                        onClick={() => setCurrentView('card')}
                      >
                        Card
                      </button>
                      <button 
                        className={`px-3 py-1 rounded-md ${currentView === 'table' ? 'bg-primary text-white' : 'bg-secondary'}`}
                        onClick={() => setCurrentView('table')}
                      >
                        Tabela
                      </button>
                    </div>
                  </div>
                  <TicketsTableView 
                    tickets={allTickets} 
                    viewType={currentView}
                    loading={isLoading}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader 
        user={user} 
        title={`Dashboard`} 
        subtitle="Visão geral do sistema"
      />
      {renderDashboardContent()}
    </div>
  );
};

export default Dashboard;
