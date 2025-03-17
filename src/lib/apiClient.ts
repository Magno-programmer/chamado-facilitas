
import { User } from './types';

// Base URL for the API
const API_BASE_URL = 'http://192.168.15.6:5001'; // You may need to update this

// Store the JWT token
let authToken: string | null = null;

// Helper for making authenticated requests
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
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

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
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
      throw new Error(errorData?.message || `API Error: ${response.status}`);
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

// Authentication API
export const authApi = {
  login: async (email: string, password: string) => {
    const data = await fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.token) {
      setAuthToken(data.token);
    }
    
    return data;
  },
  
  logout: async () => {
    try {
      await fetchWithAuth('/auth/logout', {
        method: 'POST',
      });
    } finally {
      clearAuthToken();
    }
  },
};

// Users API
export const usersApi = {
  getAll: () => fetchWithAuth('/usuarios'),
  
  getByEmail: (email: string) => fetchWithAuth(`/usuarios/email?email=${encodeURIComponent(email)}`),
  
  create: (userData: { nome: string; email: string; setor_id: number; senha: string }) => 
    fetchWithAuth('/usuarios', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  update: (userId: number, userData: Partial<{ nome: string; email: string; setor_id: number; senha: string }>) => 
    fetchWithAuth(`/usuarios/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
  
  delete: (userId: number) => 
    fetchWithAuth(`/usuarios/${userId}`, {
      method: 'DELETE',
    }),
};

// Sectors API
export const sectorsApi = {
  getAll: () => fetchWithAuth('/setores'),
  
  create: (name: string) => 
    fetchWithAuth('/setores', {
      method: 'POST',
      body: JSON.stringify({ nome: name }),
    }),
  
  delete: (sectorId: number) => 
    fetchWithAuth(`/setores/${sectorId}`, {
      method: 'DELETE',
    }),
};

// Tickets API
export const ticketsApi = {
  getAll: () => fetchWithAuth('/chamados'),
  
  create: (ticketData: { titulo: string; descricao: string; setor_id: number; prazo: string }) => 
    fetchWithAuth('/chamados', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    }),
  
  updateStatus: (ticketId: number, status: string) => 
    fetchWithAuth(`/chamados/${ticketId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  
  delete: (ticketId: number) => 
    fetchWithAuth(`/chamados/${ticketId}`, {
      method: 'DELETE',
    }),
};

// Deadlines API
export const deadlinesApi = {
  getAll: () => fetchWithAuth('/prazos'),
  
  create: (deadlineData: { titulo: string; setor_id: number; prazo: string }) => 
    fetchWithAuth('/prazos', {
      method: 'POST',
      body: JSON.stringify(deadlineData),
    }),
  
  delete: (deadlineId: number) => 
    fetchWithAuth(`/prazos/${deadlineId}`, {
      method: 'DELETE',
    }),
};
