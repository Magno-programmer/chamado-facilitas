
import React from 'react';
import { BarChart } from 'lucide-react';
import { BarChart as RechartBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardStats } from '@/lib/types/dashboard.types';
import { UserRole } from '@/lib/types';

interface SectorBarChartProps {
  stats: DashboardStats;
  userRole: UserRole;
}

const SectorBarChart: React.FC<SectorBarChartProps> = ({ stats, userRole }) => {
  const barData = stats.ticketsBySector.map((item) => ({
    name: item.sectorName,
    Chamados: item.count,
  }));

  const title = userRole === 'CLIENT' ? 'Meus Chamados por Setor' : 'Chamados por Setor';

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
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
            <Bar dataKey="Chamados" fill="#3b82f6" />
          </RechartBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SectorBarChart;
