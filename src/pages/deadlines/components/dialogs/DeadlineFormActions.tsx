
import React from 'react';
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeadlineFormActionsProps {
  isEditing: boolean;
  onCancel: () => void;
}

const DeadlineFormActions = ({ isEditing, onCancel }: DeadlineFormActionsProps) => {
  return (
    <DialogFooter>
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit">
        {isEditing ? 'Atualizar' : 'Criar'}
      </Button>
    </DialogFooter>
  );
};

export default DeadlineFormActions;
