
import React from 'react';
import { Bell, Clock, FileText } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    completedTickets: number;
    lateTickets: number;
  };
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
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
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => (
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
  );
};

export default StatsCards;
