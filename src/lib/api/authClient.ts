
import { fetchWithAuth, setAuthToken } from './baseClient';

// Authentication API - Adapted for the Flask backend
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },
  
  logout: async () => {
    try {
      await fetchWithAuth('/auth/logout', {
        method: 'POST',
      });
    } finally {
      // We don't need to clear the token here as it's handled by the auth service
    }
  },
};
