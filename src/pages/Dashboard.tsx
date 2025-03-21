
import React, { useState } from 'react';
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
  const [showTable, setShowTable] = useState(false);
  const { user, isAuthenticated } = useAuth();
  
  // Use custom hook to manage dashboard data
  const { stats, allTickets, recentTickets, isLoading } = useDashboardData({
    isAuthenticated,
    user
  });

  const toggleView = () => {
    setShowTable(!showTable);
  };

  const renderDashboardContent = () => {
    // For any authenticated user
    return (
      <>
        <DashboardStats stats={stats} />
        
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mt-6">
          <Card className="md:col-span-4">
            <CardContent className="p-0">
              <StatusDistributionChart stats={stats} />
            </CardContent>
          </Card>
          
          <Card className="md:col-span-3">
            <CardContent className="p-0">
              <SectorBarChart stats={stats} userRole={user?.role || 'CLIENT'} />
            </CardContent>
          </Card>
        </div>

        {showTable ? (
          <div className="mt-6">
            <TicketsTableView 
              tickets={allTickets} 
              userRole={user?.role || 'CLIENT'} 
            />
          </div>
        ) : (
          <div className="mt-6">
            <Tabs defaultValue="recent">
              <TabsList className="mb-4">
                <TabsTrigger value="recent">Chamados Recentes</TabsTrigger>
                <TabsTrigger value="all">Todos os Chamados</TabsTrigger>
              </TabsList>
              <TabsContent value="recent" className="space-y-4">
                <div className="grid grid-cols-1 gap-6">
                  <Card>
                    <RecentTickets 
                      tickets={recentTickets} 
                      userRole={user?.role || 'CLIENT'} 
                    />
                    <CardFooter className="flex justify-end py-4">
                      <button 
                        onClick={toggleView}
                        className="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-md"
                      >
                        Ver Todos os Chamados
                      </button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="all">
                <Card>
                  <CardContent className="p-0">
                    <TicketsTableView 
                      tickets={allTickets} 
                      userRole={user?.role || 'CLIENT'} 
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader 
        userRole={user?.role || 'CLIENT'} 
        showTable={showTable}
        toggleView={toggleView}
      />
      {renderDashboardContent()}
    </div>
  );
};

export default Dashboard;
