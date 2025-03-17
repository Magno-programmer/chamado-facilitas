
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TicketNotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 pt-20">
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Chamado não encontrado</h2>
          <p className="text-muted-foreground mb-4">
            O chamado que você está procurando não existe ou foi removido.
          </p>
          <Button onClick={() => navigate('/tickets')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Chamados
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TicketNotFound;
