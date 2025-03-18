
import { fetchWithAuth } from './baseClient';

// Users API
export const usersApi = {
  getAll: () => fetchWithAuth('/usuarios'),
  
  getByEmail: (email: string) => fetchWithAuth(`/usuarios/email?email=${encodeURIComponent(email)}`),
  
  create: (userData: { nome: string; email: string; setor_id: number; senha: string }) => 
    fetchWithAuth('/usuarios', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  update: (userId: number, userData: Partial<{ nome: string; email: string; setor_id: number; senha: string }>) => 
    fetchWithAuth(`/usuarios/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
  
  delete: (userId: number) => 
    fetchWithAuth(`/usuarios/${userId}`, {
      method: 'DELETE',
    }),
};
