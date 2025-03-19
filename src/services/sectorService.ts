import { Sector } from '@/lib/types';
import { sectorsApi } from '@/lib/api';

// Fallback mock data for when API calls fail
const mockSectors: Sector[] = [
  { id: 1, name: 'TI' },
  { id: 2, name: 'Recursos Humanos' },
  { id: 3, name: 'Financeiro' },
  { id: 4, name: 'Marketing' },
  { id: 5, name: 'Operações' },
];

export const getSectors = async (): Promise<Sector[]> => {
  try {
    const response = await sectorsApi.getAll();
    
    // Map from backend format to our app format
    return response.map((sector: any) => ({
      id: sector.id,
      name: sector.nome,
    }));
  } catch (error) {
    console.error('Error fetching sectors:', error);
    console.log('Using mock sector data instead');
    return [...mockSectors];
  }
};

export const getSectorById = async (id: number): Promise<Sector | null> => {
  try {
    // API doesn't have endpoint to get sector by ID, so we get all and filter
    const sectors = await getSectors();
    return sectors.find(s => s.id === id) || null;
  } catch (error) {
    console.error(`Error fetching sector ${id}:`, error);
    
    // Return mock data when API call fails
    const sector = mockSectors.find(s => s.id === id);
    return sector || null;
  }
};

export const createSector = async (name: string): Promise<Sector | null> => {
  try {
    const response = await sectorsApi.create(name);
    
    return {
      id: response.id,
      name: response.nome,
    };
  } catch (error) {
    console.error('Error creating sector:', error);
    throw error;
  }
};

export const updateSector = async (id: number, name: string): Promise<Sector | null> => {
  try {
    // API doesn't have endpoint to update sector, so we delete and recreate
    await sectorsApi.delete(id);
    const newSector = await createSector(name);
    
    if (newSector) {
      return {
        id: newSector.id,
        name: newSector.name,
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error updating sector ${id}:`, error);
    throw error;
  }
};

export const deleteSector = async (id: number): Promise<boolean> => {
  try {
    await sectorsApi.delete(id);
    return true;
  } catch (error) {
    console.error(`Error deleting sector ${id}:`, error);
    throw error;
  }
};
