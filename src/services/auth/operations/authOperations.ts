
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { User } from '@/lib/types';
import { createUserFromSupabaseData, storeUserData, getUserFromStorage } from '../utils/authUtils';

/**
 * Sign in with Supabase
 */
export const signInWithSupabase = async (email: string, password: string) => {
  console.log('📝 [authOperations] Iniciando login com:', { email });
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('📝 [authOperations] Erro no login com Supabase:', error);
      return { data: { session: null }, error: new Error(error.message) };
    }
    
    if (data.session) {
      // Extract user details from Supabase session
      const supabaseUser = data.session.user;
      
      // Build user object
      const user = createUserFromSupabaseData(supabaseUser, email);
      
      console.log('📝 [authOperations] Dados do usuário construídos:', user);
      
      // Store user data in localStorage
      storeUserData(user);
      
      return { data, error: null };
    }
    
    console.log('📝 [authOperations] Login falhou - sem sessão na resposta');
    return {
      data: { session: null },
      error: new Error('Credenciais inválidas')
    };
  } catch (error) {
    console.error('📝 [authOperations] Erro de login:', error);
    return {
      data: { session: null },
      error: new Error('Falha na autenticação')
    };
  }
};

/**
 * Sign out from Supabase
 */
export const signOutWithSupabase = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    // Clear local storage
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    
    return { error };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error };
  }
};

/**
 * Get current user from Supabase
 */
export const getCurrentUserWithSupabase = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data.user) {
      return { user: null, error: null };
    }
    
    // Check if user is stored in local storage for additional data
    const userData = getUserFromStorage();
    
    return { 
      user: {
        id: userData?.id || parseInt(data.user.id) || 0,
        email: userData?.email || data.user.email,
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return { user: null, error: null };
  }
};

/**
 * Verify credentials with Supabase
 */
export const verifyCredentialsWithSupabase = async (email: string, password: string): Promise<User | null> => {
  console.log('📝 [authOperations] Verificando credenciais para:', email);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error || !data.session) {
      console.log('📝 [authOperations] Verificação falhou');
      return null;
    }
    
    const supabaseUser = data.session.user;
    return createUserFromSupabaseData(supabaseUser, email);
  } catch (error) {
    console.error('📝 [authOperations] Erro verificando credenciais:', error);
    return null;
  }
};
