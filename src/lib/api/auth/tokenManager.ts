
// Token management functions

// Store the JWT token
let authToken: string | null = null;

/**
 * Set the auth token (called after login)
 */
export const setAuthToken = (token: string) => {
  console.log('📝 [tokenManager] Definindo token de autenticação:', token?.substring(0, 15) + '...');
  authToken = token;
  localStorage.setItem('authToken', token);
};

/**
 * Get the current auth token
 */
export const getAuthToken = (): string | null => {
  return authToken;
};

/**
 * Get the stored token (called on app initialization)
 */
export const getStoredAuthToken = (): string | null => {
  const token = localStorage.getItem('authToken');
  console.log('📝 [tokenManager] Token recuperado do localStorage:', token ? `${token.substring(0, 15)}...` : 'nenhum');
  if (token) {
    authToken = token;
  }
  return token;
};

/**
 * Clear the auth token (called on logout)
 */
export const clearAuthToken = () => {
  console.log('📝 [tokenManager] Limpando token de autenticação');
  authToken = null;
  localStorage.removeItem('authToken');
};

