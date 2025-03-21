
import { User } from '@/lib/types/user.types';
import { TicketWithDetails } from '@/lib/types';

export const useTicketPermissions = (
  user: User | null,
  ticket: TicketWithDetails | null
) => {
  if (!user) {
    return {
      isAdmin: false,
      isSectorManager: false,
      isUserWithoutSector: false,
      canManageAllTickets: false,
      isOwnTicket: false,
      canDeleteTicket: false,
      canEditTicket: false,
      canAssignTicket: false
    };
  }
  
  const isAdmin = user.role === 'ADMIN';
  const isSectorManager = user.role === 'GERENTE';
  const isUserWithoutSector = user.sectorId === null || user.sectorId === 0;
  const canManageAllTickets = isAdmin || isSectorManager;
  
  const isOwnTicket = ticket && ticket.requesterId === user.id;
  
  const canDeleteTicket = canManageAllTickets || (isUserWithoutSector && isOwnTicket);
  const canEditTicket = canManageAllTickets && !isUserWithoutSector;
  const canAssignTicket = (isSectorManager || isAdmin) && ticket && 
    (ticket.status === 'Aberto' || ticket.status === 'Aguardando Prazo');

  return {
    isAdmin,
    isSectorManager,
    isUserWithoutSector,
    canManageAllTickets,
    isOwnTicket,
    canDeleteTicket,
    canEditTicket,
    canAssignTicket
  };
};
