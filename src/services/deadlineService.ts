
import { supabase } from '@/lib/supabase';
import { Deadline } from '@/lib/types';

// Mock data for when Supabase is not connected
const mockDeadlines: Deadline[] = [
  { id: 1, title: 'Urgente', sectorId: 1, deadline: 'PT3600S' },  // 1 hora
  { id: 2, title: 'Alta Prioridade', sectorId: 1, deadline: 'PT14400S' },  // 4 horas
  { id: 3, title: 'Normal', sectorId: 2, deadline: 'PT86400S' },  // 24 horas
  { id: 4, title: 'Baixa Prioridade', sectorId: 3, deadline: 'PT259200S' },  // 3 dias
];

export const getDeadlines = async (): Promise<Deadline[]> => {
  if (supabase) {
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
  } else {
    // Return mock data when Supabase is not available
    console.log('Using mock deadline data');
    return [...mockDeadlines];
  }
};

export const getDeadlinesBySector = async (sectorId: number): Promise<Deadline[]> => {
  if (supabase) {
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
  } else {
    // Return mock data filtered by sector
    return mockDeadlines.filter(d => d.sectorId === sectorId);
  }
};

export const createDeadline = async (deadlineData: Omit<Deadline, 'id'>): Promise<Deadline | null> => {
  if (supabase) {
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
  } else {
    // Simulate creating a deadline with mock data
    const newId = Math.max(...mockDeadlines.map(d => d.id)) + 1;
    const newDeadline = { id: newId, ...deadlineData };
    mockDeadlines.push(newDeadline);
    return newDeadline;
  }
};

export const updateDeadline = async (id: number, deadlineData: Partial<Deadline>): Promise<Deadline | null> => {
  if (supabase) {
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
  } else {
    // Simulate updating a deadline with mock data
    const index = mockDeadlines.findIndex(d => d.id === id);
    if (index >= 0) {
      mockDeadlines[index] = { 
        ...mockDeadlines[index], 
        ...deadlineData 
      };
      return mockDeadlines[index];
    }
    return null;
  }
};

export const deleteDeadline = async (id: number): Promise<boolean> => {
  if (supabase) {
    const { error } = await supabase
      .from('prazos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting deadline ${id}:`, error);
      throw error;
    }

    return true;
  } else {
    // Simulate deleting a deadline with mock data
    const index = mockDeadlines.findIndex(d => d.id === id);
    if (index >= 0) {
      mockDeadlines.splice(index, 1);
      return true;
    }
    return false;
  }
};
