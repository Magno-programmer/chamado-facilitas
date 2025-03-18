
import { fetchWithAuth } from './baseClient';

// Sectors API
export const sectorsApi = {
  getAll: () => fetchWithAuth('/setores'),
  
  create: (name: string) => 
    fetchWithAuth('/setores', {
      method: 'POST',
      body: JSON.stringify({ nome: name }),
    }),
  
  delete: (sectorId: number) => 
    fetchWithAuth(`/setores/${sectorId}`, {
      method: 'DELETE',
    }),
};
