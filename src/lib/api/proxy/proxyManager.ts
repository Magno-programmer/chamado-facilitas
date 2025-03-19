// Proxy management functions
import { API_CONFIG } from '../config/apiConfig';

// Track which CORS proxy is currently being used
let currentProxyIndex = -1; // -1 means use primary proxy

/**
 * Builds the base URL according to configuration
 */
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL;
  console.log('📝 [proxyManager] Montando URL da API:', baseUrl + endpoint);
  
  // If using CORS proxy, add it to the URL
  if (API_CONFIG.USE_CORS_PROXY && window.location.protocol === 'https:') {
    // Determine which proxy to use
    let proxyUrl = API_CONFIG.CORS_PROXY;
    
    if (currentProxyIndex >= 0 && currentProxyIndex < API_CONFIG.BACKUP_CORS_PROXIES.length) {
      proxyUrl = API_CONFIG.BACKUP_CORS_PROXIES[currentProxyIndex];
    }
    
    // Some CORS proxies work better with different formats
    if (proxyUrl.includes('allorigins')) {
      console.log(`📝 [proxyManager] Usando proxy: ${proxyUrl}`);
      return `${proxyUrl}${encodeURIComponent(baseUrl + endpoint)}`;
    } else {
      // Other proxies like corsproxy.io
      console.log(`📝 [proxyManager] Usando proxy: ${proxyUrl}`);
      return `${proxyUrl}${baseUrl + endpoint}`;
    }
  }
  
  return baseUrl + endpoint;
};

/**
 * Try next CORS proxy in the list
 */
export const rotateToNextProxy = () => {
  currentProxyIndex++;
  
  // If we've gone through all backup proxies, go back to the primary one
  if (currentProxyIndex >= API_CONFIG.BACKUP_CORS_PROXIES.length) {
    currentProxyIndex = -1;
  }
  
  console.log(`📝 [proxyManager] Alternando para próximo proxy, índice: ${currentProxyIndex}`);
};

/**
 * Get current proxy index
 */
export const getCurrentProxyIndex = (): number => {
  return currentProxyIndex;
};

/**
 * Enable or disable CORS proxy usage
 */
export const enableCorsProxy = (enable: boolean) => {
  // This can be used to toggle CORS proxy at runtime if needed
  // Allows API endpoints to force proxy use or disable it
  console.log(`📝 [proxyManager] ${enable ? 'Ativando' : 'Desativando'} uso de proxy CORS`);
  return enable;
};

/**
 * Check if we should use CORS proxy
 */
export const shouldUseCorsProxy = (): boolean => {
  return API_CONFIG.USE_CORS_PROXY && window.location.protocol === 'https:';
};
