
// Main API client for making HTTP requests
import { API_CONFIG } from '../config/apiConfig';
import { getApiUrl, rotateToNextProxy, shouldUseCorsProxy } from '../proxy/proxyManager';
import { getAuthToken } from '../auth/tokenManager';
import { sleep, getRetryDelay, processApiResponse, processMockLogin } from '../utils/requestUtils';

/**
 * Helper for making authenticated requests with retry functionality
 */
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  console.log('📝 [apiClient] fetchWithAuth iniciado para:', endpoint, 'com opções:', options);
  const authToken = getAuthToken();
  console.log('📝 [apiClient] Token atual:', authToken ? `${authToken.substring(0, 15)}...` : 'nenhum');
  
  // Create new headers object to avoid modifying the passed-in options
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  // Add authorization header if token exists
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
    console.log('📝 [apiClient] Headers com autenticação:', headers);
  } else {
    console.log('📝 [apiClient] Headers sem autenticação:', headers);
  }

  // Create a new options object with the headers
  const requestOptions: RequestInit = {
    ...options,
    headers
  };

  // Set credentials mode based on whether we're using a CORS proxy
  if (shouldUseCorsProxy()) {
    requestOptions.credentials = 'omit';
    console.log('📝 [apiClient] Credentials configurado como "omit" (usando CORS proxy)');
    
    // For some CORS proxies, we need to set mode to 'cors' explicitly
    requestOptions.mode = 'cors';
  } else {
    requestOptions.credentials = 'include';
    console.log('📝 [apiClient] Credentials configurado como "include"');
  }

  let lastError: Error | null = null;
  let retryCount = 0;
  let proxyRotated = false;

  while (retryCount <= API_CONFIG.MAX_RETRY_ATTEMPTS) {
    try {
      const apiUrl = getApiUrl(endpoint);
      console.log(`📝 [apiClient] Requisição (Tentativa ${retryCount + 1}/${API_CONFIG.MAX_RETRY_ATTEMPTS + 1}):`, apiUrl);
      
      if (requestOptions.body) {
        console.log('📝 [apiClient] Dados enviados:', requestOptions.body);
      }
      
      // For development/testing purposes, check if we should use mock data
      if (endpoint === '/auth/login' && 
          requestOptions.method === 'POST' && 
          requestOptions.body && 
          typeof requestOptions.body === 'string') {
        
        // Parse the request body
        const requestBody = JSON.parse(requestOptions.body);
        const { email, password } = requestBody;
        
        const mockResponse = processMockLogin(email, password);
        if (mockResponse) {
          return mockResponse;
        }
      }
      
      const response = await fetch(apiUrl, requestOptions);
      console.log('📝 [apiClient] Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()])
      });
      
      // Handle 401 Unauthorized - could be expired token
      if (response.status === 401) {
        console.log('📝 [apiClient] Erro 401 Unauthorized - redirecionando para login');
        // Clear token and redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        window.location.href = '/login';
        throw new Error('Unauthorized: Login required');
      }
      
      // Handle other errors
      if (!response.ok) {
        const errorText = await response.text();
        console.log('📝 [apiClient] Resposta de erro:', errorText);
        
        let errorData = null;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          console.log('📝 [apiClient] Resposta não é JSON válido');
        }
        
        throw new Error(
          errorData?.erro || 
          errorData?.message || 
          `API Error: ${response.status} - ${response.statusText}`
        );
      }
      
      return await processApiResponse(response);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry for 401 errors
      if (lastError.message.includes('Unauthorized')) {
        console.error('📝 [apiClient] Falha na requisição (401):', lastError);
        throw lastError;
      }
      
      // If proxy failed and we haven't rotated the proxy yet for this try
      if (shouldUseCorsProxy() && !proxyRotated && 
          (lastError.message.includes('Failed to fetch') || 
           lastError.message.includes('Network Error') ||
           lastError.message.includes('CORS'))) {
        rotateToNextProxy();
        proxyRotated = true;
        console.log('📝 [apiClient] Alternando para próximo proxy devido a erro de CORS/rede');
        continue; // Try immediately with new proxy
      }
      
      // If we've reached max retries
      if (retryCount >= API_CONFIG.MAX_RETRY_ATTEMPTS) {
        console.error('📝 [apiClient] Falha na requisição após máximo de tentativas:', lastError);
        throw lastError;
      }
      
      // Log retry attempt
      console.warn(`📝 [apiClient] Falha na requisição, tentando novamente (${retryCount + 1}/${API_CONFIG.MAX_RETRY_ATTEMPTS}):`, lastError.message);
      
      // Wait before retrying with exponential backoff
      const delayTime = getRetryDelay(retryCount);
      console.log(`📝 [apiClient] Aguardando ${delayTime}ms antes da próxima tentativa`);
      await sleep(delayTime);
      retryCount++;
      proxyRotated = false; // Reset the proxy rotation flag for the next attempt
    }
  }
  
  // If we get here, all retries failed
  console.error('📝 [apiClient] Requisição falhou após máximo de tentativas:', lastError);
  throw lastError;
};

