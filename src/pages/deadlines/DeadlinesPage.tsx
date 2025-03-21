
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import DeadlinesTable from './components/DeadlinesTable';
import CreateEditDeadlineDialog from './components/CreateEditDeadlineDialog';
import DeleteDeadlineDialog from './components/DeleteDeadlineDialog';
import DeadlinesMessage from './components/DeadlinesMessage';
import { 
  getDeadlinesForUser, 
  saveDeadline, 
  deleteDeadline, 
  canManageDeadline 
} from '@/lib/services/deadlineService';
import { supabase } from '@/integrations/supabase/client';
import { Deadline } from '@/lib/types/sector.types';

const DeadlinesPage = () => {
  const { user } = useAuth();
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDeadline, setDeletingDeadline] = useState<Deadline | null>(null);
  const [canManageDeadlines, setCanManageDeadlines] = useState<{[id: number]: boolean}>({});
  const [setores, setSetores] = useState<{id: number, nome: string}[]>([]);
  
  useEffect(() => {
    const fetchSetores = async () => {
      try {
        const { data, error } = await supabase
          .from('setores')
          .select('id, nome')
          .order('nome');
          
        if (error) throw error;
        setSetores(data || []);
      } catch (error) {
        console.error('Error fetching setores:', error);
        toast({
          title: 'Erro ao carregar setores',
          description: 'Não foi possível carregar a lista de setores.',
          variant: 'destructive',
        });
      }
    };
    
    fetchSetores();
  }, []);
  
  useEffect(() => {
    const fetchDeadlines = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const deadlinesData = await getDeadlinesForUser(user);
        setDeadlines(deadlinesData);
        
        // Check management permissions for each deadline
        const permissions: {[id: number]: boolean} = {};
        for (const deadline of deadlinesData) {
          if (!deadline.id) continue;
          permissions[deadline.id] = await canManageDeadline(user, deadline);
        }
        
        setCanManageDeadlines(permissions);
      } catch (error) {
        console.error('Error fetching deadlines:', error);
        toast({
          title: 'Erro ao carregar dados',
          description: 'Não foi possível carregar os prazos.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDeadlines();
  }, [user]);
  
  const handleCreate = () => {
    setEditingDeadline(null);
    setIsDialogOpen(true);
  };
  
  const handleEdit = (deadline: Deadline) => {
    setEditingDeadline(deadline);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (deadline: Deadline) => {
    setDeletingDeadline(deadline);
    setDeleteDialogOpen(true);
  };
  
  const handleSaveDeadline = async (data: Partial<Deadline>) => {
    try {
      setLoading(true);
      
      // Prepare the deadline object
      const deadlineData: Partial<Deadline> = {
        titulo: data.titulo,
        prazo: data.prazo,
        setor_id: data.setor_id
      };
      
      const savedDeadline = await saveDeadline(
        deadlineData, 
        editingDeadline?.id
      );
      
      if (editingDeadline) {
        // Update in the list
        setDeadlines(prevDeadlines => 
          prevDeadlines.map(d => d.id === savedDeadline.id ? savedDeadline : d)
        );
        toast({
          title: 'Prazo atualizado',
          description: 'O prazo foi atualizado com sucesso.'
        });
      } else {
        // Add to the list
        setDeadlines(prevDeadlines => [...prevDeadlines, savedDeadline]);
        toast({
          title: 'Prazo criado',
          description: 'O novo prazo foi criado com sucesso.'
        });
      }
      
      // Update permissions for this deadline
      if (user && savedDeadline.id) {
        const canManage = await canManageDeadline(user, savedDeadline);
        setCanManageDeadlines(prev => ({
          ...prev,
          [savedDeadline.id!]: canManage
        }));
      }
      
      setIsDialogOpen(false);
      setEditingDeadline(null);
    } catch (error) {
      console.error('Error saving deadline:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o prazo.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleConfirmDelete = async () => {
    if (!deletingDeadline?.id) return;
    
    try {
      setLoading(true);
      await deleteDeadline(deletingDeadline.id);
      
      setDeadlines(prevDeadlines => 
        prevDeadlines.filter(d => d.id !== deletingDeadline.id)
      );
      
      toast({
        title: 'Prazo excluído',
        description: 'O prazo foi excluído com sucesso.'
      });
      
      setDeleteDialogOpen(false);
      setDeletingDeadline(null);
    } catch (error) {
      console.error('Error deleting deadline:', error);
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o prazo.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const canCreateDeadlines = user?.role === 'ADMIN' || user?.role === 'Gerente';
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Prazos</h1>
        {canCreateDeadlines && (
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Prazo
          </Button>
        )}
      </div>
      
      <DeadlinesMessage 
        title="Gerenciamento de Prazos"
        description="Aqui você pode visualizar e gerenciar os prazos para os diferentes setores. Os prazos definidos afetam o tempo disponível para resolução de chamados."
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Prazos</CardTitle>
        </CardHeader>
        <CardContent>
          <DeadlinesTable 
            deadlines={deadlines}
            canManageDeadlines={canManageDeadlines}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
      
      <CreateEditDeadlineDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        deadline={editingDeadline}
        onSave={handleSaveDeadline}
        loading={loading}
        setores={setores}
      />
      
      <DeleteDeadlineDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        deadline={deletingDeadline}
        onConfirm={handleConfirmDelete}
        loading={loading}
      />
    </div>
  );
};

export default DeadlinesPage;
