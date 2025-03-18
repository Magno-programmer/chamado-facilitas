
import { User } from '@/lib/types';
import { authApi, setAuthToken, getStoredAuthToken, clearAuthToken } from '@/lib/api';
import * as mockAuth from '@/lib/supabase';

// Initialize auth from localStorage on app load
getStoredAuthToken();

// Flag para utilizar mock quando a API estiver indisponível
let useLocalMock = false;

export const signIn = async (email: string, password: string) => {
  console.log('📝 [authService] Iniciando login com:', { email });
  try {
    if (!useLocalMock) {
      console.log('📝 [authService] Tentando login via API...');
      try {
        const result = await authApi.login(email, password);
        console.log('📝 [authService] Resposta da API:', result);
        
        if (result.token) {
          console.log('📝 [authService] Token recebido:', result.token?.substring(0, 15) + '...');
          
          // Store user info com base na resposta do backend Flask
          const user = {
            id: result.userId || result.user?.id,
            name: result.user?.nome || result.nome || email.split('@')[0], // Fallback para nome
            email: result.email || email,
            sectorId: result.user?.setor_id || result.setor_id || 0,
            role: result.role || result.user?.role || 'USER'
          };
          
          console.log('📝 [authService] Dados do usuário construídos:', user);
          
          // Store user data in localStorage
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('isLoggedIn', 'true');
          console.log('📝 [authService] Dados salvos no localStorage');
          
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
        
        console.log('📝 [authService] Login falhou - sem token na resposta');
        return {
          data: { session: null },
          error: new Error(result.erro || 'Credenciais inválidas')
        };
      } catch (apiError) {
        console.error('📝 [authService] Erro ao tentar API, alternando para mock:', apiError);
        useLocalMock = true;
        // Continue para a implementação de mock abaixo
      }
    }
    
    // Usando implementação de mock quando a API está indisponível
    console.log('📝 [authService] Usando implementação de mock para login');
    const mockResult = await mockAuth.signIn(email, password);
    console.log('📝 [authService] Resposta do mock:', mockResult);
    
    if (mockResult.error) {
      console.log('📝 [authService] Login mock falhou:', mockResult.error);
      return mockResult;
    }
    
    console.log('📝 [authService] Login mock bem-sucedido');
    return mockResult;
    
  } catch (error) {
    console.error('📝 [authService] Erro de login:', error);
    return {
      data: { session: null },
      error: new Error('Falha na autenticação')
    };
  }
};

export const signOut = async () => {
  try {
    if (!useLocalMock) {
      try {
        await authApi.logout();
      } catch (error) {
        console.error('📝 [authService] Erro no logout da API, usando mock:', error);
        await mockAuth.signOut();
      }
    } else {
      await mockAuth.signOut();
    }
    
    // Clear local storage
    clearAuthToken();
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
    if (useLocalMock) {
      return await mockAuth.getCurrentUser();
    }
    
    // Check if user is stored in local storage
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
      return { user: null, error: null };
    }
    
    const userData = JSON.parse(storedUser) as User;
    
    // Check if token exists
    if (!getStoredAuthToken()) {
      return { user: null, error: null };
    }
    
    return { 
      user: {
        id: String(userData.id),
        email: userData.email,
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return { user: null, error: null };
  }
};

// This function verifies credentials directly with the API
export const verifyUserCredentials = async (email: string, password: string): Promise<User | null> => {
  console.log('📝 [authService] Verificando credenciais para:', email);
  
  try {
    if (!useLocalMock) {
      try {
        const result = await authApi.login(email, password);
        console.log('📝 [authService] Resultado da verificação de credenciais via API:', result);
        
        if (result.token) {
          console.log('📝 [authService] Verificação bem-sucedida, retornando dados do usuário');
          return { 
            id: result.user.id, 
            name: result.user.nome, 
            email: result.user.email, 
            sectorId: result.user.setor_id, 
            role: result.user.role 
          };
        }
      } catch (error) {
        console.error('📝 [authService] Erro verificando credenciais na API, usando mock:', error);
        // Continue para a verificação mock
      }
    }
    
    // Verificação com mock
    console.log('📝 [authService] Verificando credenciais via mock');
    const mockResult = await mockAuth.signIn(email, password);
    
    if (mockResult.error) {
      console.log('📝 [authService] Verificação mock falhou');
      return null;
    }
    
    // Extrair usuário do localStorage após login mock bem-sucedido
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      console.log('📝 [authService] Verificação mock bem-sucedida');
      return JSON.parse(storedUser) as User;
    }
    
    console.log('📝 [authService] Verificação falhou - sem dados do usuário');
    return null;
  } catch (error) {
    console.error('📝 [authService] Erro verificando credenciais:', error);
    return null;
  }
};

// Função de utilidade para alternar entre API real e mock (para debugging)
export const toggleMockMode = (useMock: boolean) => {
  useLocalMock = useMock;
  console.log(`📝 [authService] Modo mock ${useMock ? 'ativado' : 'desativado'}`);
};

