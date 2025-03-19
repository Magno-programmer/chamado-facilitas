
import React from 'react';
import { BarChart as BarChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface SectorBarChartProps {
  sectorData: {
    sectorId: number;
    sectorName: string;
    count: number;
  }[];
}

const SectorBarChart: React.FC<SectorBarChartProps> = ({ sectorData }) => {
  const barData = sectorData.map((item) => ({
    name: item.sectorName,
    Chamados: item.count,
  }));

  const chartConfig = {
    Chamados: { color: '#3b82f6' }
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Chamados por Setor</h2>
        <div className="bg-secondary rounded-md p-1">
          <BarChartIcon className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
      <div className="h-64">
        <ChartContainer config={chartConfig}>
          <BarChart
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
            <ChartTooltip
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="Chamados" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
};

export default SectorBarChart;
