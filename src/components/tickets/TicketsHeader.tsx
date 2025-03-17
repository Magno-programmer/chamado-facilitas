
import React from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TicketsHeader: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">Chamados</h1>
        <p className="text-muted-foreground">Gerencie e acompanhe todos os chamados</p>
      </div>
      <button
        onClick={() => navigate('/tickets/new')}
        className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm inline-flex items-center justify-center whitespace-nowrap"
      >
        <Plus className="h-5 w-5 mr-2" />
        Novo Chamado
      </button>
    </div>
  );
};

export default TicketsHeader;
