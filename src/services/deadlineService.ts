
import { query } from '@/lib/database';
import { Deadline } from '@/lib/types';

// Mock data for when database connection fails
const mockDeadlines: Deadline[] = [
  { id: 1, title: 'Urgente', sectorId: 1, deadline: 'PT3600S' },  // 1 hora
  { id: 2, title: 'Alta Prioridade', sectorId: 1, deadline: 'PT14400S' },  // 4 horas
  { id: 3, title: 'Normal', sectorId: 2, deadline: 'PT86400S' },  // 24 horas
  { id: 4, title: 'Baixa Prioridade', sectorId: 3, deadline: 'PT259200S' },  // 3 dias
];

export const getDeadlines = async (): Promise<Deadline[]> => {
  try {
    const result = await query(
      'SELECT id, titulo as title, setor_id as "sectorId", prazo as deadline FROM prazos'
    );
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching deadlines:', error);
    console.log('Using mock deadline data instead');
    return [...mockDeadlines];
  }
};

export const getDeadlinesBySector = async (sectorId: number): Promise<Deadline[]> => {
  try {
    const result = await query(
      'SELECT id, titulo as title, setor_id as "sectorId", prazo as deadline FROM prazos WHERE setor_id = $1',
      [sectorId]
    );
    
    return result.rows;
  } catch (error) {
    console.error(`Error fetching deadlines for sector ${sectorId}:`, error);
    
    // Return mock data filtered by sector
    return mockDeadlines.filter(d => d.sectorId === sectorId);
  }
};

export const createDeadline = async (deadlineData: Omit<Deadline, 'id'>): Promise<Deadline | null> => {
  try {
    const result = await query(
      'INSERT INTO prazos (titulo, setor_id, prazo) VALUES ($1, $2, $3) RETURNING id, titulo as title, setor_id as "sectorId", prazo as deadline',
      [deadlineData.title, deadlineData.sectorId, deadlineData.deadline]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating deadline:', error);
    throw error;
  }
};

export const updateDeadline = async (id: number, deadlineData: Partial<Deadline>): Promise<Deadline | null> => {
  try {
    // Build dynamic query based on provided fields
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    if (deadlineData.title !== undefined) {
      fields.push(`titulo = $${paramCount}`);
      values.push(deadlineData.title);
      paramCount++;
    }
    
    if (deadlineData.sectorId !== undefined) {
      fields.push(`setor_id = $${paramCount}`);
      values.push(deadlineData.sectorId);
      paramCount++;
    }
    
    if (deadlineData.deadline !== undefined) {
      fields.push(`prazo = $${paramCount}`);
      values.push(deadlineData.deadline);
      paramCount++;
    }
    
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }
    
    values.push(id);
    
    const result = await query(
      `UPDATE prazos SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING id, titulo as title, setor_id as "sectorId", prazo as deadline`,
      values
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error(`Error updating deadline ${id}:`, error);
    throw error;
  }
};

export const deleteDeadline = async (id: number): Promise<boolean> => {
  try {
    const result = await query('DELETE FROM prazos WHERE id = $1', [id]);
    return result.rowCount > 0;
  } catch (error) {
    console.error(`Error deleting deadline ${id}:`, error);
    throw error;
  }
};
