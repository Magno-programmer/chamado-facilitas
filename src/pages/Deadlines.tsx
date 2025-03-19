
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Deadline, Sector } from '@/lib/types';
import { Plus, RefreshCw, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DeadlineForm from '@/components/DeadlineForm';
import DeadlinesTable from '@/components/DeadlinesTable';
import { getSectors } from '@/services/sectorService';
import { getDeadlines, createDeadline, updateDeadline, deleteDeadline } from '@/services/deadlineService';

const DeadlinesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
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

    const fetchData = async () => {
      try {
        // Fetch sectors and deadlines
        const [sectorData, deadlinesData] = await Promise.all([
          getSectors(),
          getDeadlines()
        ]);
        
        setSectors(sectorData);
        setDeadlines(deadlinesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Erro ao carregar dados',
          description: 'Não foi possível carregar os dados. Tente novamente mais tarde.',
          variant: 'destructive'
        });
        
        // Fallback to empty arrays if there's an error
        setSectors([]);
        setDeadlines([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate, toast]);

  const handleAddDeadline = () => {
    setCurrentDeadline(null);
    setIsModalOpen(true);
  };

  const handleEditDeadline = (deadline: Deadline) => {
    setCurrentDeadline(deadline);
    setIsModalOpen(true);
  };

  const handleDeleteDeadline = async (deadlineId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este prazo?')) {
      try {
        await deleteDeadline(deadlineId);
        const updatedDeadlines = deadlines.filter(deadline => deadline.id !== deadlineId);
        setDeadlines(updatedDeadlines);
        
        toast({
          title: 'Prazo excluído',
          description: 'O prazo foi removido com sucesso.',
        });
      } catch (error) {
        console.error('Error deleting deadline:', error);
        toast({
          title: 'Erro ao excluir prazo',
          description: 'Não foi possível excluir o prazo. Tente novamente mais tarde.',
          variant: 'destructive'
        });
      }
    }
  };

  const handleSaveDeadline = async (deadlineData: Deadline) => {
    try {
      let updatedDeadline;
      
      if (currentDeadline) {
        // Edit existing deadline
        updatedDeadline = await updateDeadline(currentDeadline.id, deadlineData);
        if (updatedDeadline) {
          setDeadlines(deadlines.map(deadline => 
            deadline.id === currentDeadline.id ? updatedDeadline! : deadline
          ));
          toast({
            title: 'Prazo atualizado',
            description: 'As informações do prazo foram atualizadas com sucesso.',
          });
        }
      } else {
        // Add new deadline
        updatedDeadline = await createDeadline(deadlineData);
        if (updatedDeadline) {
          setDeadlines([...deadlines, updatedDeadline]);
          toast({
            title: 'Prazo adicionado',
            description: 'O novo prazo foi adicionado com sucesso.',
          });
        }
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving deadline:', error);
      toast({
        title: 'Erro ao salvar prazo',
        description: 'Não foi possível salvar o prazo. Tente novamente mais tarde.',
        variant: 'destructive'
      });
    }
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
        sectors={sectors}
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
