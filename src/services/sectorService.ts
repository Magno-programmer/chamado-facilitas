
import { supabase } from '@/lib/supabase';
import { Sector } from '@/lib/types';

export const getSectors = async (): Promise<Sector[]> => {
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
};

export const getSectorById = async (id: number): Promise<Sector | null> => {
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
};

export const createSector = async (name: string): Promise<Sector | null> => {
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
};

export const updateSector = async (id: number, name: string): Promise<Sector | null> => {
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
};

export const deleteSector = async (id: number): Promise<boolean> => {
  const { error } = await supabase
    .from('setores')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting sector ${id}:`, error);
    throw error;
  }

  return true;
};
