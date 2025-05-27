import * as dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

// Load environment variables from .env.local
const envConfig = dotenv.config({ path: '.env.local' });

if (!envConfig.parsed?.DATABASE_URL) {
  throw new Error('DATABASE_URL not found in .env.local');
}

// Create SQL client
const sql = neon(envConfig.parsed.DATABASE_URL);

async function createTestUser() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Create user directly with SQL
    const result = await sql`
      INSERT INTO users (email, password, name) 
      VALUES ('test@example.com', ${hashedPassword}, 'Test User') 
      RETURNING id, email, name
    `;
    
    const user = result[0];
    
    console.log('Test user created successfully:');
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('ID:', user.id);
    console.log('\nYou can now login with:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Failed to create test user:', error);
    if (error instanceof Error && error.message.includes('unique')) {
      console.log('\nNote: User with this email already exists. You can still use the login credentials above.');
    }
    process.exit(1);
  }
}

createTestUser(); 