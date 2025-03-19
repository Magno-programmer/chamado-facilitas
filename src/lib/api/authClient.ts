
import { fetchWithAuth, setAuthToken } from './baseClient';

// Authentication API client for the Flask backend
export const authApi = {
  // Login endpoint
  login: async (email: string, password: string) => {
    console.log('📝 [authClient] Iniciando request de login:', { email });
    
    try {
      const response = await fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      console.log('📝 [authClient] Resposta do login:', response);
      
      if (response.token) {
        console.log('📝 [authClient] Token recebido, salvando...');
        setAuthToken(response.token);
      } else {
        console.log('📝 [authClient] Sem token na resposta!');
      }
      
      return response;
    } catch (error) {
      console.error('📝 [authClient] Erro na requisição de login:', error);
      throw error;
    }
  },
  
  // Logout endpoint - client-side only as your API doesn't seem to have a logout endpoint
  logout: async () => {
    console.log('📝 [authClient] Iniciando logout (apenas client-side)');
    return {}; // Just return an empty object as we'll handle token clearing elsewhere
  },
};
