
import { query } from '@/lib/database';
import { Sector } from '@/lib/types';

// Mock data for when database connection fails
const mockSectors: Sector[] = [
  { id: 1, name: 'TI' },
  { id: 2, name: 'Recursos Humanos' },
  { id: 3, name: 'Financeiro' },
  { id: 4, name: 'Marketing' },
  { id: 5, name: 'Operações' },
];

export const getSectors = async (): Promise<Sector[]> => {
  try {
    const result = await query('SELECT id, nome as name FROM setores');
    
    return result.rows.map(sector => ({
      id: sector.id,
      name: sector.name,
    }));
  } catch (error) {
    console.error('Error fetching sectors:', error);
    console.log('Using mock sector data instead');
    return [...mockSectors];
  }
};

export const getSectorById = async (id: number): Promise<Sector | null> => {
  try {
    const result = await query('SELECT id, nome as name FROM setores WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return {
      id: result.rows[0].id,
      name: result.rows[0].name,
    };
  } catch (error) {
    console.error(`Error fetching sector ${id}:`, error);
    
    // Return mock data when database query fails
    const sector = mockSectors.find(s => s.id === id);
    return sector || null;
  }
};

export const createSector = async (name: string): Promise<Sector | null> => {
  try {
    const result = await query(
      'INSERT INTO setores (nome) VALUES ($1) RETURNING id, nome as name',
      [name]
    );
    
    return {
      id: result.rows[0].id,
      name: result.rows[0].name,
    };
  } catch (error) {
    console.error('Error creating sector:', error);
    throw error;
  }
};

export const updateSector = async (id: number, name: string): Promise<Sector | null> => {
  try {
    const result = await query(
      'UPDATE setores SET nome = $1 WHERE id = $2 RETURNING id, nome as name',
      [name, id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return {
      id: result.rows[0].id,
      name: result.rows[0].name,
    };
  } catch (error) {
    console.error(`Error updating sector ${id}:`, error);
    throw error;
  }
};

export const deleteSector = async (id: number): Promise<boolean> => {
  try {
    const result = await query('DELETE FROM setores WHERE id = $1', [id]);
    return result.rowCount > 0;
  } catch (error) {
    console.error(`Error deleting sector ${id}:`, error);
    throw error;
  }
};
