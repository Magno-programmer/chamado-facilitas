
import { User } from '@/lib/types';
import { supabase, signIn as supabaseSignIn, signOut as supabaseSignOut, getCurrentUser as supabaseGetCurrentUser, isUsingMockData } from '@/lib/supabase';
import { authApi, clearAuthToken } from '@/lib/api';

export const signIn = async (email: string, password: string) => {
  console.log('📝 [authService] Iniciando login com:', { email });
  
  try {
    // Use Supabase for authentication
    const { data, error } = await supabaseSignIn(email, password);
    
    if (error) {
      console.error('📝 [authService] Erro no login com Supabase:', error);
      return { data: { session: null }, error: new Error(error.message) };
    }
    
    if (data.session) {
      // Extract user details from Supabase session
      const supabaseUser = data.session.user;
      
      // Build user object
      const user = {
        id: supabaseUser.id,
        name: supabaseUser.user_metadata?.name || email.split('@')[0],
        email: supabaseUser.email || email,
        sectorId: supabaseUser.user_metadata?.sector_id || 1,
        role: supabaseUser.user_metadata?.role || 'CLIENT'
      };
      
      console.log('📝 [authService] Dados do usuário construídos:', user);
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isLoggedIn', 'true');
      
      return { data, error: null };
    }
    
    console.log('📝 [authService] Login falhou - sem sessão na resposta');
    return {
      data: { session: null },
      error: new Error('Credenciais inválidas')
    };
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
    const { error } = await supabaseSignOut();
    
    // Clear local storage
    clearAuthToken();
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    
    return { error };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error };
  }
};

export const getCurrentUser = async () => {
  try {
    // Use Supabase to get current user
    const { user, error } = await supabaseGetCurrentUser();
    
    if (error || !user) {
      return { user: null, error: null };
    }
    
    // Check if user is stored in local storage for additional data
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
      return { 
        user: {
          id: user.id,
          email: user.email,
        }, 
        error: null 
      };
    }
    
    const userData = JSON.parse(storedUser) as User;
    
    return { 
      user: {
        id: userData.id || user.id,
        email: userData.email || user.email,
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return { user: null, error: null };
  }
};

// This function verifies credentials directly with Supabase
export const verifyUserCredentials = async (email: string, password: string): Promise<User | null> => {
  console.log('📝 [authService] Verificando credenciais para:', email);
  
  try {
    const { data, error } = await supabaseSignIn(email, password);
    
    if (error || !data.session) {
      console.log('📝 [authService] Verificação falhou');
      return null;
    }
    
    const supabaseUser = data.session.user;
    
    return { 
      id: parseInt(supabaseUser.id) || 0, 
      name: supabaseUser.user_metadata?.name || email.split('@')[0], 
      email: supabaseUser.email || email, 
      sectorId: supabaseUser.user_metadata?.sector_id || 1, 
      role: (supabaseUser.user_metadata?.role || 'CLIENT') as 'ADMIN' | 'CLIENT'
    };
  } catch (error) {
    console.error('📝 [authService] Erro verificando credenciais:', error);
    return null;
  }
};

// Toggle function is no longer needed with Supabase integration
