
import { User } from '@/lib/types';
import { 
  signInWithApi, 
  signOutWithApi, 
  getCurrentUserFromStorage 
} from './auth/apiAuth';

// Main authentication service - now using only the API
export const signIn = async (email: string, password: string) => {
  console.log('📝 [authService] Iniciando login com:', { email });
  
  try {
    // Use only API for authentication
    return signInWithApi(email, password);
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
    // Sign out using only API
    await signOutWithApi();
    
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error };
  }
};

export const getCurrentUser = async () => {
  try {
    // Get current user from storage (API doesn't provide a current user endpoint)
    return getCurrentUserFromStorage();
  } catch (error) {
    console.error('Get current user error:', error);
    return { user: null, error: null };
  }
};

// Verify credentials directly with API
export const verifyUserCredentials = async (email: string, password: string): Promise<User | null> => {
  console.log('📝 [authService] Verificando credenciais para:', email);
  
  try {
    const response = await signInWithApi(email, password);
    if (response.data?.session?.user) {
      return response.data.session.user as User;
    }
    return null;
  } catch (error) {
    console.error('📝 [authService] Erro ao verificar credenciais:', error);
    return null;
  }
};
