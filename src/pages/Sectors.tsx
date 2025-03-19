import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sector } from '@/lib/types';
import { Plus, RefreshCw, Search, Edit, Trash, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SectorForm from '@/components/SectorForm';
import { getSectors, createSector, updateSector, deleteSector } from '@/services/sectorService';

const SectorsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [filteredSectors, setFilteredSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSector, setCurrentSector] = useState<Sector | null>(null);
  
  // Get current user role from localStorage
  const currentUserRole = JSON.parse(localStorage.getItem('user') || '{}')?.role;
  const isAdmin = currentUserRole === 'ADMIN';

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
      navigate('/login');
      return;
    }

    const fetchSectors = async () => {
      try {
        const sectorData = await getSectors();
        setSectors(sectorData);
        setFilteredSectors(sectorData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching sectors:', error);
        toast({
          title: 'Erro ao carregar setores',
          description: 'Não foi possível carregar os setores. Tente novamente mais tarde.',
          variant: 'destructive'
        });
        setSectors([]);
        setFilteredSectors([]);
        setIsLoading(false);
      }
    };

    fetchSectors();
  }, [navigate, toast]);

  // Apply search filter when searchTerm changes
  useEffect(() => {
    if (sectors.length === 0) return;

    if (searchTerm) {
      const filtered = sectors.filter(sector => 
        sector.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSectors(filtered);
    } else {
      setFilteredSectors(sectors);
    }
  }, [searchTerm, sectors]);

  const handleAddSector = () => {
    setCurrentSector(null);
    setIsModalOpen(true);
  };

  const handleEditSector = (sector: Sector) => {
    setCurrentSector(sector);
    setIsModalOpen(true);
  };

  const handleDeleteSector = async (sectorId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este setor?')) {
      try {
        await deleteSector(sectorId);
        const updatedSectors = sectors.filter(sector => sector.id !== sectorId);
        setSectors(updatedSectors);
        setFilteredSectors(updatedSectors.filter(sector => 
          sector.name.toLowerCase().includes(searchTerm.toLowerCase())
        ));
        
        toast({
          title: 'Setor excluído',
          description: 'O setor foi removido com sucesso.',
        });
      } catch (error) {
        console.error('Error deleting sector:', error);
        toast({
          title: 'Erro ao excluir setor',
          description: 'Não foi possível excluir o setor. Tente novamente mais tarde.',
          variant: 'destructive'
        });
      }
    }
  };

  const handleSaveSector = async (sectorData: Sector) => {
    try {
      let updatedSector;
      
      if (currentSector) {
        // Edit existing sector
        updatedSector = await updateSector(currentSector.id, sectorData.name);
        if (updatedSector) {
          const updatedSectors = sectors.map(sector => 
            sector.id === currentSector.id ? updatedSector! : sector
          );
          setSectors(updatedSectors);
          setFilteredSectors(updatedSectors.filter(sector => 
            sector.name.toLowerCase().includes(searchTerm.toLowerCase())
          ));
          toast({
            title: 'Setor atualizado',
            description: 'As informações do setor foram atualizadas com sucesso.',
          });
        }
      } else {
        // Add new sector
        updatedSector = await createSector(sectorData.name);
        if (updatedSector) {
          const updatedSectors = [...sectors, updatedSector];
          setSectors(updatedSectors);
          setFilteredSectors(updatedSectors.filter(sector => 
            sector.name.toLowerCase().includes(searchTerm.toLowerCase())
          ));
          toast({
            title: 'Setor adicionado',
            description: 'O novo setor foi adicionado com sucesso.',
          });
        }
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving sector:', error);
      toast({
        title: 'Erro ao salvar setor',
        description: 'Não foi possível salvar o setor. Tente novamente mais tarde.',
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
          <h1 className="text-3xl font-bold mb-2">Setores</h1>
          <p className="text-muted-foreground">{isAdmin ? 'Gerencie os setores do sistema' : 'Visualize os setores do sistema'}</p>
        </div>
        {isAdmin && (
          <Button onClick={handleAddSector}>
            <Plus className="h-5 w-5 mr-2" />
            Novo Setor
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
              placeholder="Buscar setores..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Sectors Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome</TableHead>
              {isAdmin && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSectors.length > 0 ? (
              filteredSectors.map(sector => (
                <TableRow key={sector.id}>
                  <TableCell className="font-medium">{sector.id}</TableCell>
                  <TableCell>{sector.name}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditSector(sector)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteSector(sector.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isAdmin ? 3 : 2} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-secondary rounded-full p-4 mb-4">
                      <Building className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Nenhum setor encontrado</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                      Não encontramos setores com os critérios de busca atuais.
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

      {/* Sector Form Modal */}
      {isModalOpen && (
        <SectorForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveSector}
          sector={currentSector}
        />
      )}
    </div>
  );
};

export default SectorsPage;
