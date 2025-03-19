
import { fetchWithAuth } from './baseClient';

// Tickets API client matching the documented endpoints
export const ticketsApi = {
  // Get all tickets
  getAll: () => fetchWithAuth('/chamados'),
  
  // Create ticket
  create: (ticketData: { titulo: string; descricao: string; setor_id: number; prazo: string }) => 
    fetchWithAuth('/chamados', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    }),
  
  // Update ticket status (Admin only)
  updateStatus: (ticketId: number, status: string) => 
    fetchWithAuth(`/chamados/${ticketId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  
  // Delete ticket (User can delete own tickets, Admin can delete any)
  delete: (ticketId: number) => 
    fetchWithAuth(`/chamados/${ticketId}`, {
      method: 'DELETE',
    }),
};
