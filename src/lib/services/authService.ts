
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/lib/types/user.types';
import { createSecureHash, verifyPassword } from '../passwordUtils';

/**
 * Updates the user's password hash in the database using a more secure hash format
 * @param userId The ID of the user to update
 * @param password The password to rehash and store
 * @returns Promise<boolean> True if successful, false otherwise
 */
export async function updatePasswordHash(userId: string, password: string): Promise<boolean> {
  try {
    console.log('DEBUG - updatePasswordHash - Starting password hash update for user ID:', userId);
    
    // Generate a new hash using the Web Crypto API with PBKDF2 algorithm
    const newHash = await createSecureHash(password);
    
    console.log('DEBUG - updatePasswordHash - Generated new secure hash');
    
    const { error } = await supabase
      .from('usuarios')
      .update({ senha_hash: newHash })
      .eq('id', userId);
    
    if (error) {
      console.error('DEBUG - updatePasswordHash - Error updating password hash:', error);
      return false;
    }
    
    console.log('DEBUG - updatePasswordHash - Password hash updated successfully for user ID:', userId);
    return true;
  } catch (error) {
    console.error('DEBUG - updatePasswordHash - Error in updatePasswordHash:', error);
    return false;
  }
}

/**
 * Changes a user's password after verifying their current password
 * @param userId The ID of the user changing their password
 * @param currentPassword The user's current password for verification
 * @param newPassword The new password to set
 * @returns Promise<{success: boolean, message: string}> Result with success status and message
 */
export async function changeUserPassword(
  userId: string, 
  currentPassword: string, 
  newPassword: string
): Promise<{success: boolean, message: string}> {
  try {
    console.log('DEBUG - changeUserPassword - Starting password change for user ID:', userId);
    
    // First, get the user's current password hash from the database
    const { data: userData, error: fetchError } = await supabase
      .from('usuarios')
      .select('senha_hash')
      .eq('id', userId)
      .single();
    
    if (fetchError || !userData) {
      console.error('DEBUG - changeUserPassword - Error fetching user data:', fetchError);
      return { success: false, message: 'Não foi possível verificar o usuário.' };
    }
    
    console.log('DEBUG - changeUserPassword - Retrieved current password hash');
    
    // Verify the current password matches the stored hash
    const passwordMatches = await verifyPassword(currentPassword, userData.senha_hash);
    console.log('DEBUG - changeUserPassword - Current password verification result:', passwordMatches);
    
    if (!passwordMatches) {
      return { success: false, message: 'Senha atual incorreta.' };
    }
    
    // Current password is correct, update to the new password
    const updateSuccess = await updatePasswordHash(userId, newPassword);
    
    if (!updateSuccess) {
      return { success: false, message: 'Erro ao atualizar a senha.' };
    }
    
    return { success: true, message: 'Senha alterada com sucesso.' };
  } catch (error) {
    console.error('DEBUG - changeUserPassword - Error in password change process:', error);
    return { success: false, message: 'Ocorreu um erro ao processar a alteração de senha.' };
  }
}

// Custom login function that uses the usuarios table
export const customSignIn = async (email: string, password: string): Promise<User | null> => {
  try {
    console.log('DEBUG - customSignIn - Attempting login with email:', email);
    
    // We don't store plain passwords in the database, so we can only query by email
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) {
      console.error('DEBUG - customSignIn - Error fetching user:', error);
      return null;
    }
    
    console.log('DEBUG - customSignIn - Found user with email:', email);
    console.log('DEBUG - customSignIn - User data:', { id: data.id, nome: data.nome, email: data.email, role: data.role });
    console.log('DEBUG - customSignIn - Hash stored in database:', data.senha_hash);
    
    // Verify the password against the hashed value in the database
    const passwordMatches = await verifyPassword(password, data.senha_hash);
    console.log('DEBUG - customSignIn - Password verification result:', passwordMatches);
    
    if (!passwordMatches) {
      console.error('DEBUG - customSignIn - Invalid password');
      return null;
    }
    
    console.log('DEBUG - customSignIn - Password verified successfully');
    
    // After successful verification, update the password hash using the improved algorithm
    // This refreshes the hash without changing the password
    await updatePasswordHash(data.id, password);
    
    // Map the database user to our User type
    // FIX: Corrigido para preservar o papel do usuário conforme definido no banco de dados
    const user: User = {
      id: data.id,
      name: data.nome,
      email: data.email,
      sectorId: data.setor_id,
      role: data.role // Corrigido para usar o role exato do banco de dados
    };
    
    console.log('DEBUG - customSignIn - Mapped user data with role:', user.role);
    
    return user;
  } catch (error) {
    console.error('DEBUG - customSignIn - Login error:', error);
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
