
import { User } from '@/lib/types';
import { createMockAdminUser, storeUserData } from './authUtils';

/**
 * Handles mock sign-in for development when Supabase is not configured
 */
export const handleMockSignIn = (email: string, password: string) => {
  console.log('📝 [mockAuth] Simulando login com:', { email, password: '••••••••' });
  
  if (email === 'admin@example.com' && password === 'senha123') {
    const mockUser = createMockAdminUser(email);
    
    // Store user data in localStorage
    storeUserData(mockUser);
    
    return { 
      data: { 
        session: { 
          user: {
            id: '1',
            email: email,
            user_metadata: {
              name: 'Admin User',
              role: 'ADMIN',
              sector_id: 1
            }
          } 
        } 
      }, 
      error: null 
    };
  } else {
    return {
      data: { session: null },
      error: new Error('Credenciais inválidas')
    };
  }
};

/**
 * Verifies mock credentials for development
 */
export const verifyMockCredentials = (email: string, password: string): User | null => {
  console.log('📝 [mockAuth] Verificando credenciais mockadas para:', email);
  
  if (email === 'admin@example.com' && password === 'senha123') {
    return createMockAdminUser(email);
  }
  return null;
};
