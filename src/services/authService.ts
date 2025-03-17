
import { User } from '@/lib/types';
import { authApi, setAuthToken, getStoredAuthToken, clearAuthToken } from '@/lib/apiClient';

// Initialize auth from localStorage on app load
getStoredAuthToken();

export const signIn = async (email: string, password: string) => {
  try {
    const result = await authApi.login(email, password);
    
    if (result.token) {
      // Store user info
      const user = {
        id: result.user.id,
        name: result.user.nome,
        email: result.user.email,
        sectorId: result.user.setor_id,
        role: result.user.role
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isLoggedIn', 'true');
      
      return {
        data: {
          session: {
            user: {
              id: String(user.id),
              email: user.email,
            }
          }
        },
        error: null
      };
    }
    
    return {
      data: { session: null },
      error: new Error('Credenciais inválidas')
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      data: { session: null },
      error: new Error('Falha na autenticação')
    };
  }
};

export const signOut = async () => {
  try {
    await authApi.logout();
    
    // Clear local storage
    clearAuthToken();
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error };
  }
};

export const getCurrentUser = async () => {
  try {
    // Check if user is stored in local storage
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
      return { user: null, error: null };
    }
    
    const userData = JSON.parse(storedUser) as User;
    
    // Check if token exists
    if (!getStoredAuthToken()) {
      return { user: null, error: null };
    }
    
    return { 
      user: {
        id: String(userData.id),
        email: userData.email,
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return { user: null, error };
  }
};

// This function verifies credentials directly with the API
export const verifyUserCredentials = async (email: string, password: string): Promise<User | null> => {
  try {
    const result = await authApi.login(email, password);
    
    if (result.token) {
      return { 
        id: result.user.id, 
        name: result.user.nome, 
        email: result.user.email, 
        sectorId: result.user.setor_id, 
        role: result.user.role 
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error verifying credentials:', error);
    return null;
  }
};
