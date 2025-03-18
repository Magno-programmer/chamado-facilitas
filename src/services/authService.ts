
import { User } from '@/lib/types';
import { isUsingMockData } from '@/lib/supabase';
import { 
  signInWithSupabase, 
  signOutWithSupabase, 
  getCurrentUserWithSupabase,
  verifyCredentialsWithSupabase
} from './auth/supabaseAuth';
import { 
  signInWithApi, 
  signOutWithApi, 
  getCurrentUserFromStorage 
} from './auth/apiAuth';

// Main authentication service - uses Supabase by default, falls back to API
export const signIn = async (email: string, password: string) => {
  console.log('📝 [authService] Iniciando login com:', { email });
  
  try {
    // Use Supabase for authentication - this is the primary auth method
    const result = await signInWithSupabase(email, password);
    
    // If Supabase authentication fails with connection issues and we're not using mock data,
    // try API authentication as fallback
    if (result.error && result.error.message.includes('fetch') && !isUsingMockData) {
      console.log('📝 [authService] Falha na conexão com Supabase, tentando API como fallback');
      return signInWithApi(email, password);
    }
    
    return result;
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
    // Use Supabase for signing out
    const { error } = await signOutWithSupabase();
    
    // Also sign out from API if needed
    if (!isUsingMockData) {
      await signOutWithApi();
    }
    
    return { error };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error };
  }
};

export const getCurrentUser = async () => {
  try {
    // Use Supabase to get current user
    const supabaseResult = await getCurrentUserWithSupabase();
    
    if (supabaseResult.user) {
      return supabaseResult;
    }
    
    // If no user in Supabase and we're not using mock data, check localStorage
    if (!isUsingMockData) {
      return getCurrentUserFromStorage();
    }
    
    return { user: null, error: null };
  } catch (error) {
    console.error('Get current user error:', error);
    return { user: null, error: null };
  }
};

// This function verifies credentials
export const verifyUserCredentials = async (email: string, password: string): Promise<User | null> => {
  console.log('📝 [authService] Verificando credenciais para:', email);
  return verifyCredentialsWithSupabase(email, password);
};
