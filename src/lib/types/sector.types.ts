
// Sector and Deadline types
export interface Sector {
  id: number;
  name: string;
}

export interface Deadline {
  id: number;
  titulo: string;  // Changed from 'title' to match DB
  setor_id?: number | null;  // Changed from 'sectorId' to match DB
  prazo: string;  // Changed from 'deadline' to match DB
  setor?: {
    id: number;
    nome: string;
  };
}
