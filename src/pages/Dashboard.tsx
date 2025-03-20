
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';

// Import refactored components
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStatsCards from '@/components/dashboard/DashboardStats';
import StatusDistributionChart from '@/components/dashboard/StatusDistributionChart';
import SectorBarChart from '@/components/dashboard/SectorBarChart';
import RecentTickets from '@/components/dashboard/RecentTickets';
import TicketsTableView from '@/components/dashboard/TicketsTableView';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [showTable, setShowTable] = useState(false);

  // Check if logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Get dashboard data from custom hook
  const { stats, allTickets, recentTickets, isLoading } = useDashboardData({
    isAuthenticated,
    user
  });

  const toggleView = () => setShowTable(!showTable);

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
      <DashboardHeader 
        userRole={user?.role || 'CLIENT'} 
        showTable={showTable} 
        toggleView={toggleView} 
      />

      <DashboardStatsCards stats={stats} />

      {showTable ? (
        <TicketsTableView 
          tickets={allTickets} 
          userRole={user?.role || 'CLIENT'} 
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Charts */}
          <div className="lg:col-span-2 space-y-8">
            <StatusDistributionChart stats={stats} />
            <SectorBarChart stats={stats} userRole={user?.role || 'CLIENT'} />
          </div>

          {/* Recent Tickets */}
          <RecentTickets 
            tickets={recentTickets} 
            userRole={user?.role || 'CLIENT'} 
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
