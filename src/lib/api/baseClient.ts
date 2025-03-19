
// Re-export all API client functionality from our modular structure
export { API_CONFIG } from './config/apiConfig';
export { getApiUrl } from './proxy/proxyManager';
export { 
  setAuthToken, 
  getAuthToken,
  getStoredAuthToken, 
  clearAuthToken 
} from './auth/tokenManager';
export { fetchWithAuth } from './client/apiClient';

