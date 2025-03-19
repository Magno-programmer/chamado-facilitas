import { API_CONFIG } from '../config/apiConfig';

// Current proxy index
let currentProxyIndex = 0;

/**
 * Get the API URL for an endpoint
 * May use a CORS proxy if configured
 * 
 * @param endpoint - API endpoint without base URL
 * @returns Full URL with base and optional proxy
 */
export const getApiUrl = (endpoint: string): string => {
  // Start with the base URL
  const baseApiUrl = `${API_CONFIG.BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  // If CORS proxy is disabled, return the direct URL
  if (!API_CONFIG.USE_CORS_PROXY) {
    console.log(`📝 [proxyManager] Usando URL direta da API: ${baseApiUrl}`);
    return baseApiUrl;
  }
  
  // Use corsproxy.io as primary proxy - it works better with all request types
  const primaryProxyUrl = `${API_CONFIG.CORS_PROXY}${encodeURIComponent(baseApiUrl)}`;
  
  // If we've already tried the primary proxy, rotate through backup proxies
  if (currentProxyIndex > 0) {
    // Get the backup proxy URL
    const backupProxies = API_CONFIG.BACKUP_CORS_PROXIES;
    const proxyUrl = backupProxies[(currentProxyIndex - 1) % backupProxies.length];
    
    console.log(`📝 [proxyManager] Alternando para proxy #${currentProxyIndex}`);
    console.log(`📝 [proxyManager] Usando proxy #${currentProxyIndex}: ${proxyUrl}`);
    
    // Build URL with backup proxy
    if (proxyUrl.includes('allorigins.win')) {
      // allorigins.win needs the URL encoded as a url parameter
      return `${proxyUrl}${encodeURIComponent(baseApiUrl)}`;
    } else {
      // Other proxies like cors-anywhere just prepend
      return `${proxyUrl}${baseApiUrl}`;
    }
  }
  
  console.log(`📝 [proxyManager] Usando proxy primário: ${API_CONFIG.CORS_PROXY}`);
  return primaryProxyUrl;
};

/**
 * Rotate to the next proxy in the list
 * Call this if a request fails to try with a different proxy
 */
export const rotateProxy = (): void => {
  // Maximum number of proxies (primary + backups)
  const maxProxies = 1 + API_CONFIG.BACKUP_CORS_PROXIES.length;
  
  // Increment current proxy index
  currentProxyIndex = (currentProxyIndex + 1) % maxProxies;
  console.log(`📝 [proxyManager] Proxy rotacionado para índice: ${currentProxyIndex}`);
};

/**
 * Reset proxy rotation to use the primary proxy again
 */
export const resetProxyRotation = (): void => {
  currentProxyIndex = 0;
  console.log(`📝 [proxyManager] Rotação de proxy redefinida para primário`);
};
