import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create a SQL connection
const sql = neon(process.env.DATABASE_URL);

// Create a drizzle database instance
export const db = drizzle(sql);

// Export the raw SQL connection for direct queries if needed
export { sql }; 