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
    // Execute SQL statements one by one
    console.log('Creating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        google_client_id TEXT,
        google_api_key TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Adding Gmail API columns to users table if they don\'t exist...');
    await sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS google_client_id TEXT
    `;
    await sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS google_api_key TEXT
    `;

    console.log('Creating influencers table...');
    await sql`
      CREATE TABLE IF NOT EXISTS influencers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        handle TEXT NOT NULL,
        profile_link TEXT,
        followers INTEGER DEFAULT 0,
        email TEXT,
        rate INTEGER DEFAULT 0,
        categories TEXT[],
        tags TEXT[],
        followers_age TEXT,
        followers_sex TEXT,
        engagement_rate INTEGER DEFAULT 0,
        platform TEXT DEFAULT 'Instagram',
        brands_worked_with TEXT[],
        notes JSONB,
        files JSONB,
        messages JSONB,
        campaigns JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Creating campaigns table...');
    await sql`
      CREATE TABLE IF NOT EXISTS campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        description TEXT,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        budget NUMERIC(10,2),
        status TEXT NOT NULL DEFAULT 'draft',
        brief_url TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Creating campaign_influencers table...');
    await sql`
      CREATE TABLE IF NOT EXISTS campaign_influencers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'contacted',
        rate NUMERIC(10,2),
        performance_rating INTEGER,
        deliverables JSONB,
        performance JSONB,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(campaign_id, influencer_id)
      )
    `;

    console.log('Adding tags column to existing table if it doesn\'t exist...');
    await sql`
      ALTER TABLE influencers ADD COLUMN IF NOT EXISTS tags TEXT[]
    `;
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate(); 