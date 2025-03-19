
import { User } from '@/lib/types';
import { authApi, setAuthToken, clearAuthToken } from '@/lib/api';

// Sign in with API
export const signInWithApi = async (email: string, password: string) => {
  console.log('📝 [apiAuth] Iniciando login com API:', { email });
  
  try {
    const response = await authApi.login(email, password);
    
    if (!response || !response.token) {
      console.log('📝 [apiAuth] Login falhou - sem token na resposta');
      return {
        data: { session: null },
        error: new Error('Credenciais inválidas')
      };
    }
    
    // Construct user object from API response
    const user = {
      id: response.user?.id || 0,
      name: response.user?.nome || email.split('@')[0],
      email: response.user?.email || email,
      sectorId: response.user?.setor_id || 1,
      role: (response.user?.role || 'CLIENT').toUpperCase() as 'ADMIN' | 'CLIENT'
    };
    
    console.log('📝 [apiAuth] Dados do usuário construídos:', user);
    
    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isLoggedIn', 'true');
    
    return { 
      data: { 
        session: { 
          user: user,
          access_token: response.token
        } 
      }, 
      error: null 
    };
  } catch (error) {
    console.error('📝 [apiAuth] Erro de login:', error);
    return {
      data: { session: null },
      error: new Error('Falha na autenticação')
    };
  }
};

// Sign out with API
export const signOutWithApi = async () => {
  try {
    // API doesn't really have a logout endpoint, so we just clear local data
    
    // Clear authentication data
    clearAuthToken();
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error };
  }
};

// Get current user from localStorage (API doesn't provide a get current user endpoint)
export const getCurrentUserFromStorage = () => {
  try {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('authToken');
    
    if (!storedUser || !storedToken) {
      return { user: null, error: null };
    }
    
    const userData = JSON.parse(storedUser) as User;
    
    return { 
      user: userData, 
      error: null 
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return { user: null, error: null };
  }
};
