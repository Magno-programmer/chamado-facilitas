
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import supabase from '@/lib/supabase';

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
    const checkUserSession = async () => {
      // Verificar se existe uma sessão no Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        try {
          // Se temos uma sessão, obter os dados do usuário
          const { user: supabaseUser } = session;
          
          // Mapear o usuário do Supabase para nosso formato de usuário
          // Note: você precisa garantir que os dados do perfil do usuário contenham as informações necessárias
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();
            
          if (profile) {
            const userData: User = {
              id: profile.id,
              name: profile.name,
              email: supabaseUser.email || '',
              sectorId: profile.sector_id,
              role: profile.role
            };
            
            setUser(userData);
          }
        } catch (error) {
          console.error('Failed to get user data:', error);
          // Se houver erro, fazer logout
          await supabase.auth.signOut();
        }
      }
      
      setIsLoading(false);
    };
    
    checkUserSession();
    
    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Quando o usuário faz login, atualizar o estado
          const { user: supabaseUser } = session;
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();
            
          if (profile) {
            const userData: User = {
              id: profile.id,
              name: profile.name,
              email: supabaseUser.email || '',
              sectorId: profile.sector_id,
              role: profile.role
            };
            
            setUser(userData);
          }
        } else if (event === 'SIGNED_OUT') {
          // Quando o usuário faz logout, limpar o estado
          setUser(null);
        }
      }
    );
    
    // Cleanup function
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function using Supabase
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw new Error(error.message || 'Falha na autenticação');
      }
      
      if (data.user) {
        toast({
          title: "Login realizado com sucesso",
          description: `Bem-vindo!`,
        });
        
        return true;
      }
      
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
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
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
