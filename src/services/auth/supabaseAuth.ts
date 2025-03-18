
import { User } from '@/lib/types';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  signInWithSupabase as signInOperation,
  signOutWithSupabase as signOutOperation,
  getCurrentUserWithSupabase as getCurrentUserOperation,
  verifyCredentialsWithSupabase as verifyCredentialsOperation
} from './operations/authOperations';

// Sign in with Supabase
export const signInWithSupabase = async (email: string, password: string) => {
  return signInOperation(email, password);
};

// Sign out with Supabase
export const signOutWithSupabase = async () => {
  return signOutOperation();
};

// Get current user with Supabase
export const getCurrentUserWithSupabase = async () => {
  return getCurrentUserOperation();
};

// Verify credentials directly with Supabase
export const verifyCredentialsWithSupabase = async (email: string, password: string): Promise<User | null> => {
  return verifyCredentialsOperation(email, password);
};
