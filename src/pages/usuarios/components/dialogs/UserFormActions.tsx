
import React from 'react';
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface UserFormActionsProps {
  isEditing: boolean;
  loading: boolean;
  onCancel: () => void;
}

const UserFormActions = ({ isEditing, loading, onCancel }: UserFormActionsProps) => {
  return (
    <DialogFooter>
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" disabled={loading}>
        {isEditing ? 'Atualizar' : 'Criar'}
      </Button>
    </DialogFooter>
  );
};

export default UserFormActions;
