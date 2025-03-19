
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
