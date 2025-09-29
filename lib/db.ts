import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

// Ensure this code only runs on the server side
if (typeof window !== 'undefined') {
  throw new Error('This module can only be used on the server side');
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create a SQL connection
const sql = neon(process.env.DATABASE_URL);

// Create a drizzle database instance using neon-http
export const db = drizzle(sql);

// Export the raw SQL connection for direct queries if needed
export { sql };