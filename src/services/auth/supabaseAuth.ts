
import { User } from '@/lib/types';
import { supabase, signIn as supabaseSignIn, signOut as supabaseSignOut, getCurrentUser as supabaseGetCurrentUser } from '@/lib/supabase';

// Sign in with Supabase
export const signInWithSupabase = async (email: string, password: string) => {
  console.log('📝 [supabaseAuth] Iniciando login com:', { email });
  
  try {
    const { data, error } = await supabaseSignIn(email, password);
    
    if (error) {
      console.error('📝 [supabaseAuth] Erro no login com Supabase:', error);
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
      
      console.log('📝 [supabaseAuth] Dados do usuário construídos:', user);
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isLoggedIn', 'true');
      
      return { data, error: null };
    }
    
    console.log('📝 [supabaseAuth] Login falhou - sem sessão na resposta');
    return {
      data: { session: null },
      error: new Error('Credenciais inválidas')
    };
  } catch (error) {
    console.error('📝 [supabaseAuth] Erro de login:', error);
    return {
      data: { session: null },
      error: new Error('Falha na autenticação')
    };
  }
};

// Sign out with Supabase
export const signOutWithSupabase = async () => {
  try {
    const { error } = await supabaseSignOut();
    
    // Clear local storage
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    
    return { error };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error };
  }
};

// Get current user with Supabase
export const getCurrentUserWithSupabase = async () => {
  try {
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

// Verify credentials directly with Supabase
export const verifyCredentialsWithSupabase = async (email: string, password: string): Promise<User | null> => {
  console.log('📝 [supabaseAuth] Verificando credenciais para:', email);
  
  try {
    const { data, error } = await supabaseSignIn(email, password);
    
    if (error || !data.session) {
      console.log('📝 [supabaseAuth] Verificação falhou');
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
    console.error('📝 [supabaseAuth] Erro verificando credenciais:', error);
    return null;
  }
};
