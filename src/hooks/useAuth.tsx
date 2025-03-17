
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/lib/types';
import { signIn, signOut, getCurrentUser } from '@/services/authService';

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
          // Get user from localStorage (already set by getCurrentUser or signIn)
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
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
      
      // Get the user from localStorage (set by signIn)
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // Verificar se o usuário é admin (role pode estar em maiúsculas no backend)
        const isUserAdmin = userData.role?.toUpperCase() === 'ADMIN';
        
        toast({
          title: 'Login bem-sucedido',
          description: `Bem-vindo, ${userData.name}!`,
        });
        
        return true;
      }
      
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
        isAdmin: user?.role?.toUpperCase() === 'ADMIN',
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

