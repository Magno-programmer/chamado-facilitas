
import React, { useEffect } from 'react';
import DeadlineSelector from './components/DeadlineSelector';
import TicketDescription from './components/TicketDescription';
import TicketFormActions from './components/TicketFormActions';
import { useDeadlines } from './hooks/useDeadlines';
import { useTicketCreation } from './hooks/useTicketCreation';

const NewTicket = () => {
  const { 
    selectedDeadlineId, 
    deadlines, 
    isLoadingDeadlines, 
    handleDeadlineChange 
  } = useDeadlines();
  
  const {
    title,
    setTitle,
    description,
    setDescription,
    isSubmitting,
    handleSubmit,
    handleCancel
  } = useTicketCreation();

  // Update title when deadline changes
  useEffect(() => {
    if (selectedDeadlineId) {
      const selectedDeadline = deadlines.find((d) => d.id === selectedDeadlineId);
      if (selectedDeadline) {
        setTitle(selectedDeadline.titulo);
      }
    }
  }, [selectedDeadlineId, deadlines, setTitle]);

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 pt-20 animate-slide-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Novo Chamado</h1>
        <p className="text-muted-foreground">Crie um novo chamado no sistema</p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6 max-w-2xl">
        <form 
          onSubmit={(e) => handleSubmit(e, selectedDeadlineId, deadlines)} 
          className="space-y-6"
        >
          <DeadlineSelector
            deadlines={deadlines}
            selectedDeadlineId={selectedDeadlineId}
            onDeadlineChange={handleDeadlineChange}
            isLoading={isLoadingDeadlines}
          />

          <TicketDescription
            description={description}
            setDescription={setDescription}
          />

          <TicketFormActions
            isSubmitting={isSubmitting}
            isDisabled={isSubmitting || isLoadingDeadlines || deadlines.length === 0}
            onCancel={handleCancel}
          />
        </form>
      </div>
    </div>
  );
};

export default NewTicket;
