
import { fetchWithAuth } from './baseClient';

// Deadlines API
export const deadlinesApi = {
  getAll: () => fetchWithAuth('/prazos'),
  
  create: (deadlineData: { titulo: string; setor_id: number; prazo: string }) => 
    fetchWithAuth('/prazos', {
      method: 'POST',
      body: JSON.stringify(deadlineData),
    }),
  
  delete: (deadlineId: number) => 
    fetchWithAuth(`/prazos/${deadlineId}`, {
      method: 'DELETE',
    }),
};
