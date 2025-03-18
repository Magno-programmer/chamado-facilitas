
import { createClient } from '@supabase/supabase-js';

// Set Supabase URL and anonymous key
const supabaseUrl = 'https://ryskqkqgjvzcloibkykl.supabase.co';
// Using the provided anon key directly in the code (this is safe as it's a public key)
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5c2txa3FnanZ6Y2xvaWJreWtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyNjQwNjYsImV4cCI6MjA1Nzg0MDA2Nn0.Bny9fazEiIeCyVxLuhT3OLErOCqTOltYxbhfLDGuDtI';

// Supabase is now properly configured with direct key
export const isSupabaseConfigured = true;

// Create and export the Supabase client with the proper key
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// We're using real Supabase now, not mock data
export const isUsingMockData = false;

// Authentication functions using Supabase
export const signIn = async (email: string, password: string) => {
  console.log('📝 [supabase] Tentando login com:', { email, password: '••••••••' });
  
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
