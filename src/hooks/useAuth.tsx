
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

// Define the shape of our authentication context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for existing user session on mount
  useEffect(() => {
    const checkUserSession = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Failed to parse user data:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      
      setIsLoading(false);
    };
    
    checkUserSession();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Using custom fetch to capture and log all response headers
      const response = await fetch('https://sistemachamado-backend-production.up.railway.app/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        mode: 'cors',
      });
      
      // Log the response status and headers for debugging
      console.log('Login response status:', response.status);
      console.log('Login response headers:');
      
      // Convert headers to object and log them
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        console.log(`${key}: ${value}`);
        headers[key] = value;
      });
      
      // Display all headers in a toast for visibility
      const headersText = Object.entries(headers)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      
      toast({
        title: "Response Headers",
        description: <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>{headersText}</pre>,
        duration: 10000,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro de conexão com o servidor' }));
        throw new Error(errorData.message || 'Falha na autenticação');
      }
      
      const data = await response.json();
      
      // Store user data and token
      const userData = data.user;
      const token = data.token;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo, ${userData.name}!`,
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      
      // If it's a network error, suggest CORS issue
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        toast({
          title: "Erro de Conexão",
          description: "Não foi possível conectar ao servidor. Isso pode ser um problema de CORS. Verifique se o servidor está configurado corretamente.",
          variant: "destructive",
          duration: 5000,
        });
      } else {
        toast({
          title: "Erro ao fazer login",
          description: error instanceof Error ? error.message : "Email ou senha inválidos. Verifique também se o servidor está acessível.",
          variant: "destructive",
        });
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    setUser(null);
    
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
