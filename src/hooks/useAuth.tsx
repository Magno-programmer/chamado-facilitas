
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/lib/types'; 
import { customSignIn, signOut } from '@/lib/services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for existing auth on first load
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        // Try to get user data from localStorage
        const storedUserData = localStorage.getItem('user');
        
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth status check error:', error);
        // If there's an error, clear the localStorage
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Attempting login with:', email);
      
      const userData = await customSignIn(email, password);
      
      if (!userData) {
        return { success: false, message: 'Email ou senha inválidos.' };
      }
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, message: 'Login bem-sucedido.' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Ocorreu um erro durante o login.' };
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      setIsLoading(true);
      await signOut();
      
      // Clear localStorage and user state
      localStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
