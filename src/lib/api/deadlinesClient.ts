
import { fetchWithAuth } from './baseClient';

// Deadlines API client matching the documented endpoints
export const deadlinesApi = {
  // Get all deadlines
  getAll: () => fetchWithAuth('/prazos'),
  
  // Create deadline
  create: (deadlineData: { titulo: string; setor_id: number; prazo: string }) => 
    fetchWithAuth('/prazos', {
      method: 'POST',
      body: JSON.stringify(deadlineData),
    }),
  
  // Delete deadline
  delete: (deadlineId: number) => 
    fetchWithAuth(`/prazos/${deadlineId}`, {
      method: 'DELETE',
    }),
};
