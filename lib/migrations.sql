CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
);

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
);

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
);

-- Add tags column to existing table if it doesn't exist
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS tags TEXT[]; 