
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
      console.log('📝 [useAuth] Verificando sessão do usuário');
      setIsLoading(true);
      
      try {
        const { user: authUser, error } = await getCurrentUser();
        console.log('📝 [useAuth] Resultado da verificação:', { authUser, error });
        
        if (authUser) {
          // Get user from localStorage (already set by getCurrentUser or signIn)
          const storedUser = localStorage.getItem('user');
          console.log('📝 [useAuth] Usuário encontrado no localStorage:', storedUser);
          
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            console.log('📝 [useAuth] Definindo usuário do estado:', parsedUser);
            setUser(JSON.parse(storedUser));
          }
        } else {
          console.log('📝 [useAuth] Nenhum usuário encontrado, resetando estado');
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('isLoggedIn');
        }
      } catch (error) {
        console.error('📝 [useAuth] Erro na verificação de autenticação:', error);
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
      }
      
      setIsLoading(false);
    };
    
    checkUser();
  }, []);
  
  const login = async (email: string, password: string) => {
    console.log('📝 [useAuth] Iniciando login para:', email);
    try {
      const { data, error } = await signIn(email, password);
      console.log('📝 [useAuth] Resultado do login:', { data, error });
      
      if (error) {
        console.log('📝 [useAuth] Erro no login:', error.message);
        toast({
          title: 'Erro de login',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }
      
      // Get the user from localStorage (set by signIn)
      const storedUser = localStorage.getItem('user');
      console.log('📝 [useAuth] Usuário recuperado após login:', storedUser);
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log('📝 [useAuth] Definindo usuário no estado após login:', userData);
        setUser(userData);
        
        // Verificar se o usuário é admin (role pode estar em maiúsculas no backend)
        const isUserAdmin = userData.role?.toUpperCase() === 'ADMIN';
        console.log('📝 [useAuth] Usuário é admin?', isUserAdmin, 'Role:', userData.role);
        
        toast({
          title: 'Login bem-sucedido',
          description: `Bem-vindo, ${userData.name}!`,
        });
        
        return true;
      }
      
      console.log('📝 [useAuth] Login bem-sucedido mas sem dados de usuário no localStorage');
      toast({
        title: 'Login bem-sucedido',
        description: 'Bem-vindo de volta!',
      });
      
      return true;
    } catch (error) {
      console.error('📝 [useAuth] Erro durante o login:', error);
      toast({
        title: 'Erro de login',
        description: 'Ocorreu um erro ao fazer login. Tente novamente.',
        variant: 'destructive',
      });
      return false;
    }
  };
  
  const logout = async () => {
    console.log('📝 [useAuth] Iniciando logout');
    try {
      await signOut();
      console.log('📝 [useAuth] Logout bem-sucedido, limpando estado');
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      navigate('/login');
      
      toast({
        title: 'Logout bem-sucedido',
        description: 'Você foi desconectado com sucesso.',
      });
    } catch (error) {
      console.error('📝 [useAuth] Erro durante logout:', error);
      toast({
        title: 'Erro ao sair',
        description: 'Ocorreu um erro ao fazer logout. Tente novamente.',
        variant: 'destructive',
      });
    }
  };
  
  console.log('📝 [useAuth] Estado atual do usuário:', user);
  console.log('📝 [useAuth] isAdmin:', user?.role?.toUpperCase() === 'ADMIN');
  
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
