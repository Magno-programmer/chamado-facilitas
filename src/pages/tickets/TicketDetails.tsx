
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useTicketDetails } from './hooks/useTicketDetails';
import TicketInfo from './components/TicketInfo';
import TicketMetadata from './components/TicketMetadata';
import TicketActions from './components/TicketActions';
import StatusUpdateDialog from './components/StatusUpdateDialog';
import DeleteTicketDialog from './components/DeleteTicketDialog';

const TicketDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    ticket,
    isLoading,
    authLoading,
    canManageTickets,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isStatusUpdateDialogOpen,
    setIsStatusUpdateDialogOpen,
    selectedStatus,
    isUpdating,
    form,
    handleDeleteTicket,
    handleStatusUpdate,
    openStatusDialog,
  } = useTicketDetails(id);

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
          <TicketInfo ticket={ticket} />
          
          {canManageTickets && (
            <TicketActions 
              ticket={ticket} 
              canManageTickets={canManageTickets} 
              openStatusDialog={openStatusDialog} 
              onDeleteClick={() => setIsDeleteDialogOpen(true)} 
            />
          )}
        </div>
        
        <div>
          <TicketMetadata ticket={ticket} />
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <DeleteTicketDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDeleteTicket}
        isUpdating={isUpdating}
      />

      {/* Status update dialog */}
      <StatusUpdateDialog 
        isOpen={isStatusUpdateDialogOpen}
        onOpenChange={setIsStatusUpdateDialogOpen}
        selectedStatus={selectedStatus}
        form={form}
        isUpdating={isUpdating}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default TicketDetails;
