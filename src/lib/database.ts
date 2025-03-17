
// Mock implementation of database connection for browser environment
import { User, Sector, Deadline, Ticket, TicketStatus } from './types';

// Mock query function that simulates PostgreSQL queries
export const query = async (text: string, params?: any[]) => {
  console.log('Mock query:', { text, params });
  
  // This is a mock implementation - in a real app, this would connect to a backend API
  if (text.includes('SELECT id, nome as name FROM setores')) {
    return {
      rows: [
        { id: 1, name: 'TI' },
        { id: 2, name: 'Recursos Humanos' },
        { id: 3, name: 'Financeiro' },
        { id: 4, name: 'Marketing' },
        { id: 5, name: 'Operações' },
      ],
      rowCount: 5
    };
  }
  
  if (text.includes('SELECT id, titulo as title, setor_id as "sectorId", prazo as deadline FROM prazos')) {
    return {
      rows: [
        { id: 1, title: 'Urgente', sectorId: 1, deadline: 'PT3600S' },
        { id: 2, title: 'Alta Prioridade', sectorId: 1, deadline: 'PT14400S' },
        { id: 3, title: 'Normal', sectorId: 2, deadline: 'PT86400S' },
        { id: 4, title: 'Baixa Prioridade', sectorId: 3, deadline: 'PT259200S' },
      ],
      rowCount: 4
    };
  }
  
  if (text.includes('usuarios') && text.includes('senha_hash')) {
    // This is for authentication
    return {
      rows: [
        { 
          id: 1, 
          name: 'Admin User', 
          email: 'admin@example.com', 
          sectorId: 1, 
          role: 'ADMIN',
          senha_hash: '$2a$10$zXEv/QHUzHR8Tion1rVaJ.j0aqjkMjnIfK8XNwpwwWKJWNh6YhBLa' // hash for 'admin123'
        },
        { 
          id: 2, 
          name: 'Cliente User', 
          email: 'cliente@example.com', 
          sectorId: 2, 
          role: 'CLIENT',
          senha_hash: '$2a$10$RjJR4QHH2h/yd0vPw2bvmuuRR1yH1iLAwHHsL0B7HAYRvyihfkSYW' // hash for 'cliente123'
        }
      ],
      rowCount: 2
    };
  }
  
  if (text.includes('usuarios') && !text.includes('senha_hash')) {
    // User listing without password hashes
    return {
      rows: [
        { id: 1, name: 'Admin User', email: 'admin@example.com', sectorId: 1, role: 'ADMIN' },
        { id: 2, name: 'Cliente User', email: 'cliente@example.com', sectorId: 2, role: 'CLIENT' }
      ],
      rowCount: 2
    };
  }
  
  if (text.includes('INSERT INTO') || text.includes('UPDATE') || text.includes('DELETE')) {
    // Simulate a successful write operation
    return {
      rows: [{ id: 999, ...params?.reduce((acc, val, idx) => ({ ...acc, [`param${idx}`]: val }), {}) }],
      rowCount: 1
    };
  }
  
  // Default fallback
  return {
    rows: [],
    rowCount: 0
  };
};

// Mock connection pool
const pool = {
  query: (text: string, params: any[], callback?: any) => {
    if (callback) {
      callback(null, { rows: [{ now: new Date().toISOString() }] });
      return;
    }
    return Promise.resolve({ rows: [{ now: new Date().toISOString() }] });
  },
  end: () => Promise.resolve()
};

// Log a successful mock connection
console.log('Using mock database connection for browser environment');

export const closePool = async () => {
  console.log('Mock database connection closed');
};

export default pool;
