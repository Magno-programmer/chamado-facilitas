
import { User } from '@/lib/types';
import { storeUserData, getUserFromStorage } from '../utils/authUtils';
import { authApi } from '@/lib/api';

/**
 * Sign in with API
 * This is the only authentication method now
 */
export const signInWithSupabase = async (email: string, password: string) => {
  console.log('📝 [authOperations] Iniciando login com API:', { email });
  
  try {
    // Try login with backend API
    const apiResponse = await authApi.login(email, password);
    
    if (apiResponse && apiResponse.token) {
      console.log('📝 [authOperations] Login com API bem-sucedido');
      
      // Create a user object from the API response
      const apiUser = apiResponse.user || { 
        id: 0, 
        nome: email.split('@')[0], 
        email: email 
      };
      
      const user: User = {
        id: apiUser.id || 0,
        name: apiUser.nome || email.split('@')[0],
        email: apiUser.email || email,
        sectorId: apiUser.setor_id || 1,
        role: (apiUser.role || 'CLIENT').toUpperCase() as 'ADMIN' | 'CLIENT'
      };
      
      // Store the user data
      storeUserData(user);
      
      // Return a response format compatible with the previous format
      return { 
        data: { 
          session: { 
            access_token: apiResponse.token,
            user: { 
              id: String(user.id),
              email: user.email
            } 
          } 
        }, 
        error: null 
      };
    }
    
    console.log('📝 [authOperations] Login falhou - sem token na resposta');
    return {
      data: { session: null },
      error: new Error('Credenciais inválidas')
    };
  } catch (error) {
    console.error('📝 [authOperations] Erro de login:', error);
    return {
      data: { session: null },
      error: new Error('Falha na autenticação')
    };
  }
};

/**
 * Sign out from API
 */
export const signOutWithSupabase = async () => {
  try {
    // Clear local storage
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('authToken');
    
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error };
  }
};

/**
 * Get current user from localStorage
 */
export const getCurrentUserWithSupabase = async () => {
  try {
    // Check localStorage for user
    const userData = getUserFromStorage();
    if (userData) {
      return { user: userData, error: null };
    }
    
    return { user: null, error: null };
  } catch (error) {
    console.error('Get current user error:', error);
    return { user: null, error: null };
  }
};

/**
 * Verify credentials with API
 */
export const verifyCredentialsWithSupabase = async (email: string, password: string): Promise<User | null> => {
  console.log('📝 [authOperations] Verificando credenciais para:', email);
  
  try {
    // Try the backend API
    const response = await authApi.login(email, password);
    
    if (response && response.token) {
      // Create a user object from the API response
      const apiUser = response.user || { 
        id: 0, 
        nome: email.split('@')[0], 
        email: email 
      };
      
      return {
        id: apiUser.id || 0,
        name: apiUser.nome || email.split('@')[0],
        email: apiUser.email || email,
        sectorId: apiUser.setor_id || 1,
        role: (apiUser.role || 'CLIENT').toUpperCase() as 'ADMIN' | 'CLIENT'
      };
    }
    
    // If API fails, return null
    console.log('📝 [authOperations] Verificação falhou');
    return null;
  } catch (error) {
    console.error('📝 [authOperations] Erro verificando credenciais:', error);
    return null;
  }
};
