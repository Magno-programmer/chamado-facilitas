import { Sector } from '@/lib/types';
import { sectorsApi } from '@/lib/api';

export const getSectors = async (): Promise<Sector[]> => {
  try {
    const response = await sectorsApi.getAll();
    
    if (!response || !Array.isArray(response)) {
      console.error('Resposta inválida da API de setores:', response);
      return [];
    }
    
    // Map from backend format to our app format
    return response.map((sector: any) => ({
      id: sector.id,
      name: sector.nome,
    }));
  } catch (error) {
    console.error('Erro ao buscar setores:', error);
    return [];
  }
};

export const getSectorById = async (id: number): Promise<Sector | null> => {
  try {
    // API doesn't have endpoint to get sector by ID, so we get all and filter
    const sectors = await getSectors();
    return sectors.find(s => s.id === id) || null;
  } catch (error) {
    console.error(`Erro ao buscar setor ${id}:`, error);
    return null;
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
