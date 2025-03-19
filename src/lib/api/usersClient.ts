
import { fetchWithAuth } from './baseClient';

// Users API client matching the documented endpoints
export const usersApi = {
  // Get all users (Admin only)
  getAll: () => fetchWithAuth('/usuarios'),
  
  // Get user by email (Admin only)
  getByEmail: (email: string) => fetchWithAuth(`/usuarios/email?email=${encodeURIComponent(email)}`),
  
  // Create user (Admin only)
  create: (userData: { nome: string; email: string; setor_id: number; senha: string }) => 
    fetchWithAuth('/usuarios', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  // Update user (Admin only)
  update: (userId: number, userData: Partial<{ nome: string; email: string; setor_id: number; senha: string }>) => 
    fetchWithAuth(`/usuarios/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
  
  // Delete user (Admin only)
  delete: (userId: number) => 
    fetchWithAuth(`/usuarios/${userId}`, {
      method: 'DELETE',
    }),
};
