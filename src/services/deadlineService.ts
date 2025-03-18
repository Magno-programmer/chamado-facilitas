import { Deadline } from '@/lib/types';
import { deadlinesApi } from '@/lib/api';

// Fallback mock data for when API calls fail
const mockDeadlines: Deadline[] = [
  { id: 1, title: 'Urgente', sectorId: 1, deadline: 'PT3600S' },  // 1 hora
  { id: 2, title: 'Alta Prioridade', sectorId: 1, deadline: 'PT14400S' },  // 4 horas
  { id: 3, title: 'Normal', sectorId: 2, deadline: 'PT86400S' },  // 24 horas
  { id: 4, title: 'Baixa Prioridade', sectorId: 3, deadline: 'PT259200S' },  // 3 dias
];

export const getDeadlines = async (): Promise<Deadline[]> => {
  try {
    const response = await deadlinesApi.getAll();
    
    // Map from backend format to our app format
    return response.map((deadline: any) => ({
      id: deadline.id,
      title: deadline.titulo,
      sectorId: deadline.setor_id,
      deadline: convertMinutesToIsoDuration(deadline.prazo),
    }));
  } catch (error) {
    console.error('Error fetching deadlines:', error);
    console.log('Using mock deadline data instead');
    return [...mockDeadlines];
  }
};

export const getDeadlinesBySector = async (sectorId: number): Promise<Deadline[]> => {
  try {
    // API doesn't have endpoint to get deadlines by sector, so we get all and filter
    const deadlines = await getDeadlines();
    return deadlines.filter(d => d.sectorId === sectorId);
  } catch (error) {
    console.error(`Error fetching deadlines for sector ${sectorId}:`, error);
    
    // Return mock data filtered by sector
    return mockDeadlines.filter(d => d.sectorId === sectorId);
  }
};

export const createDeadline = async (deadlineData: Omit<Deadline, 'id'>): Promise<Deadline | null> => {
  try {
    // Convert from ISO duration format to minutes for backend
    const minutes = parseIsoDurationToMinutes(deadlineData.deadline);
    
    const backendData = {
      titulo: deadlineData.title,
      setor_id: deadlineData.sectorId,
      prazo: String(minutes),
    };
    
    const response = await deadlinesApi.create(backendData);
    
    return {
      id: response.id,
      title: response.titulo,
      sectorId: response.setor_id,
      deadline: convertMinutesToIsoDuration(response.prazo),
    };
  } catch (error) {
    console.error('Error creating deadline:', error);
    throw error;
  }
};

export const updateDeadline = async (id: number, deadlineData: Partial<Deadline>): Promise<Deadline | null> => {
  try {
    // The API doesn't have an update endpoint for deadlines
    // We'll have to delete and recreate
    await deleteSectore(id);
    
    if (!deadlineData.title || !deadlineData.sectorId || !deadlineData.deadline) {
      // We need the complete data to recreate
      const existingDeadlines = await getDeadlines();
      const existingDeadline = existingDeadlines.find(d => d.id === id);
      
      if (!existingDeadline) {
        throw new Error('Deadline not found');
      }
      
      // Merge existing data with updated data
      const updatedData = {
        title: deadlineData.title || existingDeadline.title,
        sectorId: deadlineData.sectorId || existingDeadline.sectorId,
        deadline: deadlineData.deadline || existingDeadline.deadline,
      };
      
      return createDeadline(updatedData);
    }
    
    return createDeadline(deadlineData as Omit<Deadline, 'id'>);
  } catch (error) {
    console.error(`Error updating deadline ${id}:`, error);
    throw error;
  }
};

export const deleteSectore = async (id: number): Promise<boolean> => {
  try {
    await deadlinesApi.delete(id);
    return true;
  } catch (error) {
    console.error(`Error deleting deadline ${id}:`, error);
    throw error;
  }
};

// Helper to delete deadlines
export const deleteDeadline = async (id: number): Promise<boolean> => {
  return deleteSectore(id);
};

// Helper function to convert minutes to ISO 8601 duration format
const convertMinutesToIsoDuration = (minutes: string): string => {
  const mins = parseInt(minutes);
  
  if (isNaN(mins)) {
    return 'PT60M'; // Default 60 minutes
  }
  
  if (mins >= 1440) {
    // Convert to days if >= 24 hours
    const days = Math.floor(mins / 1440);
    return `P${days}D`;
  } else if (mins >= 60) {
    // Convert to hours if >= 60 minutes
    const hours = Math.floor(mins / 60);
    return `PT${hours}H`;
  } else {
    // Keep as minutes
    return `PT${mins}M`;
  }
};

// Helper function to parse ISO 8601 duration to minutes
const parseIsoDurationToMinutes = (isoDuration: string): number => {
  const minuteMatch = isoDuration.match(/PT(\d+)M/);
  const hourMatch = isoDuration.match(/PT(\d+)H/);
  const dayMatch = isoDuration.match(/P(\d+)D/);
  
  if (minuteMatch) {
    return parseInt(minuteMatch[1]);
  } else if (hourMatch) {
    return parseInt(hourMatch[1]) * 60;
  } else if (dayMatch) {
    return parseInt(dayMatch[1]) * 1440;
  }
  
  return 60; // Default 60 minutes
};
