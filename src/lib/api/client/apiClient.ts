
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
  
  try {
    // When using the allorigins proxy, we need to modify the request structure
    // because it doesn't properly forward POST requests
    if (url.includes('api.allorigins.win') && requestOptions.method !== 'GET') {
      // For allorigins.win, we need to use their specific parameters
      const modifiedUrl = new URL(url);
      
      // Convert the original request into a format allorigins can handle
      if (requestOptions.body) {
        // Add method parameter
        modifiedUrl.searchParams.append('method', requestOptions.method);
        
        // Add the content-type header
        modifiedUrl.searchParams.append('contentType', 'application/json');
        
        // Add the request body as a data parameter
        if (typeof requestOptions.body === 'string') {
          modifiedUrl.searchParams.append('data', requestOptions.body);
        } else {
          modifiedUrl.searchParams.append('data', JSON.stringify(requestOptions.body));
        }
        
        // Switch to GET method since we're sending everything in URL params
        requestOptions.method = 'GET';
        delete requestOptions.body;
      }
      
      console.log(`📝 [apiClient] Requisição modificada para allorigins: ${modifiedUrl}`, requestOptions);
      
      const response = await fetch(modifiedUrl.toString(), requestOptions);
      return handleResponse(response);
    }
    
    // Regular fetch for other proxies or direct requests
    const response = await fetch(url, requestOptions);
    return handleResponse(response);
  } catch (error) {
    console.error(`📝 [apiClient] Erro na requisição para ${url}:`, error);
    throw error;
  }
};
