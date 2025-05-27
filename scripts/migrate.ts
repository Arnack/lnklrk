import { readFileSync } from 'fs';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
const envConfig = dotenv.config({ path: '.env.local' });

if (!envConfig.parsed?.DATABASE_URL) {
  throw new Error('DATABASE_URL not found in .env.local');
}

// Create SQL client
const sql = neon(envConfig.parsed.DATABASE_URL);

async function migrate() {
  try {
    // Read the migration SQL file
    const migrationSQL = readFileSync(join(process.cwd(), 'lib', 'migrations.sql'), 'utf-8');

    // Execute the migration
    await sql.query(migrationSQL);
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate(); 