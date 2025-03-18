
import { fetchWithAuth, setAuthToken } from './baseClient';

// Authentication API - Adapted for the Flask backend
export const authApi = {
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
  
  logout: async () => {
    console.log('📝 [authClient] Iniciando logout');
    try {
      const response = await fetchWithAuth('/auth/logout', {
        method: 'POST',
      });
      console.log('📝 [authClient] Resposta do logout:', response);
      return response;
    } catch (error) {
      console.error('📝 [authClient] Erro na requisição de logout:', error);
      throw error;
    }
  },
};
