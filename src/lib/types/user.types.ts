
// User-related types
export type UserRole = 'ADMIN' | 'CLIENT' | 'Gerente';

export interface User {
  id: string; // Changed to string for compatibility with Supabase
  name: string;
  email: string;
  sectorId: number;
  role: UserRole;
}
