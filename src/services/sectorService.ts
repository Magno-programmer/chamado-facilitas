
import { supabase } from '@/lib/supabase';
import { Sector } from '@/lib/types';

// Mock data for when Supabase is not connected
const mockSectors: Sector[] = [
  { id: 1, name: 'TI' },
  { id: 2, name: 'Recursos Humanos' },
  { id: 3, name: 'Financeiro' },
  { id: 4, name: 'Marketing' },
  { id: 5, name: 'Operações' },
];

export const getSectors = async (): Promise<Sector[]> => {
  if (supabase) {
    const { data, error } = await supabase
      .from('setores')
      .select('*');

    if (error) {
      console.error('Error fetching sectors:', error);
      throw error;
    }

    return data.map(sector => ({
      id: sector.id,
      name: sector.nome,
    }));
  } else {
    // Return mock data when Supabase is not available
    console.log('Using mock sector data');
    return [...mockSectors];
  }
};

export const getSectorById = async (id: number): Promise<Sector | null> => {
  if (supabase) {
    const { data, error } = await supabase
      .from('setores')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching sector ${id}:`, error);
      return null;
    }

    return {
      id: data.id,
      name: data.nome,
    };
  } else {
    // Return mock data when Supabase is not available
    const sector = mockSectors.find(s => s.id === id);
    return sector || null;
  }
};

export const createSector = async (name: string): Promise<Sector | null> => {
  if (supabase) {
    const { data, error } = await supabase
      .from('setores')
      .insert({ nome: name })
      .select()
      .single();

    if (error) {
      console.error('Error creating sector:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.nome,
    };
  } else {
    // Simulate creating a sector with mock data
    const newId = Math.max(...mockSectors.map(s => s.id)) + 1;
    const newSector = { id: newId, name };
    mockSectors.push(newSector);
    return newSector;
  }
};

export const updateSector = async (id: number, name: string): Promise<Sector | null> => {
  if (supabase) {
    const { data, error } = await supabase
      .from('setores')
      .update({ nome: name })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating sector ${id}:`, error);
      throw error;
    }

    return {
      id: data.id,
      name: data.nome,
    };
  } else {
    // Simulate updating a sector with mock data
    const index = mockSectors.findIndex(s => s.id === id);
    if (index >= 0) {
      mockSectors[index].name = name;
      return mockSectors[index];
    }
    return null;
  }
};

export const deleteSector = async (id: number): Promise<boolean> => {
  if (supabase) {
    const { error } = await supabase
      .from('setores')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting sector ${id}:`, error);
      throw error;
    }

    return true;
  } else {
    // Simulate deleting a sector with mock data
    const index = mockSectors.findIndex(s => s.id === id);
    if (index >= 0) {
      mockSectors.splice(index, 1);
      return true;
    }
    return false;
  }
};
