
// Utility functions for API requests
import { API_CONFIG } from '../config/apiConfig';

/**
 * Sleep function for retry delays
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Generate retry delay with exponential backoff
 */
export const getRetryDelay = (retryCount: number): number => {
  return API_CONFIG.RETRY_DELAY * Math.pow(2, retryCount);
};

/**
 * Format request options by creating a new object
 * to avoid mutating the original
 */
export const formatRequestOptions = (options: RequestInit = {}): RequestInit => {
  return {
    ...options,
    headers: {
      ...options.headers,
    },
    // Ensure method is set explicitly
    method: options.method || 'GET'
  };
};

/**
 * Handle API response
 */
export const handleResponse = async (response: Response) => {
  if (!response.ok) {
    // Log the error details
    console.error(`📝 [requestUtils] Erro na API: ${response.status} ${response.statusText}`);
    
    // Try to get error details from response
    let errorDetails = '';
    try {
      const errorText = await response.text();
      errorDetails = errorText;
      console.error('📝 [requestUtils] Detalhes do erro:', errorDetails);
    } catch (e) {
      console.error('📝 [requestUtils] Não foi possível obter detalhes do erro');
    }
    
    throw new Error(`API Error: ${response.status} ${response.statusText} ${errorDetails}`);
  }
  
  return processApiResponse(response);
};

/**
 * Process response from API
 */
export const processApiResponse = async (response: Response) => {
  // For successful responses, try to parse as JSON, but handle empty responses
  const responseText = await response.text();
  console.log('📝 [requestUtils] Resposta em texto:', responseText || '(resposta vazia)');
  
  if (!responseText) {
    console.log('📝 [requestUtils] Resposta vazia, retornando objeto vazio');
    return {};
  }
  
  try {
    const parsedResponse = JSON.parse(responseText);
    console.log('📝 [requestUtils] Resposta parseada:', parsedResponse);
    return parsedResponse;
  } catch (e) {
    console.error('📝 [requestUtils] Erro ao parsear JSON:', e);
    throw new Error('Invalid JSON response');
  }
};

/**
 * Process mock login for test credentials
 * This allows us to bypass API calls for testing
 */
export const processMockLogin = (email: string, password: string) => {
  // Check for test credentials
  if (email === 'admin@example.com' && password === 'senha123') {
    console.log('📝 [requestUtils] Usando credenciais de teste - retornando resposta simulada');
    
    // Simulate successful login response for test credentials
    return {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIFVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9',
      user: {
        id: 1,
        nome: 'Admin User',
        email: 'admin@example.com',
        setor_id: 1,
        role: 'ADMIN'
      }
    };
  }
  
  // Additional test user - client role
  if (email === 'client@example.com' && password === 'senha123') {
    console.log('📝 [requestUtils] Usando credenciais de cliente de teste - retornando resposta simulada');
    
    // Simulate successful login response for test credentials
    return {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMjIyMjIyMjIiLCJuYW1lIjoiQ2xpZW50IFVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9',
      user: {
        id: 2,
        nome: 'Client User',
        email: 'client@example.com',
        setor_id: 2,
        role: 'CLIENT'
      }
    };
  }
  
  // Add credentials for carlosadmin@sistemadechamado.com
  if (email === 'carlosadmin@sistemadechamado.com' && password === 'admin123') {
    console.log('📝 [requestUtils] Usando credenciais do backend - retornando resposta simulada');
    
    // Simulate successful login response for backend credentials
    return {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzMzMzMzMzIiwibmFtZSI6IkNhcmxvcyBBZG1pbiIsImlhdCI6MTUxNjIzOTAyMn0',
      user: {
        id: 3,
        nome: 'Carlos Admin',
        email: 'carlosadmin@sistemadechamado.com',
        setor_id: 1,
        role: 'ADMIN'
      }
    };
  }
  
  return null;
};
