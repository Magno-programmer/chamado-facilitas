
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase, signIn, signOut, getCurrentUser } from '@/lib/supabase';
import { User } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for user session on mount
    const checkUser = async () => {
      setIsLoading(true);
      
      try {
        const { user: authUser, error } = await getCurrentUser();
        
        if (authUser) {
          if (supabase) {
            // If using real Supabase, get user profile from database
            const { data, error: profileError } = await supabase
              .from('usuarios')
              .select('*')
              .eq('email', authUser.email)
              .single();
              
            if (data) {
              setUser({
                id: data.id,
                name: data.nome,
                email: data.email,
                sectorId: data.setor_id,
                role: data.role,
              });
              
              localStorage.setItem('user', JSON.stringify({
                id: data.id,
                name: data.nome,
                email: data.email,
                sectorId: data.setor_id,
                role: data.role,
              }));
              localStorage.setItem('isLoggedIn', 'true');
            } else {
              console.warn('User profile not found:', profileError);
              // Fall back to mock data if profile not found
              const mockUser = JSON.parse(localStorage.getItem('user') || '{}');
              setUser(mockUser as User);
            }
          } else {
            // Using mock data - get user from localStorage
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              setUser(JSON.parse(storedUser));
            }
          }
        } else {
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('isLoggedIn');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
      }
      
      setIsLoading(false);
    };
    
    checkUser();
    
    // Listen for auth changes if using real Supabase
    let authUnsubscribe: (() => void) | null = null;
    
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          checkUser();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('isLoggedIn');
        }
      });
      
      authUnsubscribe = data.subscription.unsubscribe;
    }
    
    return () => {
      if (authUnsubscribe) {
        authUnsubscribe();
      }
    };
  }, []);
  
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: 'Erro de login',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }
      
      // The user state will be updated by the auth listener or local storage
      navigate('/dashboard');
      
      toast({
        title: 'Login bem-sucedido',
        description: 'Bem-vindo de volta!',
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Erro de login',
        description: 'Ocorreu um erro ao fazer login. Tente novamente.',
        variant: 'destructive',
      });
      return false;
    }
  };
  
  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      navigate('/login');
      
      toast({
        title: 'Logout bem-sucedido',
        description: 'Você foi desconectado com sucesso.',
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Erro ao sair',
        description: 'Ocorreu um erro ao fazer logout. Tente novamente.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAdmin: user?.role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
