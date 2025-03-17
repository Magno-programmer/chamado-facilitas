
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Deadline } from '@/lib/types';
import { Plus, RefreshCw, Search, Edit, Trash, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DeadlineForm from '@/components/DeadlineForm';
import { mockSectors } from '@/lib/mockData';

const DeadlinesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [filteredDeadlines, setFilteredDeadlines] = useState<Deadline[]>([]);
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
      setFilteredDeadlines(mockDeadlines);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [navigate]);

  // Apply search filter when searchTerm changes
  useEffect(() => {
    if (deadlines.length === 0) return;

    if (searchTerm) {
      const filtered = deadlines.filter(deadline => 
        deadline.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDeadlines(filtered);
    } else {
      setFilteredDeadlines(deadlines);
    }
  }, [searchTerm, deadlines]);

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
      setFilteredDeadlines(updatedDeadlines.filter(deadline => 
        deadline.title.toLowerCase().includes(searchTerm.toLowerCase())
      ));
      
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
    setFilteredDeadlines(updatedDeadlines.filter(deadline => 
      deadline.title.toLowerCase().includes(searchTerm.toLowerCase())
    ));
    setIsModalOpen(false);
  };

  const getSectorName = (sectorId: number) => {
    const sector = mockSectors.find(s => s.id === sectorId);
    return sector ? sector.name : 'Setor não encontrado';
  };

  const formatDeadline = (deadline: string) => {
    // Format ISO duration string to human readable format
    // Example: P1D -> 1 dia, P2D -> 2 dias, PT12H -> 12 horas
    const dayMatch = deadline.match(/P(\d+)D/);
    const hourMatch = deadline.match(/PT(\d+)H/);
    
    if (dayMatch) {
      const days = parseInt(dayMatch[1]);
      return days === 1 ? '1 dia' : `${days} dias`;
    } else if (hourMatch) {
      const hours = parseInt(hourMatch[1]);
      return hours === 1 ? '1 hora' : `${hours} horas`;
    }
    
    return deadline;
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
          <h1 className="text-3xl font-bold mb-2">Prazos</h1>
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

      {/* Deadlines Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead>Prazo</TableHead>
              {isAdmin && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDeadlines.length > 0 ? (
              filteredDeadlines.map(deadline => (
                <TableRow key={deadline.id}>
                  <TableCell className="font-medium">{deadline.id}</TableCell>
                  <TableCell>{deadline.title}</TableCell>
                  <TableCell>{getSectorName(deadline.sectorId)}</TableCell>
                  <TableCell>{formatDeadline(deadline.deadline)}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditDeadline(deadline)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteDeadline(deadline.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 4} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-secondary rounded-full p-4 mb-4">
                      <Clock className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Nenhum prazo encontrado</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                      Não encontramos prazos com os critérios de busca atuais.
                    </p>
                    {searchTerm && (
                      <Button variant="outline" onClick={() => setSearchTerm('')}>
                        Limpar Filtros
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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
