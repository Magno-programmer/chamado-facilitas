
// Base URL and configuration for API calls
export const API_CONFIG = {
  // Base URL for the API (can be altered as needed)
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://192.168.15.6:5001',
  
  // Disable CORS proxy since the backend is already configured with CORS
  USE_CORS_PROXY: false,
  
  // CORS proxy for development
  CORS_PROXY: 'https://corsproxy.io/?'
};

// Store the JWT token
let authToken: string | null = null;

// Builds the base URL according to configuration
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL;
  
  // If using CORS proxy, add it to the URL
  if (API_CONFIG.USE_CORS_PROXY && window.location.protocol === 'https:') {
    return `${API_CONFIG.CORS_PROXY}${encodeURIComponent(baseUrl + endpoint)}`;
  }
  
  return baseUrl + endpoint;
};

// Helper for making authenticated requests
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  // Add authorization header if token exists
  if (authToken) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    };
  } else {
    options.headers = {
      ...options.headers,
      'Content-Type': 'application/json',
    };
  }

  // Add credentials so cookies are sent
  options.credentials = 'include';

  try {
    const apiUrl = getApiUrl(endpoint);
    console.log('Requesting:', apiUrl);
    
    const response = await fetch(apiUrl, options);
    
    // Handle 401 Unauthorized - could be expired token
    if (response.status === 401) {
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
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.erro || errorData?.message || `API Error: ${response.status}`);
    }
    
    // For successful responses, try to parse as JSON, but handle empty responses
    return response.text().then(text => {
      return text ? JSON.parse(text) : {};
    });
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Set the auth token (called after login)
export const setAuthToken = (token: string) => {
  authToken = token;
  localStorage.setItem('authToken', token);
};

// Get the stored token (called on app initialization)
export const getStoredAuthToken = (): string | null => {
  const token = localStorage.getItem('authToken');
  if (token) {
    authToken = token;
  }
  return token;
};

// Clear the auth token (called on logout)
export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('authToken');
};
