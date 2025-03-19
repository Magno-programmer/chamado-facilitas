
import { fetchWithAuth } from './baseClient';

// Sectors API client matching the documented endpoints
export const sectorsApi = {
  // Get all sectors
  getAll: () => fetchWithAuth('/setores'),
  
  // Create sector (Admin only)
  create: (name: string) => 
    fetchWithAuth('/setores', {
      method: 'POST',
      body: JSON.stringify({ nome: name }),
    }),
  
  // Delete sector (Admin only)
  delete: (sectorId: number) => 
    fetchWithAuth(`/setores/${sectorId}`, {
      method: 'DELETE',
    }),
};
