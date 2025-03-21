
import React from 'react';
import { Button } from "@/components/ui/button";

interface UserFormActionsProps {
  isEditing: boolean;
  loading: boolean;
  onCancel: () => void;
  disabled?: boolean;
}

const UserFormActions = ({ isEditing, loading, onCancel, disabled = false }: UserFormActionsProps) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
        Cancelar
      </Button>
      <Button type="submit" disabled={loading || disabled}>
        {isEditing ? 'Atualizar' : 'Criar'} Usuário
      </Button>
    </div>
  );
};

export default UserFormActions;
