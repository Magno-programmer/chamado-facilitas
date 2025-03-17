
import { query } from '@/lib/database';
import { User, UserFormData } from '@/lib/types';
import bcrypt from 'bcryptjs';

export const getUsers = async (): Promise<User[]> => {
  try {
    const result = await query(
      'SELECT id, nome as name, email, setor_id as "sectorId", role FROM usuarios'
    );
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserById = async (id: number): Promise<User | null> => {
  try {
    const result = await query(
      'SELECT id, nome as name, email, setor_id as "sectorId", role FROM usuarios WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    return null;
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const result = await query(
      'SELECT id, nome as name, email, setor_id as "sectorId", role FROM usuarios WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error(`Error fetching user with email ${email}:`, error);
    return null;
  }
};

export const createUser = async (userData: UserFormData): Promise<User | null> => {
  try {
    // Hash the password before storing it
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password || 'changeme123', salt);
    
    const result = await query(
      'INSERT INTO usuarios (nome, email, setor_id, role, senha_hash) VALUES ($1, $2, $3, $4, $5) RETURNING id, nome as name, email, setor_id as "sectorId", role',
      [userData.name, userData.email, userData.sectorId, userData.role, hashedPassword]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (id: number, userData: Partial<UserFormData>): Promise<User | null> => {
  try {
    // Build dynamic query based on provided fields
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    if (userData.name !== undefined) {
      fields.push(`nome = $${paramCount}`);
      values.push(userData.name);
      paramCount++;
    }
    
    if (userData.email !== undefined) {
      fields.push(`email = $${paramCount}`);
      values.push(userData.email);
      paramCount++;
    }
    
    if (userData.sectorId !== undefined) {
      fields.push(`setor_id = $${paramCount}`);
      values.push(userData.sectorId);
      paramCount++;
    }
    
    if (userData.role !== undefined) {
      fields.push(`role = $${paramCount}`);
      values.push(userData.role);
      paramCount++;
    }
    
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      fields.push(`senha_hash = $${paramCount}`);
      values.push(hashedPassword);
      paramCount++;
    }
    
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }
    
    values.push(id);
    
    const result = await query(
      `UPDATE usuarios SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING id, nome as name, email, setor_id as "sectorId", role`,
      values
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    throw error;
  }
};

export const deleteUser = async (id: number): Promise<boolean> => {
  try {
    const result = await query('DELETE FROM usuarios WHERE id = $1', [id]);
    return result.rowCount > 0;
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    throw error;
  }
};

export const verifyUserCredentials = async (email: string, password: string): Promise<User | null> => {
  try {
    const result = await query(
      'SELECT id, nome as name, email, setor_id as "sectorId", role, senha_hash FROM usuarios WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.senha_hash);
    
    if (!isPasswordValid) {
      return null;
    }
    
    // Don't return the password hash
    delete user.senha_hash;
    
    return user;
  } catch (error) {
    console.error('Error verifying user credentials:', error);
    return null;
  }
};
