
import { supabase } from '@/lib/supabase';
import { User, UserFormData } from '@/lib/types';

export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*');

  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }

  return data.map(user => ({
    id: user.id,
    name: user.nome,
    email: user.email,
    sectorId: user.setor_id,
    role: user.role,
  }));
};

export const getUserById = async (id: number): Promise<User | null> => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching user ${id}:`, error);
    return null;
  }

  return {
    id: data.id,
    name: data.nome,
    email: data.email,
    sectorId: data.setor_id,
    role: data.role,
  };
};

export const createUser = async (userData: UserFormData): Promise<User | null> => {
  // First create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: userData.email,
    password: userData.password || 'changeme123',
    email_confirm: true,
  });

  if (authError) {
    console.error('Error creating auth user:', authError);
    throw authError;
  }

  // Then create profile in the usuarios table
  const { data, error } = await supabase
    .from('usuarios')
    .insert({
      nome: userData.name,
      email: userData.email,
      setor_id: userData.sectorId,
      role: userData.role,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.nome,
    email: data.email,
    sectorId: data.setor_id,
    role: data.role,
  };
};

export const updateUser = async (id: number, userData: Partial<UserFormData>): Promise<User | null> => {
  const { data, error } = await supabase
    .from('usuarios')
    .update({
      nome: userData.name,
      email: userData.email,
      setor_id: userData.sectorId,
      role: userData.role,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating user ${id}:`, error);
    throw error;
  }

  return {
    id: data.id,
    name: data.nome,
    email: data.email,
    sectorId: data.setor_id,
    role: data.role,
  };
};

export const deleteUser = async (id: number): Promise<boolean> => {
  // Get user email first
  const { data: userData, error: fetchError } = await supabase
    .from('usuarios')
    .select('email')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error(`Error fetching user ${id} for deletion:`, fetchError);
    throw fetchError;
  }

  // Delete from usuarios table
  const { error: profileError } = await supabase
    .from('usuarios')
    .delete()
    .eq('id', id);

  if (profileError) {
    console.error(`Error deleting user profile ${id}:`, profileError);
    throw profileError;
  }

  // Delete auth user
  const { error: authError } = await supabase.auth.admin.deleteUser(userData.email);

  if (authError) {
    console.error(`Error deleting auth user ${userData.email}:`, authError);
    throw authError;
  }

  return true;
};
