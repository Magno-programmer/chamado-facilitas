
import { Pool } from 'pg';

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
  } else {
    console.log('PostgreSQL connected:', res.rows[0].now);
  }
});

// Query function that connects to the real database
export const query = async (text: string, params?: any[]) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (dbError) {
    console.error('Database query error:', dbError);
    throw dbError; // Re-throw the error to be handled by the caller
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
