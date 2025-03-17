
import { Pool } from 'pg';

// Database connection configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sistema_chamado',
  password: '2245',
  port: 5432,
});

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

// Query execution helper
export const query = async (text: string, params?: any[]) => {
  try {
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
};

// Close the pool (call this when shutting down the app)
export const closePool = async () => {
  await pool.end();
};

export default pool;
