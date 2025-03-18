import { User, UserFormData } from '@/lib/types';
import { usersApi } from '@/lib/api';

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await usersApi.getAll();
    
    // Map from backend format to our app format
    return response.map((user: any) => ({
      id: user.id,
      name: user.nome,
      email: user.email,
      sectorId: user.setor_id,
      role: user.role,
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserById = async (id: number): Promise<User | null> => {
  try {
    // API doesn't have endpoint to get user by ID, so we get all and filter
    const users = await getUsers();
    return users.find(user => user.id === id) || null;
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    return null;
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const user = await usersApi.getByEmail(email);
    
    if (!user) {
      return null;
    }
    
    return {
      id: user.id,
      name: user.nome,
      email: user.email,
      sectorId: user.setor_id,
      role: user.role,
    };
  } catch (error) {
    console.error(`Error fetching user with email ${email}:`, error);
    return null;
  }
};

export const createUser = async (userData: UserFormData): Promise<User | null> => {
  try {
    // Convert from our app format to backend format
    const backendData = {
      nome: userData.name,
      email: userData.email,
      setor_id: userData.sectorId,
      senha: userData.password || 'changeme123',
    };
    
    const response = await usersApi.create(backendData);
    
    return {
      id: response.id,
      name: response.nome,
      email: response.email,
      sectorId: response.setor_id,
      role: response.role,
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (id: number, userData: Partial<UserFormData>): Promise<User | null> => {
  try {
    // Convert from our app format to backend format
    const backendData: any = {};
    
    if (userData.name !== undefined) {
      backendData.nome = userData.name;
    }
    
    if (userData.email !== undefined) {
      backendData.email = userData.email;
    }
    
    if (userData.sectorId !== undefined) {
      backendData.setor_id = userData.sectorId;
    }
    
    if (userData.password) {
      backendData.senha = userData.password;
    }
    
    const response = await usersApi.update(id, backendData);
    
    return {
      id: response.id,
      name: response.nome,
      email: response.email,
      sectorId: response.setor_id,
      role: response.role,
    };
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    throw error;
  }
};

export const deleteUser = async (id: number): Promise<boolean> => {
  try {
    await usersApi.delete(id);
    return true;
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    throw error;
  }
};

// Uses the auth service to verify credentials
export const verifyUserCredentials = async (email: string, password: string): Promise<User | null> => {
  try {
    const result = await usersApi.getByEmail(email);
    
    // Note: This would typically be handled by the backend auth endpoint
    // We're using the email lookup as a proxy since we don't have direct access to verify passwords
    
    if (result) {
      return { 
        id: result.id, 
        name: result.nome, 
        email: result.email, 
        sectorId: result.setor_id, 
        role: result.role 
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error verifying credentials:', error);
    return null;
  }
};
