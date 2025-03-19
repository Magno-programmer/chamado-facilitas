
// Configuration for API calls

/**
 * API configuration constants
 */
export const API_CONFIG = {
  // Base URL for the API
  BASE_URL: 'https://sistemachamado-backend-production.up.railway.app',
  
  // Disable CORS proxy by default
  USE_CORS_PROXY: false,
  
  // Primary CORS proxy - corsproxy.io works better with POST requests
  CORS_PROXY: 'https://corsproxy.io/?',
  
  // Backup CORS proxies if the primary one fails
  BACKUP_CORS_PROXIES: [
    'https://cors-anywhere.herokuapp.com/',
    'https://api.allorigins.win/raw?url='
  ],
  
  // Maximum number of retry attempts for failed requests
  MAX_RETRY_ATTEMPTS: 3,
  
  // Retry delay between retry attempts (in ms)
  RETRY_DELAY: 1000,
};
