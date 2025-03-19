
// Configuration for API calls

/**
 * API configuration constants
 */
export const API_CONFIG = {
  // Base URL for the API
  BASE_URL: 'https://sistemachamado-backend-production.up.railway.app',
  
  // Enable CORS proxy since the backend is not configured with CORS for our domain
  USE_CORS_PROXY: true,
  
  // Primary CORS proxy - allorigins has issues with POST requests
  CORS_PROXY: 'https://api.allorigins.win/raw?url=',
  
  // Backup CORS proxies if the primary one fails - Reordered to prioritize ones that work better with POST
  BACKUP_CORS_PROXIES: [
    'https://corsproxy.io/?',
    'https://cors-anywhere.herokuapp.com/'
  ],
  
  // Maximum number of retry attempts for failed requests
  MAX_RETRY_ATTEMPTS: 3,
  
  // Retry delay between retry attempts (in ms)
  RETRY_DELAY: 1000,
};
