
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { supabase, signIn, signOut, getUserProfile } from '@/lib/supabase';

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
      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Fetch user profile from our usuarios table
          const userProfile = await getUserProfile(session.user.id);
          
          // Map to our User type
          const mappedUser: User = {
            id: parseInt(userProfile.id, 10), // Convert string ID to number
            name: userProfile.nome,
            email: userProfile.email,
            sectorId: userProfile.setor_id,
            role: userProfile.role === 'ADMIN' ? 'ADMIN' : 'CLIENT'
          };
          
          setUser(mappedUser);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            // Fetch user profile from our usuarios table
            const userProfile = await getUserProfile(session.user.id);
            
            // Map to our User type
            const mappedUser: User = {
              id: parseInt(userProfile.id, 10), // Convert string ID to number
              name: userProfile.nome,
              email: userProfile.email,
              sectorId: userProfile.setor_id,
              role: userProfile.role === 'ADMIN' ? 'ADMIN' : 'CLIENT'
            };
            
            setUser(mappedUser);
          } catch (error) {
            console.error('Error fetching user profile:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );
    
    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Sign in with Supabase
      const authData = await signIn(email, password);
      
      if (authData.user) {
        try {
          // Fetch user profile from our usuarios table
          const userProfile = await getUserProfile(authData.user.id);
          
          // Map to our User type
          const mappedUser: User = {
            id: parseInt(userProfile.id, 10), // Convert string ID to number
            name: userProfile.nome,
            email: userProfile.email,
            sectorId: userProfile.setor_id,
            role: userProfile.role === 'ADMIN' ? 'ADMIN' : 'CLIENT'
          };
          
          setUser(mappedUser);
          
          toast({
            title: "Login realizado com sucesso",
            description: `Bem-vindo, ${userProfile.nome}!`,
          });
          
          return true;
        } catch (error) {
          console.error('Error fetching user profile:', error);
          throw new Error('Falha ao obter dados do usuário');
        }
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
    try {
      await signOut();
      setUser(null);
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
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
