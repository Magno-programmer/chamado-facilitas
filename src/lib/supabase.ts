import { createClient } from '@supabase/supabase-js';

// Set Supabase URL and anonymous key
const supabaseUrl = 'https://ryskqkqgjvzcloibkykl.supabase.co';
// Always provide at least an empty string for the key to avoid "supabaseKey is required" error
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase anon key is configured
export const isSupabaseConfigured = Boolean(supabaseAnonKey && supabaseAnonKey !== '');

// Create and export the Supabase client with a valid key (even if empty)
export const supabase = createClient(supabaseUrl, supabaseAnonKey || ' ');

// Export indicator for mock data usage
export const isUsingMockData = !isSupabaseConfigured;

// Authentication functions using Supabase
export const signIn = async (email: string, password: string) => {
  console.log('📝 [supabase] Tentando login com:', { email, password: '••••••••' });
  
  if (!isSupabaseConfigured) {
    console.log('📝 [supabase] Supabase não configurado, simulando resposta');
    // Mock response for demo/development purposes
    if (email === 'admin@example.com' && password === 'senha123') {
      return {
        data: {
          session: {
            user: {
              id: '1',
              email: email,
              user_metadata: { 
                name: 'Admin User', 
                role: 'ADMIN',
                sector_id: 1
              }
            }
          }
        }, 
        error: null
      };
    } else {
      return { 
        data: { session: null }, 
        error: new Error('Credenciais inválidas')
      };
    }
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.log('📝 [supabase] Erro no login:', error.message);
      return { data: { session: null }, error };
    }
    
    console.log('📝 [supabase] Login bem-sucedido para:', email);
    return { data, error: null };
  } catch (error) {
    console.error('📝 [supabase] Erro ao tentar login:', error);
    return { 
      data: { session: null }, 
      error: new Error('Falha na conexão com Supabase')
    };
  }
};

export const signOut = async () => {
  console.log('📝 [supabase] Realizando logout');
  
  if (!isSupabaseConfigured) {
    console.log('📝 [supabase] Supabase não configurado, simulando resposta');
    return { error: null };
  }
  
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error('📝 [supabase] Erro ao tentar logout:', error);
    return { error: new Error('Falha na conexão com Supabase') };
  }
};

export const getCurrentUser = async () => {
  console.log('📝 [supabase] Verificando usuário atual');
  
  if (!isSupabaseConfigured) {
    console.log('📝 [supabase] Supabase não configurado, verificando localStorage');
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      return { 
        user: {
          id: userData.id,
          email: userData.email,
        }, 
        error: null 
      };
    }
    
    return { user: null, error: null };
  }
  
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data.user) {
      console.log('📝 [supabase] Nenhum usuário encontrado');
      return { user: null, error };
    }
    
    console.log('📝 [supabase] Usuário encontrado:', data.user);
    return { user: data.user, error: null };
  } catch (error) {
    console.error('📝 [supabase] Erro ao verificar usuário:', error);
    return { user: null, error: new Error('Falha na conexão com Supabase') };
  }
};
