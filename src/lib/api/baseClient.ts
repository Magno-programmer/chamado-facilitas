
// Base URL and configuration for API calls
export const API_CONFIG = {
  // Base URL for the API
  BASE_URL: 'https://sistemachamado-backend-production.up.railway.app',
  
  // Enable CORS proxy since the backend is not configured with CORS for our domain
  USE_CORS_PROXY: true,
  
  // Primary CORS proxy
  CORS_PROXY: 'https://api.allorigins.win/raw?url=',
  
  // Backup CORS proxies if the primary one fails
  BACKUP_CORS_PROXIES: [
    'https://corsproxy.io/?',
    'https://cors-anywhere.herokuapp.com/'
  ],
  
  // Maximum number of retry attempts for failed requests
  MAX_RETRY_ATTEMPTS: 3,
  
  // Retry delay between retry attempts (in ms)
  RETRY_DELAY: 1000,
};

// Store the JWT token
let authToken: string | null = null;

// Track which CORS proxy is currently being used
let currentProxyIndex = -1; // -1 means use primary proxy

// Builds the base URL according to configuration
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL;
  console.log('📝 [baseClient] Montando URL da API:', baseUrl + endpoint);
  
  // If using CORS proxy, add it to the URL
  if (API_CONFIG.USE_CORS_PROXY && window.location.protocol === 'https:') {
    // Determine which proxy to use
    let proxyUrl = API_CONFIG.CORS_PROXY;
    
    if (currentProxyIndex >= 0 && currentProxyIndex < API_CONFIG.BACKUP_CORS_PROXIES.length) {
      proxyUrl = API_CONFIG.BACKUP_CORS_PROXIES[currentProxyIndex];
    }
    
    console.log(`📝 [baseClient] Usando proxy #${currentProxyIndex + 1}: ${proxyUrl}`);
    return `${proxyUrl}${encodeURIComponent(baseUrl + endpoint)}`;
  }
  
  return baseUrl + endpoint;
};

// Try next CORS proxy in the list
const rotateToNextProxy = () => {
  currentProxyIndex++;
  
  // If we've gone through all backup proxies, go back to the primary one
  if (currentProxyIndex >= API_CONFIG.BACKUP_CORS_PROXIES.length) {
    currentProxyIndex = -1;
  }
  
  console.log(`📝 [baseClient] Alternando para proxy #${currentProxyIndex + 1}`);
};

