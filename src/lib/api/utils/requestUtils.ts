
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
  
  return null;
};

