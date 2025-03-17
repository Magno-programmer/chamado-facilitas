
import { supabase } from '@/lib/supabase';
import { Deadline } from '@/lib/types';

export const getDeadlines = async (): Promise<Deadline[]> => {
  const { data, error } = await supabase
    .from('prazos')
    .select('*');

  if (error) {
    console.error('Error fetching deadlines:', error);
    throw error;
  }

  return data.map(deadline => ({
    id: deadline.id,
    title: deadline.titulo,
    sectorId: deadline.setor_id,
    deadline: deadline.prazo,
  }));
};

export const getDeadlinesBySector = async (sectorId: number): Promise<Deadline[]> => {
  const { data, error } = await supabase
    .from('prazos')
    .select('*')
    .eq('setor_id', sectorId);

  if (error) {
    console.error(`Error fetching deadlines for sector ${sectorId}:`, error);
    throw error;
  }

  return data.map(deadline => ({
    id: deadline.id,
    title: deadline.titulo,
    sectorId: deadline.setor_id,
    deadline: deadline.prazo,
  }));
};

export const createDeadline = async (deadlineData: Omit<Deadline, 'id'>): Promise<Deadline | null> => {
  const { data, error } = await supabase
    .from('prazos')
    .insert({
      titulo: deadlineData.title,
      setor_id: deadlineData.sectorId,
      prazo: deadlineData.deadline,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating deadline:', error);
    throw error;
  }

  return {
    id: data.id,
    title: data.titulo,
    sectorId: data.setor_id,
    deadline: data.prazo,
  };
};

export const updateDeadline = async (id: number, deadlineData: Partial<Deadline>): Promise<Deadline | null> => {
  const { data, error } = await supabase
    .from('prazos')
    .update({
      titulo: deadlineData.title,
      setor_id: deadlineData.sectorId,
      prazo: deadlineData.deadline,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating deadline ${id}:`, error);
    throw error;
  }

  return {
    id: data.id,
    title: data.titulo,
    sectorId: data.setor_id,
    deadline: data.prazo,
  };
};

export const deleteDeadline = async (id: number): Promise<boolean> => {
  const { error } = await supabase
    .from('prazos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting deadline ${id}:`, error);
    throw error;
  }

  return true;
};
