
// Sector and Deadline types
export interface Sector {
  id: number;
  name: string;
}

export interface Deadline {
  id: number;
  title: string;
  sectorId: number;
  deadline: string; // ISO duration string
}
