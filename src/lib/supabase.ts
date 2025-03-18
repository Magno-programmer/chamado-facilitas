
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export indicator that we're no longer using mock data
export const isUsingMockData = false;

// Authentication functions using Supabase
export const signIn = async (email: string, password: string) => {
  console.log('📝 [supabase] Tentando login com:', { email, password: '••••••••' });
  
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
};

export const signOut = async () => {
  console.log('📝 [supabase] Realizando logout');
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  console.log('📝 [supabase] Verificando usuário atual');
  
  const { data, error } = await supabase.auth.getUser();
  
  if (error || !data.user) {
    console.log('📝 [supabase] Nenhum usuário encontrado');
    return { user: null, error };
  }
  
  console.log('📝 [supabase] Usuário encontrado:', data.user);
  return { user: data.user, error: null };
};
