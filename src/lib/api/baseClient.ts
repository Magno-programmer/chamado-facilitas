
// Base URL and configuration for API calls
export const API_CONFIG = {
  // Base URL for the API
  BASE_URL: 'https://sistemachamado-backend-production.up.railway.app',
  
  // Enable CORS proxy since the backend is not configured with CORS for our domain
  USE_CORS_PROXY: true,
  
  // CORS proxy for development
  CORS_PROXY: 'https://corsproxy.io/?',

  // Maximum number of retry attempts for failed requests
  MAX_RETRY_ATTEMPTS: 3,
  
  // Retry delay between retry attempts (in ms)
  RETRY_DELAY: 1000,
};

// Store the JWT token
let authToken: string | null = null;

// Builds the base URL according to configuration
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL;
  console.log('📝 [baseClient] URL da API montada:', baseUrl + endpoint);
  
  // If using CORS proxy, add it to the URL
  if (API_CONFIG.USE_CORS_PROXY && window.location.protocol === 'https:') {
    return `${API_CONFIG.CORS_PROXY}${encodeURIComponent(baseUrl + endpoint)}`;
  }
  
  return baseUrl + endpoint;
};

// Sleep function for retry delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper for making authenticated requests with retry functionality
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  console.log('📝 [baseClient] fetchWithAuth iniciado para:', endpoint, 'com opções:', options);
  console.log('📝 [baseClient] Token atual:', authToken ? `${authToken.substring(0, 15)}...` : 'nenhum');
  
  // Add authorization header if token exists
  if (authToken) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    };
    console.log('📝 [baseClient] Headers com autenticação:', options.headers);
  } else {
    options.headers = {
      ...options.headers,
      'Content-Type': 'application/json',
    };
    console.log('📝 [baseClient] Headers sem autenticação:', options.headers);
  }

  // Add credentials so cookies are sent
  options.credentials = 'include';
  console.log('📝 [baseClient] Credentials configurado como "include"');

  let lastError: Error | null = null;
  let retryCount = 0;

  while (retryCount <= API_CONFIG.MAX_RETRY_ATTEMPTS) {
    try {
      const apiUrl = getApiUrl(endpoint);
      console.log(`📝 [baseClient] Requisição (Tentativa ${retryCount + 1}/${API_CONFIG.MAX_RETRY_ATTEMPTS + 1}):`, apiUrl);
      
      if (options.body) {
        console.log('📝 [baseClient] Dados enviados:', options.body);
      }
      
      const response = await fetch(apiUrl, options);
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
      
      // Don't retry for 401 errors or if we've reached max retries
      if (lastError.message.includes('Unauthorized') || retryCount >= API_CONFIG.MAX_RETRY_ATTEMPTS) {
        console.error('📝 [baseClient] Falha na requisição após tentativas:', lastError);
        throw lastError;
      }
      
      // Log retry attempt
      console.warn(`📝 [baseClient] Falha na requisição, tentando novamente (${retryCount + 1}/${API_CONFIG.MAX_RETRY_ATTEMPTS}):`, lastError.message);
      
      // Wait before retrying with exponential backoff
      const delayTime = API_CONFIG.RETRY_DELAY * Math.pow(2, retryCount);
      console.log(`📝 [baseClient] Aguardando ${delayTime}ms antes da próxima tentativa`);
      await sleep(delayTime);
      retryCount++;
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
