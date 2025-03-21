
import { useState } from 'react';

export const useTicketDialogs = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  return {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isAssignDialogOpen,
    setIsAssignDialogOpen
  };
};
