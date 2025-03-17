
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Deadline } from '@/lib/types';
import { Plus, RefreshCw, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DeadlineForm from '@/components/DeadlineForm';
import DeadlinesTable from '@/components/DeadlinesTable';

const DeadlinesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDeadline, setCurrentDeadline] = useState<Deadline | null>(null);
  
  // Get current user role from localStorage
  const currentUserRole = JSON.parse(localStorage.getItem('user') || '{}')?.role;
  const isAdmin = currentUserRole === 'ADMIN';

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
      navigate('/login');
      return;
    }

    // Mock loading data
    const timer = setTimeout(() => {
      // Mock deadlines data
      const mockDeadlines: Deadline[] = [
        { id: 1, title: 'Prioridade Alta - TI', sectorId: 1, deadline: 'P1D' },  // 1 day
        { id: 2, title: 'Prioridade Média - TI', sectorId: 1, deadline: 'P3D' }, // 3 days
        { id: 3, title: 'Prioridade Baixa - TI', sectorId: 1, deadline: 'P7D' }, // 7 days
        { id: 4, title: 'Prioridade Alta - RH', sectorId: 3, deadline: 'P2D' },  // 2 days
        { id: 5, title: 'Prioridade Média - RH', sectorId: 3, deadline: 'P5D' }, // 5 days
        { id: 6, title: 'Prioridade Alta - Vendas', sectorId: 4, deadline: 'P1D' }, // 1 day
      ];
      
      setDeadlines(mockDeadlines);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleAddDeadline = () => {
    setCurrentDeadline(null);
    setIsModalOpen(true);
  };

  const handleEditDeadline = (deadline: Deadline) => {
    setCurrentDeadline(deadline);
    setIsModalOpen(true);
  };

  const handleDeleteDeadline = (deadlineId: number) => {
    // In a real application, this would be an API call
    if (window.confirm('Tem certeza que deseja excluir este prazo?')) {
      const updatedDeadlines = deadlines.filter(deadline => deadline.id !== deadlineId);
      setDeadlines(updatedDeadlines);
      
      toast({
        title: 'Prazo excluído',
        description: 'O prazo foi removido com sucesso.',
      });
    }
  };

  const handleSaveDeadline = (deadlineData: Deadline) => {
    let updatedDeadlines;
    
    if (currentDeadline) {
      // Edit existing deadline
      updatedDeadlines = deadlines.map(deadline => 
        deadline.id === currentDeadline.id ? { ...deadlineData, id: deadline.id } : deadline
      );
      toast({
        title: 'Prazo atualizado',
        description: 'As informações do prazo foram atualizadas com sucesso.',
      });
    } else {
      // Add new deadline
      const newDeadline = {
        ...deadlineData,
        id: Math.max(0, ...deadlines.map(d => d.id)) + 1,
      };
      updatedDeadlines = [...deadlines, newDeadline];
      toast({
        title: 'Prazo adicionado',
        description: 'O novo prazo foi adicionado com sucesso.',
      });
    }
    
    setDeadlines(updatedDeadlines);
    setIsModalOpen(false);
  };

  if (isLoading) {
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">⏳ Gerenciar Prazos</h1>
          <p className="text-muted-foreground">{isAdmin ? 'Gerencie os prazos do sistema' : 'Visualize os prazos do sistema'}</p>
        </div>
        {isAdmin && (
          <Button onClick={handleAddDeadline}>
            <Plus className="h-5 w-5 mr-2" />
            Novo Prazo
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border shadow-sm p-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Buscar prazos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Deadlines Table with Title */}
      <h3 className="text-xl font-semibold mb-4">📋 Prazos Cadastrados</h3>
      <DeadlinesTable 
        deadlines={deadlines} 
        isAdmin={isAdmin} 
        onEdit={handleEditDeadline} 
        onDelete={handleDeleteDeadline} 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* Deadline Form Modal */}
      {isModalOpen && (
        <DeadlineForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveDeadline}
          deadline={currentDeadline}
        />
      )}
    </div>
  );
};

export default DeadlinesPage;
