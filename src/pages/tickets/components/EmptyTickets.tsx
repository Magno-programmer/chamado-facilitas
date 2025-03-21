
import React from 'react';
import { Search } from 'lucide-react';

interface EmptyTicketsProps {
  onResetFilters: () => void;
}

const EmptyTickets: React.FC<EmptyTicketsProps> = ({ onResetFilters }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="bg-secondary rounded-full p-4 mb-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-bold mb-2">Nenhum resultado encontrado</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Não encontramos chamados com os filtros atuais. Tente ajustar seus critérios de busca.
      </p>
      <button
        onClick={onResetFilters}
        className="bg-secondary hover:bg-secondary/70 text-foreground px-4 py-2 rounded-lg transition-all duration-200"
      >
        Limpar Filtros
      </button>
    </div>
  );
};

export default EmptyTickets;
