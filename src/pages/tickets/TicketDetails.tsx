
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Clock, RefreshCw, User, Trash2, Check, MessageSquareText, AlertTriangle } from 'lucide-react';
import { getTicketById, updateTicket } from '@/lib/services/ticketService';
import { TicketWithDetails, TicketStatus } from '@/lib/types/ticket.types';
import { UserRole } from '@/lib/types/user.types';
import StatusBadge from '@/components/StatusBadge';
import ProgressBar from '@/components/ProgressBar';
import RemainingTime from '@/components/RemainingTime';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const completionSchema = z.object({
  description: z.string().min(20, {
    message: "A descrição deve ter no mínimo 20 caracteres para concluir o chamado."
  })
});

type CompletionFormValues = z.infer<typeof completionSchema>;

const TicketDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [ticket, setTicket] = useState<TicketWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusUpdateDialogOpen, setIsStatusUpdateDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm<CompletionFormValues>({
    resolver: zodResolver(completionSchema),
    defaultValues: {
      description: '',
    },
  });

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const loadTicket = async () => {
    setIsLoading(true);
    try {
      if (id) {
        const ticketData = await getTicketById(parseInt(id));
        
        const convertToUserRole = (role: string): UserRole => {
          return role === 'ADMIN' ? 'ADMIN' : 'CLIENT';
        };
        
        const mappedTicket: TicketWithDetails = {
          id: ticketData.id,
          title: ticketData.titulo,
          description: ticketData.descricao || '',
          sectorId: ticketData.setor_id,
          requesterId: ticketData.solicitante_id,
          responsibleId: ticketData.responsavel_id,
          status: ticketData.status as TicketStatus,
          createdAt: ticketData.data_criacao,
          deadline: ticketData.prazo,
          sector: {
            id: ticketData.setor.id,
            name: ticketData.setor.nome
          },
          requester: {
            id: ticketData.solicitante.id,
            name: ticketData.solicitante.nome,
            email: ticketData.solicitante.email,
            sectorId: ticketData.solicitante.setor_id,
            role: convertToUserRole(ticketData.solicitante.role)
          },
          responsible: ticketData.responsavel ? {
            id: ticketData.responsavel.id,
            name: ticketData.responsavel.nome,
            email: ticketData.responsavel.email,
            sectorId: ticketData.responsavel.setor_id,
            role: convertToUserRole(ticketData.responsavel.role)
          } : null,
          percentageRemaining: calculatePercentageRemaining(ticketData.data_criacao, ticketData.prazo)
        };
        
        setTicket(mappedTicket);
        // Pre-fill the form with existing description if any
        if (ticketData.descricao) {
          form.setValue('description', ticketData.descricao);
        }
      }
    } catch (error) {
      console.error('Error loading ticket:', error);
      toast({
        title: "Erro ao carregar o chamado",
        description: "Não foi possível carregar os detalhes do chamado.",
        variant: "destructive",
      });
      navigate('/tickets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && id) {
      loadTicket();
    }
  }, [id, isAuthenticated, navigate]);

  const calculatePercentageRemaining = (createdAt: string, deadline: string) => {
    const now = new Date();
    const start = new Date(createdAt);
    const end = new Date(deadline);
    
    const totalTime = end.getTime() - start.getTime();
    const elapsedTime = now.getTime() - start.getTime();
    
    if (totalTime <= 0) return 0;
    
    const percentage = 100 - (elapsedTime / totalTime) * 100;
    return Math.max(0, Math.min(100, percentage));
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
  };

  const handleDeleteTicket = async () => {
    if (!ticket) return;
    
    setIsUpdating(true);
    try {
      await updateTicket(ticket.id, { 
        status: 'Excluído' // We're using a soft delete approach by changing the status
      });
      toast({
        title: "Chamado excluído",
        description: "O chamado foi excluído com sucesso.",
      });
      navigate('/tickets');
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast({
        title: "Erro ao excluir o chamado",
        description: "Não foi possível excluir o chamado.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleStatusUpdate = async (status: TicketStatus) => {
    if (!ticket) return;
    
    setIsUpdating(true);
    try {
      if (status === 'Concluído') {
        // For "Concluído" status, we need to validate the description
        await form.trigger();
        if (!form.formState.isValid) {
          setIsUpdating(false);
          return;
        }
        
        const formValues = form.getValues();
        
        await updateTicket(ticket.id, { 
          status: status,
          descricao: formValues.description
        });
      } else {
        // For other statuses, we don't need to validate the description
        await updateTicket(ticket.id, { 
          status: status
        });
      }
      
      toast({
        title: "Status atualizado",
        description: `O chamado foi atualizado para "${status}".`,
      });
      
      setIsStatusUpdateDialogOpen(false);
      loadTicket(); // Reload the ticket data
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast({
        title: "Erro ao atualizar o status",
        description: "Não foi possível atualizar o status do chamado.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const openStatusDialog = (status: TicketStatus) => {
    setSelectedStatus(status);
    setIsStatusUpdateDialogOpen(true);
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col p-4 md:p-8 pt-20">
        <div className="flex items-center justify-center h-full">
          <RefreshCw className="h-12 w-12 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col p-4 md:p-8 pt-20">
        <div className="flex items-center justify-center h-full flex-col">
          <h2 className="text-2xl font-bold mb-4">Chamado não encontrado</h2>
          <button
            onClick={() => navigate('/tickets')}
            className="flex items-center text-primary hover:underline"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar para a lista de chamados
          </button>
        </div>
      </div>
    );
  }

  const isCompleted = ticket.status === 'Concluído';

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 pt-20 animate-slide-up">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/tickets')}
          className="flex items-center text-muted-foreground hover:text-foreground mr-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar
        </button>
        <h1 className="text-3xl font-bold">Detalhes do Chamado #{ticket.id}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-semibold">{ticket.title}</h2>
              <StatusBadge status={ticket.status} />
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Descrição</h3>
              <p className="whitespace-pre-line">{ticket.description || 'Sem descrição'}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Progresso</h3>
              <ProgressBar 
                percentage={ticket.percentageRemaining}
                deadline={ticket.deadline}
                createdAt={ticket.createdAt}
                autoUpdate={!isCompleted}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Tempo Restante</h3>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <RemainingTime deadline={ticket.deadline} createdAt={ticket.createdAt} />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Setor</h3>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{ticket.sector?.name || 'Não definido'}</span>
                </div>
              </div>
            </div>
            
            {isAdmin && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Ações de Administrador</h3>
                <div className="flex flex-wrap gap-4">
                  {ticket.status !== 'Em Andamento' && ticket.status !== 'Concluído' && (
                    <Button 
                      variant="secondary" 
                      onClick={() => openStatusDialog('Em Andamento')}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Iniciar Atendimento
                    </Button>
                  )}
                  
                  {ticket.status !== 'Concluído' && (
                    <Button 
                      variant="default" 
                      onClick={() => openStatusDialog('Concluído')}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Concluir Chamado
                    </Button>
                  )}
                  
                  <Button 
                    variant="destructive" 
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir Chamado
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Informações do Chamado</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Solicitante</p>
                <p className="font-medium">{ticket.requester?.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Responsável</p>
                <p className="font-medium">{ticket.responsible?.name || 'Não atribuído'}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Data de criação</p>
                <p className="font-medium">{formatDate(ticket.createdAt)}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Prazo</p>
                <p className="font-medium">{formatDate(ticket.deadline)}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={ticket.status} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Excluir Chamado</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este chamado? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isUpdating}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteTicket} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status update dialog */}
      <Dialog open={isStatusUpdateDialogOpen} onOpenChange={setIsStatusUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {selectedStatus === 'Em Andamento' ? 'Iniciar Atendimento' : 'Concluir Chamado'}
            </DialogTitle>
            <DialogDescription>
              {selectedStatus === 'Em Andamento' 
                ? 'Iniciar o atendimento deste chamado? O status será alterado para "Em Andamento".'
                : 'Para concluir este chamado, é necessário fornecer uma descrição da solução com pelo menos 20 caracteres.'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedStatus === 'Concluído' && (
            <Form {...form}>
              <form onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit(() => handleStatusUpdate('Concluído'))();
              }} className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição da Solução</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva a solução implementada em detalhes..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center text-sm text-muted-foreground">
                  <MessageSquareText className="h-4 w-4 mr-2" />
                  <span>
                    {form.watch('description')?.length || 0} / 20 caracteres mínimos
                  </span>
                </div>
                {form.watch('description')?.length < 20 && (
                  <div className="flex items-center text-sm text-amber-500">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span>
                      É necessário uma descrição com pelo menos 20 caracteres
                    </span>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsStatusUpdateDialogOpen(false)} disabled={isUpdating} type="button">
                    Cancelar
                  </Button>
                  <Button variant="default" type="submit" disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Concluir Chamado
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
          
          {selectedStatus === 'Em Andamento' && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsStatusUpdateDialogOpen(false)} disabled={isUpdating}>
                Cancelar
              </Button>
              <Button variant="default" onClick={() => handleStatusUpdate('Em Andamento')} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Iniciar Atendimento
                  </>
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicketDetails;
