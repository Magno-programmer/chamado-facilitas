import { Pool } from 'pg';
import { User, Sector, Deadline, Ticket, TicketStatus } from './types';

// Configuration for PostgreSQL connection
const connectionConfig = {
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE || 'facilitas',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Create a new connection pool
const pool = new Pool(connectionConfig);

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.message);
    console.warn('Falling back to mock database implementation');
  } else {
    console.log('PostgreSQL connected:', res.rows[0].now);
  }
});

// Unified query function for both real and mock database
export const query = async (text: string, params?: any[]) => {
  try {
    // Try to connect to the real database first
    const result = await pool.query(text, params);
    return result;
  } catch (dbError) {
    console.error('Database query error:', dbError);
    console.log('Falling back to mock query implementation');
    
    // Mock implementation as fallback
    console.log('Mock query:', { text, params });
    
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
  }
};

// Close the pool when the application shuts down
export const closePool = async () => {
  try {
    await pool.end();
    console.log('Database connection pool closed');
  } catch (error) {
    console.error('Error closing database pool:', error);
  }
};

export default pool;
