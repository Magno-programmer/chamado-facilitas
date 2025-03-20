
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { customSignIn, signOut } from '@/lib/supabase';

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLogout, setIsLogout] = useState<boolean>(false);

  // Check for existing user session on mount
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        // Check for user in localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking session:', error);
        localStorage.removeItem('user');
      }
    };
    
    checkUserSession();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Use our custom sign in function
      const userData = await customSignIn(email, password);
      
      if (userData) {
        setUser(userData);
        setIsLogout(false);
        
        // Store user in localStorage for session persistence
        localStorage.setItem('user', JSON.stringify(userData));
        
        toast({
          title: "Login realizado com sucesso",
          description: `Bem-vindo, ${userData.name}!`,
        });
        
        return true;
      }
      
      toast({
        title: "Erro ao fazer login",
        description: "Email ou senha inválidos.",
        variant: "destructive",
      });
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      
      toast({
        title: "Erro ao fazer login",
        description: error instanceof Error ? error.message : "Email ou senha inválidos.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      setIsLogout(true);
      
      // Remove user from localStorage
      localStorage.removeItem('user');
      
      // Show friendly goodbye message
      const goodbyeMessages = [
        "Até breve! Esperamos vê-lo novamente em breve.",
        "Adeus e volte sempre! Foi um prazer atendê-lo.",
        "Logout realizado com sucesso. Tenha um ótimo dia!",
        "Você saiu da sua conta. Sentiremos sua falta!",
        "Até a próxima visita! Obrigado por usar o Facilitas."
      ];
      
      const randomMessage = goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)];
      
      toast({
        title: "Sessão encerrada",
        description: randomMessage,
      });
    } catch (error) {
      console.error('Logout error:', error);
      
      toast({
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro ao tentar desconectar.",
        variant: "destructive",
      });
    }
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
