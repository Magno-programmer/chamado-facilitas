
import React from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/lib/types';

interface DashboardHeaderProps {
  userRole: UserRole;
  showTable: boolean;
  toggleView: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  userRole, 
  showTable, 
  toggleView 
}) => {
  const navigate = useNavigate();
  
  const title = userRole === 'CLIENT' ? "Meus Chamados" : "Dashboard";
  const subtitle = userRole === 'CLIENT' 
    ? "Visualização dos seus chamados" 
    : "Visão geral do sistema de chamados";

  return (
    <div className="mb-8 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={toggleView}
          className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          {showTable ? 'Ver Cards' : 'Ver Tabela'}
        </button>
        <button
          onClick={() => navigate('/tickets/new')}
          className="px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors inline-flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Chamado
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
