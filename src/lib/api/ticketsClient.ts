
import { fetchWithAuth } from './baseClient';

// Tickets API
export const ticketsApi = {
  getAll: () => fetchWithAuth('/chamados'),
  
  create: (ticketData: { titulo: string; descricao: string; setor_id: number; prazo: string }) => 
    fetchWithAuth('/chamados', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    }),
  
  updateStatus: (ticketId: number, status: string) => 
    fetchWithAuth(`/chamados/${ticketId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  
  delete: (ticketId: number) => 
    fetchWithAuth(`/chamados/${ticketId}`, {
      method: 'DELETE',
    }),
};
