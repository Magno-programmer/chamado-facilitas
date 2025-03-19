
import React from 'react';
import { Settings } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface StatusDistributionChartProps {
  stats: {
    openTickets: number;
    inProgressTickets: number;
    completedTickets: number;
    lateTickets: number;
  };
}

const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({ stats }) => {
  const COLORS = ['#3b82f6', '#f59e0b', '#22c55e', '#ef4444'];
  const RADIAN = Math.PI / 180;

  const pieData = [
    { name: 'Abertos', value: stats.openTickets },
    { name: 'Em Andamento', value: stats.inProgressTickets },
    { name: 'Concluídos', value: stats.completedTickets },
    { name: 'Atrasados', value: stats.lateTickets },
  ];

  const chartConfig = {
    Abertos: { color: '#3b82f6' },
    'Em Andamento': { color: '#f59e0b' },
    Concluídos: { color: '#22c55e' },
    Atrasados: { color: '#ef4444' },
  };

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

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Distribuição de Status</h2>
        <div className="bg-secondary rounded-md p-1">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
      <div className="h-64">
        <ChartContainer config={chartConfig}>
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
            <ChartTooltip 
              content={<ChartTooltipContent />}
            />
          </PieChart>
        </ChartContainer>
      </div>
    </div>
  );
};

export default StatusDistributionChart;
