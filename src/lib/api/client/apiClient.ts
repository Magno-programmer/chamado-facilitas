
import { getApiUrl, rotateToNextProxy } from '../proxy/proxyManager';
import { getAuthToken } from '../auth/tokenManager';
import { handleResponse, formatRequestOptions } from '../utils/requestUtils';

/**
 * Enhanced fetch with authentication support
 * 
 * @param endpoint - API endpoint (without base URL)
 * @param options - Fetch options
 * @returns Processed response data
 */
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const url = getApiUrl(endpoint);
  const token = getAuthToken();
  
  // Create a new options object to avoid mutating the original
  const requestOptions = formatRequestOptions(options);
  
  // Set default headers and ensure they're properly formatted for the proxy
  requestOptions.headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(requestOptions.headers || {}),
  };
  
  // Make sure method is explicitly set - default to GET if not specified
  requestOptions.method = requestOptions.method || 'GET';
  
  // Add authorization header if token exists
  if (token) {
    requestOptions.headers = {
      ...requestOptions.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  
  console.log(`📝 [apiClient] Fazendo requisição para: ${url}`, {
    method: requestOptions.method,
    headers: requestOptions.headers,
    bodyLength: requestOptions.body ? JSON.stringify(requestOptions.body).length : 0
  });
  
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount < maxRetries) {
    try {
      const response = await fetch(url, requestOptions);
      return handleResponse(response);
    } catch (error) {
      retryCount++;
      console.error(`📝 [apiClient] Erro na requisição para ${url} (tentativa ${retryCount}/${maxRetries}):`, error);
      
      if (retryCount >= maxRetries) {
        // Se atingimos o número máximo de tentativas, tenta com outro proxy
        rotateToNextProxy();
        throw error;
      }
      
      // Espera um tempo antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  throw new Error(`Falha após ${maxRetries} tentativas`);
};
