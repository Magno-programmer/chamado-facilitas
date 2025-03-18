
import { User } from '@/lib/types';
import { authApi, clearAuthToken } from '@/lib/api';

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
      name: response.user?.name || email.split('@')[0],
      email: response.user?.email || email,
      sectorId: response.user?.sectorId || 1,
      role: response.user?.role || 'CLIENT'
    };
    
    console.log('📝 [apiAuth] Dados do usuário construídos:', user);
    
    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isLoggedIn', 'true');
    
    return { 
      data: { 
        session: { 
          user: user 
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
    await authApi.logout();
    
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
    
    if (!storedUser) {
      return { user: null, error: null };
    }
    
    const userData = JSON.parse(storedUser) as User;
    
    return { 
      user: {
        id: userData.id,
        email: userData.email,
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return { user: null, error: null };
  }
};
