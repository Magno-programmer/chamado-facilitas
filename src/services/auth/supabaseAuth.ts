
import { User } from '@/lib/types';
import { signInWithApi, signOutWithApi, getCurrentUserFromStorage } from './apiAuth';

// These functions now directly use the API authentication instead of Supabase
export const signInWithSupabase = async (email: string, password: string) => {
  return signInWithApi(email, password);
};

export const signOutWithSupabase = async () => {
  return signOutWithApi();
};

export const getCurrentUserWithSupabase = async () => {
  return getCurrentUserFromStorage();
};

export const verifyCredentialsWithSupabase = async (email: string, password: string): Promise<User | null> => {
  try {
    const response = await signInWithApi(email, password);
    if (response.data?.session?.user) {
      return response.data.session.user as User;
    }
    return null;
  } catch (error) {
    console.error('📝 [supabaseAuth] Erro ao verificar credenciais:', error);
    return null;
  }
};
