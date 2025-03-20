import { supabase } from '@/integrations/supabase/client';
import type { User } from '../types';
import { createSecureHash, verifyPassword } from '../passwordUtils';

/**
 * Updates the user's password hash in the database using a more secure hash format
 * @param userId The ID of the user to update
 * @param password The password to rehash and store
 * @returns Promise<boolean> True if successful, false otherwise
 */
export async function updatePasswordHash(userId: string, password: string): Promise<boolean> {
  try {
    // Generate a new hash using the Web Crypto API with PBKDF2 algorithm
    const newHash = await createSecureHash(password);
    
    console.log('Generated new secure hash for password update');
    
    const { error } = await supabase
      .from('usuarios')
      .update({ senha_hash: newHash })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating password hash:', error);
      return false;
    }
    
    console.log('Password hash updated successfully for user ID:', userId);
    return true;
  } catch (error) {
    console.error('Error in updatePasswordHash:', error);
    return false;
  }
}

// Custom login function that uses the usuarios table
export const customSignIn = async (email: string, password: string): Promise<User | null> => {
  try {
    console.log('Attempting login with email:', email);
    
    // We don't store plain passwords in the database, so we can only query by email
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) {
      console.error('Error fetching user:', error);
      return null;
    }
    
    console.log('Found user with email:', email);
    
    // Verify the password against the hashed value in the database
    const passwordMatches = await verifyPassword(password, data.senha_hash);
    if (!passwordMatches) {
      console.error('Invalid password');
      return null;
    }
    
    console.log('Password verified successfully');
    
    // After successful verification, update the password hash using the improved algorithm
    // This refreshes the hash without changing the password
    await updatePasswordHash(data.id, password);
    
    // Map the database user to our User type
    const user: User = {
      id: data.id,
      name: data.nome,
      email: data.email,
      sectorId: data.setor_id,
      role: data.role === 'ADMIN' ? 'ADMIN' : 'CLIENT'
    };
    
    return user;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

// We'll keep these functions for compatibility, but they'll use our custom implementation
export const signIn = customSignIn;

export const signOut = async () => {
  // Since we're not using Supabase Auth, this is just a placeholder
  // In a real app, you might want to clear session storage or cookies
  return true;
}

// User profile functions
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}
