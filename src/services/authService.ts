
import { User } from '@/lib/types';

// Mock authentication service without Node.js dependencies
export const signIn = async (email: string, password: string) => {
  try {
    // Mock credentials for demo
    if ((email === 'admin@example.com' && password === 'admin123') || 
        (email === 'cliente@example.com' && password === 'cliente123')) {
      
      const isAdmin = email === 'admin@example.com';
      const user = {
        id: isAdmin ? 1 : 2,
        name: isAdmin ? 'Admin User' : 'Cliente User',
        email,
        sectorId: isAdmin ? 1 : 2,
        role: isAdmin ? 'ADMIN' : 'CLIENT'
      };
      
      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isLoggedIn', 'true');
      
      return {
        data: {
          session: {
            user: {
              id: String(user.id),
              email: user.email,
            }
          }
        },
        error: null
      };
    }
    
    return {
      data: { session: null },
      error: new Error('Credenciais inválidas')
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      data: { session: null },
      error: new Error('Falha na autenticação')
    };
  }
};

export const signOut = async () => {
  try {
    // Clear local storage
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error };
  }
};

export const getCurrentUser = async () => {
  try {
    // Check if user is stored in local storage
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
      return { user: null, error: null };
    }
    
    const userData = JSON.parse(storedUser) as User;
    
    return { 
      user: {
        id: String(userData.id),
        email: userData.email,
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return { user: null, error };
  }
};

// This is a browser-compatible mock implementation
export const verifyUserCredentials = async (email: string, password: string): Promise<User | null> => {
  if ((email === 'admin@example.com' && password === 'admin123')) {
    return { 
      id: 1, 
      name: 'Admin User', 
      email: 'admin@example.com', 
      sectorId: 1, 
      role: 'ADMIN' 
    };
  }
  
  if ((email === 'cliente@example.com' && password === 'cliente123')) {
    return { 
      id: 2, 
      name: 'Cliente User', 
      email: 'cliente@example.com', 
      sectorId: 2, 
      role: 'CLIENT' 
    };
  }
  
  return null;
};
