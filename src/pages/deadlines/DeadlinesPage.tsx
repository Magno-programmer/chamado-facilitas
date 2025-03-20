
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDeadlines, getSectors } from '@/lib/supabase';
import { Clock, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import DeadlinesTable from './components/DeadlinesTable';
import CreateEditDeadlineDialog from './components/CreateEditDeadlineDialog';
import DeleteDeadlineDialog from './components/DeleteDeadlineDialog';

const DeadlinesPage = () => {
  const { data: deadlines, isLoading, error, refetch } = useQuery({
    queryKey: ['deadlines'],
    queryFn: getDeadlines,
  });

  const [sectors, setSectors] = useState<{id: number, nome: string}[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDeadline, setDeletingDeadline] = useState<any | null>(null);
  const { user } = useAuth();
  
  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN';

  // Load sectors for the dropdown
  useEffect(() => {
    const loadSectors = async () => {
      try {
        const sectorsData = await getSectors();
        setSectors(sectorsData);
      } catch (error) {
        console.error('Error loading sectors:', error);
      }
    };
    
    loadSectors();
  }, []);

  const handleOpenEdit = (deadline: any) => {
    setEditingDeadline(deadline);
    setIsDialogOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingDeadline(null);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (deadline: any) => {
    setDeletingDeadline(deadline);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Prazos
            </CardTitle>
            <CardDescription>Gerenciamento de prazos para os setores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center h-40">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-6 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-500">Erro ao carregar prazos</CardTitle>
            <CardDescription>
              Ocorreu um erro ao tentar carregar os prazos. Por favor, tente novamente mais tarde.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Prazos</h1>
        {isAdmin && (
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Prazo
          </Button>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Prazos
          </CardTitle>
          <CardDescription>Gerenciamento de prazos para os setores</CardDescription>
        </CardHeader>
        <CardContent>
          <DeadlinesTable 
            deadlines={deadlines || []} 
            isAdmin={isAdmin} 
            onEdit={handleOpenEdit} 
            onDelete={handleDeleteClick} 
          />
        </CardContent>
      </Card>

      <CreateEditDeadlineDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        deadline={editingDeadline} 
        sectors={sectors} 
        onSuccess={refetch} 
      />

      <DeleteDeadlineDialog 
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen} 
        deadline={deletingDeadline} 
        onSuccess={refetch} 
      />
    </div>
  );
};

export default DeadlinesPage;