// Sleep function for retry delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper for making authenticated requests with retry functionality
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  console.log('📝 [baseClient] fetchWithAuth iniciado para:', endpoint, 'com opções:', options);
  console.log('📝 [baseClient] Token atual:', authToken ? `${authToken.substring(0, 15)}...` : 'nenhum');
  
  // Create new headers object to avoid modifying the passed-in options
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  // Add authorization header if token exists
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
    console.log('📝 [baseClient] Headers com autenticação:', headers);
  } else {
    console.log('📝 [baseClient] Headers sem autenticação:', headers);
  }

  // Create a new options object with the headers
  const requestOptions: RequestInit = {
    ...options,
    headers
  };

  // Set credentials mode based on whether we're using a CORS proxy
  // When using CORS proxy, we must use 'omit' instead of 'include'
  if (API_CONFIG.USE_CORS_PROXY) {
    requestOptions.credentials = 'omit';
    console.log('📝 [baseClient] Credentials configurado como "omit" (usando CORS proxy)');
    
    // For some CORS proxies, we need to set mode to 'cors' explicitly
    requestOptions.mode = 'cors';
  } else {
    requestOptions.credentials = 'include';
    console.log('📝 [baseClient] Credentials configurado como "include"');
  }

  let lastError: Error | null = null;
  let retryCount = 0;
  let proxyRotated = false;

  while (retryCount <= API_CONFIG.MAX_RETRY_ATTEMPTS) {
    try {
      const apiUrl = getApiUrl(endpoint);
      console.log(`📝 [baseClient] Requisição (Tentativa ${retryCount + 1}/${API_CONFIG.MAX_RETRY_ATTEMPTS + 1}):`, apiUrl);
      
      if (requestOptions.body) {
        console.log('📝 [baseClient] Dados enviados:', requestOptions.body);
      }
      
      // For development/testing purposes, check if we should use mock data
      if (endpoint === '/auth/login' && 
          requestOptions.method === 'POST' && 
          requestOptions.body && 
          typeof requestOptions.body === 'string') {
        
        // Parse the request body
        const requestBody = JSON.parse(requestOptions.body);
        const { email, password } = requestBody;
        
        // Check for test credentials
        if (email === 'admin@example.com' && password === 'senha123') {
          console.log('📝 [baseClient] Usando credenciais de teste - retornando resposta simulada');
          
          // Simulate successful login response for test credentials
          const mockResponse = {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIFVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9',
            user: {
              id: 1,
              nome: 'Admin User',
              email: 'admin@example.com',
              setor_id: 1,
              role: 'ADMIN'
            }
          };
          
          return mockResponse;
        }
        
        // Additional test user - client role
        if (email === 'client@example.com' && password === 'senha123') {
          console.log('📝 [baseClient] Usando credenciais de cliente de teste - retornando resposta simulada');
          
          // Simulate successful login response for test credentials
          const mockResponse = {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMjIyMjIyMjIiLCJuYW1lIjoiQ2xpZW50IFVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9',
            user: {
              id: 2,
              nome: 'Client User',
              email: 'client@example.com',
              setor_id: 2,
              role: 'CLIENT'
            }
          };
          
          return mockResponse;
        }
      }
      
      const response = await fetch(apiUrl, requestOptions);
      console.log('📝 [baseClient] Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()])
      });
      
      // Handle 401 Unauthorized - could be expired token
      if (response.status === 401) {
        console.log('📝 [baseClient] Erro 401 Unauthorized - redirecionando para login');
        // Clear token and redirect to login
        authToken = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        window.location.href = '/login';
        throw new Error('Unauthorized: Login required');
      }
      
      // Handle other errors
      if (!response.ok) {
        const errorText = await response.text();
        console.log('📝 [baseClient] Resposta de erro:', errorText);
        
        let errorData = null;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          console.log('📝 [baseClient] Resposta não é JSON válido');
        }
        
        throw new Error(
          errorData?.erro || 
          errorData?.message || 
          `API Error: ${response.status} - ${response.statusText}`
        );
      }
      
      // For successful responses, try to parse as JSON, but handle empty responses
      const responseText = await response.text();
      console.log('📝 [baseClient] Resposta em texto:', responseText || '(resposta vazia)');
      
      if (!responseText) {
        console.log('📝 [baseClient] Resposta vazia, retornando objeto vazio');
        return {};
      }
      
      try {
        const parsedResponse = JSON.parse(responseText);
        console.log('📝 [baseClient] Resposta parseada:', parsedResponse);
        return parsedResponse;
      } catch (e) {
        console.error('📝 [baseClient] Erro ao parsear JSON:', e);
        throw new Error('Invalid JSON response');
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry for 401 errors
      if (lastError.message.includes('Unauthorized')) {
        console.error('📝 [baseClient] Falha na requisição (401):', lastError);
        throw lastError;
      }
      
      // If proxy failed and we haven't rotated the proxy yet for this try
      if (API_CONFIG.USE_CORS_PROXY && !proxyRotated && 
          (lastError.message.includes('Failed to fetch') || 
           lastError.message.includes('Network Error') ||
           lastError.message.includes('CORS'))) {
        rotateToNextProxy();
        proxyRotated = true;
        console.log('📝 [baseClient] Alternando para próximo proxy devido a erro de CORS/rede');
        continue; // Try immediately with new proxy
      }
      
      // If we've reached max retries
      if (retryCount >= API_CONFIG.MAX_RETRY_ATTEMPTS) {
        console.error('📝 [baseClient] Falha na requisição após máximo de tentativas:', lastError);
        throw lastError;
      }
      
      // Log retry attempt
      console.warn(`📝 [baseClient] Falha na requisição, tentando novamente (${retryCount + 1}/${API_CONFIG.MAX_RETRY_ATTEMPTS}):`, lastError.message);
      
      // Wait before retrying with exponential backoff
      const delayTime = API_CONFIG.RETRY_DELAY * Math.pow(2, retryCount);
      console.log(`📝 [baseClient] Aguardando ${delayTime}ms antes da próxima tentativa`);
      await sleep(delayTime);
      retryCount++;
      proxyRotated = false; // Reset the proxy rotation flag for the next attempt
    }
  }
  
  // If we get here, all retries failed
  console.error('📝 [baseClient] Requisição falhou após máximo de tentativas:', lastError);
  throw lastError;
};

// Set the auth token (called after login)
export const setAuthToken = (token: string) => {
  console.log('📝 [baseClient] Definindo token de autenticação:', token?.substring(0, 15) + '...');
  authToken = token;
  localStorage.setItem('authToken', token);
};

// Get the stored token (called on app initialization)
export const getStoredAuthToken = (): string | null => {
  const token = localStorage.getItem('authToken');
  console.log('📝 [baseClient] Token recuperado do localStorage:', token ? `${token.substring(0, 15)}...` : 'nenhum');
  if (token) {
    authToken = token;
  }
  return token;
};

// Clear the auth token (called on logout)
export const clearAuthToken = () => {
  console.log('📝 [baseClient] Limpando token de autenticação');
  authToken = null;
  localStorage.removeItem('authToken');
};
