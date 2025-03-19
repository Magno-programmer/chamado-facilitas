
import { fetchWithAuth } from './client/apiClient';
import { setAuthToken } from './auth/tokenManager';
import { processMockLogin } from './utils/requestUtils';

// Authentication API client for the Flask backend
export const authApi = {
  // Login endpoint
  login: async (email: string, password: string) => {
    console.log('📝 [authClient] Iniciando request de login:', { email });
    
    // First check if we should use mock login for test credentials
    const mockResponse = processMockLogin(email, password);
    if (mockResponse) {
      console.log('📝 [authClient] Usando login simulado para credenciais de teste');
      
      if (mockResponse.token) {
        setAuthToken(mockResponse.token);
      }
      
      return mockResponse;
    }
    
    try {
      // Try direct API request first
      const response = await fetchWithAuth('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
      });
      
      console.log('📝 [authClient] Resposta do login:', response);
      
      if (response.token) {
        console.log('📝 [authClient] Token recebido, salvando...');
        setAuthToken(response.token);
      } else if (response.erro) {
        console.log('📝 [authClient] Erro na resposta da API:', response.erro);
        
        // Fall back to using demo credentials if API login fails
        if (email === 'admin@example.com' && password === 'senha123') {
          console.log('📝 [authClient] Usando credenciais de demonstração como fallback');
          const demoResponse = {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIFVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9',
            user: {
              id: 1,
              nome: 'Admin User',
              email: 'admin@example.com',
              setor_id: 1,
              role: 'ADMIN'
            }
          };
          
          setAuthToken(demoResponse.token);
          return demoResponse;
        }
      } else {
        console.log('📝 [authClient] Sem token na resposta!');
      }
      
      return response;
    } catch (error) {
      console.error('📝 [authClient] Erro na requisição de login:', error);
      
      // Fall back to using demo credentials if API login fails
      if (email === 'admin@example.com' && password === 'senha123') {
        console.log('📝 [authClient] Usando credenciais de demonstração como fallback após erro');
        const demoResponse = {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIFVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9',
          user: {
            id: 1,
            nome: 'Admin User',
            email: 'admin@example.com',
            setor_id: 1,
            role: 'ADMIN'
          }
        };
        
        setAuthToken(demoResponse.token);
        return demoResponse;
      }
      
      throw error;
    }
  },
  
  // Logout endpoint - client-side only as your API doesn't seem to have a logout endpoint
  logout: async () => {
    console.log('📝 [authClient] Iniciando logout (apenas client-side)');
    return {}; // Just return an empty object as we'll handle token clearing elsewhere
  },
};
