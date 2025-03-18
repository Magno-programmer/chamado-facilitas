
import { User } from '@/lib/types';

/**
 * Creates a user object from Supabase user data
 */
export const createUserFromSupabaseData = (
  supabaseUser: any, 
  email: string
): User => {
  return {
    id: parseInt(supabaseUser.id) || 0,
    name: supabaseUser.user_metadata?.name || email.split('@')[0],
    email: supabaseUser.email || email,
    sectorId: supabaseUser.user_metadata?.sector_id || 1,
    role: (supabaseUser.user_metadata?.role || 'CLIENT') as 'ADMIN' | 'CLIENT'
  };
};

/**
 * Stores user data in localStorage
 */
export const storeUserData = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('isLoggedIn', 'true');
  console.log('📝 [authUtils] Dados do usuário armazenados no localStorage:', user);
};

/**
 * Clears user data from localStorage
 */
export const clearUserData = (): void => {
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
  console.log('📝 [authUtils] Dados do usuário removidos do localStorage');
};

/**
 * Gets user data from localStorage
 */
export const getUserFromStorage = (): User | null => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return null;
  
  try {
    return JSON.parse(storedUser) as User;
  } catch (error) {
    console.error('📝 [authUtils] Erro ao recuperar usuário do localStorage:', error);
    return null;
  }
};

/**
 * Creates a mock admin user for development
 */
export const createMockAdminUser = (email: string): User => {
  return {
    id: 1,
    name: 'Admin User',
    email: email,
    sectorId: 1,
    role: 'ADMIN'
  };
};
