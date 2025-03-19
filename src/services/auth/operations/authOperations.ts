
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { User } from '@/lib/types';
import { createUserFromSupabaseData, storeUserData, getUserFromStorage, createMockAdminUser } from '../utils/authUtils';
import { authApi } from '@/lib/api';

/**
 * Sign in with Supabase
 * This is used for authentication when Supabase is available
 */
export const signInWithSupabase = async (email: string, password: string) => {
  console.log('📝 [authOperations] Iniciando login com Supabase:', { email });
  
  try {
    // First try with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('📝 [authOperations] Erro no login com Supabase:', error);
      
      // If Supabase fails with auth error, try backend API
      if (error.message.includes('Invalid login credentials')) {
        console.log('📝 [authOperations] Tentando login com backend API após falha no Supabase');
        
        try {
          const apiResponse = await authApi.login(email, password);
          
          if (apiResponse && apiResponse.token) {
            console.log('📝 [authOperations] Login com API bem-sucedido');
            
            // Create a user object from the API response
            const apiUser = apiResponse.user || { 
              id: 0, 
              nome: email.split('@')[0], 
              email: email 
            };
            
            const user: User = {
              id: apiUser.id || 0,
              name: apiUser.nome || email.split('@')[0],
              email: apiUser.email || email,
              sectorId: apiUser.setor_id || 1,
              role: (apiUser.role || 'CLIENT').toUpperCase() as 'ADMIN' | 'CLIENT'
            };
            
            // Store the user data
            storeUserData(user);
            
            // Return a response format compatible with Supabase
            return { 
              data: { 
                session: { 
                  access_token: apiResponse.token,
                  user: { 
                    id: String(user.id),
                    email: user.email
                  } 
                } 
              }, 
              error: null 
            };
          }
        } catch (apiError) {
          console.error('📝 [authOperations] Falha no login com API:', apiError);
        }
      }
      
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
 * Sign out from both Supabase and API
 */
export const signOutWithSupabase = async () => {
  try {
    // Sign out from Supabase if configured
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    
    // Clear local storage
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('authToken');
    
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error };
  }
};

/**
 * Get current user from Supabase or localStorage
 */
export const getCurrentUserWithSupabase = async () => {
  try {
    // Try to get user from Supabase first
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.getUser();
      
      if (!error && data.user) {
        // Check if user is stored in local storage for additional data
        const userData = getUserFromStorage();
        
        if (userData) {
          return { user: userData, error: null };
        }
        
        return { 
          user: {
            id: parseInt(data.user.id) || 0,
            email: data.user.email,
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuário',
            sectorId: data.user.user_metadata?.sector_id || 1,
            role: (data.user.user_metadata?.role || 'CLIENT').toUpperCase() as 'ADMIN' | 'CLIENT'
          }, 
          error: null 
        };
      }
    }
    
    // If no user in Supabase, check localStorage
    const userData = getUserFromStorage();
    if (userData) {
      return { user: userData, error: null };
    }
    
    return { user: null, error: null };
  } catch (error) {
    console.error('Get current user error:', error);
    return { user: null, error: null };
  }
};

/**
 * Verify credentials with both Supabase and API
 */
export const verifyCredentialsWithSupabase = async (email: string, password: string): Promise<User | null> => {
  console.log('📝 [authOperations] Verificando credenciais para:', email);
  
  try {
    // First try with Supabase
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (!error && data.session) {
        const supabaseUser = data.session.user;
        return createUserFromSupabaseData(supabaseUser, email);
      }
    }
    
    // If Supabase fails or is not configured, try the backend API
    try {
      const response = await authApi.login(email, password);
      
      if (response && response.token) {
        // Create a user object from the API response
        const apiUser = response.user || { 
          id: 0, 
          nome: email.split('@')[0], 
          email: email 
        };
        
        return {
          id: apiUser.id || 0,
          name: apiUser.nome || email.split('@')[0],
          email: apiUser.email || email,
          sectorId: apiUser.setor_id || 1,
          role: (apiUser.role || 'CLIENT').toUpperCase() as 'ADMIN' | 'CLIENT'
        };
      }
    } catch (apiError) {
      console.error('📝 [authOperations] Falha ao verificar credenciais com API:', apiError);
    }
    
    // If both methods fail, return null
    console.log('📝 [authOperations] Verificação falhou');
    return null;
  } catch (error) {
    console.error('📝 [authOperations] Erro verificando credenciais:', error);
    return null;
  }
};
