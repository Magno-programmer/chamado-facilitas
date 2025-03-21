
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { TicketStatus } from '@/lib/types/ticket.types';
import { useTicketDetails } from './hooks/useTicketDetails';
import { useTicketActions } from './hooks/useTicketActions';
import TicketDetailsContent from './components/TicketDetailsContent';
import TicketInfoPanel from './components/TicketInfoPanel';
import DeleteTicketDialog from './components/dialogs/DeleteTicketDialog';
import StatusUpdateDialog from './components/dialogs/StatusUpdateDialog';
import AssignTicketDialog from './components/dialogs/AssignTicketDialog';

const TicketDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    ticket,
    setTicket,
    isLoading,
    authLoading,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isStatusUpdateDialogOpen,
    setIsStatusUpdateDialogOpen,
    isAssignDialogOpen,
    setIsAssignDialogOpen,
    selectedStatus,
    setSelectedStatus,
    sectorEmployees,
    isLoadingEmployees,
    canDeleteTicket,
    canEditTicket,
    canAssignTicket,
    loadTicket,
    handleTicketExpired
  } = useTicketDetails(id);

  const {
    completionForm,
    assignForm,
    isUpdating,
    handleDeleteTicket,
    handleStatusUpdate,
    handleAssignTicket
  } = useTicketActions(ticket, setTicket, loadTicket);

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
          <TicketDetailsContent
            ticket={ticket}
            canEditTicket={canEditTicket}
            canDeleteTicket={canDeleteTicket}
            canAssignTicket={canAssignTicket}
            onOpenAssignDialog={() => setIsAssignDialogOpen(true)}
            onOpenStatusDialog={openStatusDialog}
            onOpenDeleteDialog={() => setIsDeleteDialogOpen(true)}
            handleTicketExpired={handleTicketExpired}
          />
        </div>
        
        <div>
          <TicketInfoPanel ticket={ticket} />
        </div>
      </div>

      {/* Dialogs */}
      <DeleteTicketDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={() => handleDeleteTicket(canDeleteTicket)}
        isDeleting={isUpdating}
      />

      <StatusUpdateDialog
        isOpen={isStatusUpdateDialogOpen}
        onOpenChange={setIsStatusUpdateDialogOpen}
        onStatusUpdate={(status) => handleStatusUpdate(status, canEditTicket)}
        selectedStatus={selectedStatus}
        isUpdating={isUpdating}
        completionForm={completionForm}
      />

      <AssignTicketDialog
        isOpen={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        onAssign={() => handleAssignTicket(canAssignTicket)}
        isUpdating={isUpdating}
        isLoadingEmployees={isLoadingEmployees}
        sectorEmployees={sectorEmployees}
        assignForm={assignForm}
      />
    </div>
  );
};

export default TicketDetails;
