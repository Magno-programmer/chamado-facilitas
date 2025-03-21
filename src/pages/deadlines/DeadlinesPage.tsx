import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSectors } from '@/lib/supabase';
import { getDeadlinesForUser, canManageDeadline } from '@/lib/services/deadlineService';
import { Clock, Plus, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from '@/hooks/useAuth';
import DeadlinesTable from './components/DeadlinesTable';
import CreateEditDeadlineDialog from './components/CreateEditDeadlineDialog';
import DeleteDeadlineDialog from './components/DeleteDeadlineDialog';
import { Navigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Deadline } from '@/lib/types/sector.types';

const DeadlinesPage = () => {
  const { user } = useAuth();
  
  // Fetch deadlines based on user permissions
  const { data: deadlines, isLoading, error, refetch } = useQuery({
    queryKey: ['deadlines', user?.id],
    queryFn: () => user ? getDeadlinesForUser(user) : Promise.resolve([]),
    enabled: !!user,
  });

  const [sectors, setSectors] = useState<{id: number, nome: string}[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDeadline, setDeletingDeadline] = useState<Deadline | null>(null);
  const [manageableDeadlines, setManageableDeadlines] = useState<{[id: number]: boolean}>({});
  
  // Check if user is admin or sector admin (GERENTE)
  const isAdmin = user?.role === 'ADMIN';
  const isSectorAdmin = user?.role === 'GERENTE';
  
  // Determine if the user can create new deadlines
  const [canCreateDeadlines, setCanCreateDeadlines] = useState(false);
  const [userSector, setUserSector] = useState<string | null>(null);
  const [isGeralSector, setIsGeralSector] = useState(false);

  // Fetch user's sector name 
  useEffect(() => {
    if (user) {
      const fetchSectorInfo = async () => {
        try {
          const sectors = await getSectors();
          const userSector = sectors.find(s => s.id === user.sectorId);
          setUserSector(userSector?.nome || null);
          
          // Check if user is from "Geral" sector
          const isFromGeralSector = userSector?.nome === 'Geral';
          setIsGeralSector(isFromGeralSector);
          
          // Admins and sector admins can create deadlines
          if (isAdmin || isSectorAdmin) {
            setCanCreateDeadlines(true);
          }
        }
        catch (error) {
          console.error('Error fetching sector info:', error);
        }
      };
      
      fetchSectorInfo();
    }
  }, [user, isAdmin, isSectorAdmin]);

  // Check which deadlines the user can manage (edit/delete)
  useEffect(() => {
    if (!user || !deadlines) return;
    
    const checkManageableDeadlines = async () => {
      const manageable: {[id: number]: boolean} = {};
      
      for (const deadline of deadlines) {
        const canManage = await canManageDeadline(user, deadline);
        manageable[deadline.id] = canManage;
      }
      
      setManageableDeadlines(manageable);
    };
    
    checkManageableDeadlines();
  }, [deadlines, user]);

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

  // Only admins and sector admins can access this page
  if (user && !isAdmin && !isSectorAdmin) {
    toast({
      title: "Acesso Restrito",
      description: "Apenas administradores e gerentes de setor podem gerenciar prazos.",
      variant: "destructive",
    });
    return <Navigate to="/dashboard" replace />;
  }

  const handleOpenEdit = async (deadline: Deadline) => {
    // Check if user can edit this deadline
    if (user && manageableDeadlines[deadline.id]) {
      setEditingDeadline(deadline);
      setIsDialogOpen(true);
    } else {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para editar este prazo.",
        variant: "destructive",
      });
    }
  };

  const handleOpenCreate = () => {
    if (canCreateDeadlines) {
      setEditingDeadline(null);
      setIsDialogOpen(true);
    } else {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para criar novos prazos.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = async (deadline: Deadline) => {
    // Check if user can delete this deadline
    if (user && manageableDeadlines[deadline.id]) {
      setDeletingDeadline(deadline);
      setDeleteDialogOpen(true);
    } else {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para excluir este prazo.",
        variant: "destructive",
      });
    }
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
        {canCreateDeadlines && (
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Prazo
          </Button>
        )}
      </div>
      
      {isAdmin && !isGeralSector && userSector && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Permissões Específicas</AlertTitle>
          <AlertDescription>
            Como administrador do setor {userSector}, você só pode visualizar e gerenciar prazos do seu próprio setor ou prazos sem setor definido.
          </AlertDescription>
        </Alert>
      )}
      
      {isAdmin && isGeralSector && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Permissões Administrativas</AlertTitle>
          <AlertDescription>
            Como administrador do setor Geral, você pode gerenciar prazos de todos os setores.
          </AlertDescription>
        </Alert>
      )}
      
      {isSectorAdmin && userSector && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Informação</AlertTitle>
          <AlertDescription>
            {isGeralSector 
              ? "Como gerente do setor Geral, você pode gerenciar prazos de todos os setores."
              : `Como gerente do setor ${userSector}, você só pode visualizar e gerenciar prazos do seu próprio setor ou prazos sem setor definido.`
            }
          </AlertDescription>
        </Alert>
      )}
      
      {!isAdmin && !isSectorAdmin && user && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Visualização Restrita</AlertTitle>
          <AlertDescription>
            Você está visualizando apenas os prazos relacionados ao seu setor ou prazos sem setor definido.
          </AlertDescription>
        </Alert>
      )}
      
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
            canManageDeadlines={manageableDeadlines}
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
        user={user}
        isSectorAdmin={isSectorAdmin}
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
