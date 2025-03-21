
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { TicketStatus } from '@/lib/types/ticket.types';

// Import all our new small hooks
import { useTicketStatusManagement } from './ticket-details/useTicketStatusManagement';
import { useTicketDialogs } from './ticket-details/useTicketDialogs';
import { useTicketEmployees } from './ticket-details/useTicketEmployees';
import { useTicketPermissions } from './ticket-details/useTicketPermissions';
import { useTicketLoader } from './ticket-details/useTicketLoader';

export const useTicketDetails = (id: string | undefined) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Use the new hooks
  const { 
    isDeleteDialogOpen, 
    setIsDeleteDialogOpen,
    isAssignDialogOpen, 
    setIsAssignDialogOpen 
  } = useTicketDialogs();
  
  const { 
    sectorEmployees, 
    isLoadingEmployees, 
    loadSectorEmployees 
  } = useTicketEmployees();
  
  // Get permissions (initially with null ticket as it's not loaded yet)
  const permissionsInitial = useTicketPermissions(user, null);
  
  // Load the ticket
  const { 
    ticket, 
    setTicket, 
    isLoading, 
    loadTicket 
  } = useTicketLoader(
    id, 
    user, 
    permissionsInitial.canManageAllTickets,
    loadSectorEmployees,
    permissionsInitial.canAssignTicket
  );
  
  // Once ticket is loaded, get the actual permissions
  const {
    isAdmin,
    isSectorManager,
    isUserWithoutSector,
    canManageAllTickets,
    isOwnTicket,
    canDeleteTicket,
    canEditTicket,
    canAssignTicket
  } = useTicketPermissions(user, ticket);
  
  // Handle status management
  const {
    isStatusUpdateDialogOpen,
    setIsStatusUpdateDialogOpen,
    selectedStatus,
    setSelectedStatus,
    handleTicketExpired
  } = useTicketStatusManagement(ticket);
  
  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  return {
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
    isUpdating,
    setIsUpdating,
    sectorEmployees,
    isLoadingEmployees,
    isAdmin,
    isSectorManager,
    isUserWithoutSector,
    canManageAllTickets,
    isOwnTicket,
    canDeleteTicket,
    canEditTicket,
    canAssignTicket,
    loadTicket,
    handleTicketExpired,
    user
  };
};
