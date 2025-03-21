
import React from 'react';

interface TicketFormActionsProps {
  isSubmitting: boolean;
  isDisabled: boolean;
  onCancel: () => void;
}

const TicketFormActions: React.FC<TicketFormActionsProps> = ({
  isSubmitting,
  isDisabled,
  onCancel
}) => {
  return (
    <div className="flex justify-end space-x-4 pt-4">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
        disabled={isSubmitting}
      >
        Cancelar
      </button>
      <button
        type="submit"
        className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors flex items-center"
        disabled={isDisabled}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Criando...
          </>
        ) : (
          'Criar Chamado'
        )}
      </button>
    </div>
  );
};

export default TicketFormActions;
