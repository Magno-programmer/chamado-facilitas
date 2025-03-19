
import { getApiUrl } from '../proxy/proxyManager';
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
  
  // Set default headers - ensure content-type is properly set
  requestOptions.headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...requestOptions.headers,
  };
  
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
  
  try {
    // When using certain CORS proxies, sometimes we need to modify how we handle the request
    // to ensure headers are properly passed through
    const response = await fetch(url, requestOptions);
    return handleResponse(response);
  } catch (error) {
    console.error(`📝 [apiClient] Erro na requisição para ${url}:`, error);
    throw error;
  }
};
