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

-- Create reminders table
CREATE TABLE IF NOT EXISTS "reminders" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL REFERENCES "users"("id"),
    "title" text NOT NULL,
    "description" text,
    "expiration_date" timestamp NOT NULL,
    "is_expired" boolean DEFAULT false,
    "is_completed" boolean DEFAULT false,
    "type" text NOT NULL DEFAULT 'general',
    "influencer_id" uuid REFERENCES "influencers"("id") ON DELETE CASCADE,
    "campaign_id" uuid REFERENCES "campaigns"("id") ON DELETE CASCADE,
    "priority" text NOT NULL DEFAULT 'medium',
    "metadata" jsonb,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_reminders_user_id" ON "reminders"("user_id");
CREATE INDEX IF NOT EXISTS "idx_reminders_expiration_date" ON "reminders"("expiration_date");
CREATE INDEX IF NOT EXISTS "idx_reminders_is_expired" ON "reminders"("is_expired");
CREATE INDEX IF NOT EXISTS "idx_reminders_type" ON "reminders"("type");
CREATE INDEX IF NOT EXISTS "idx_reminders_influencer_id" ON "reminders"("influencer_id");
CREATE INDEX IF NOT EXISTS "idx_reminders_campaign_id" ON "reminders"("campaign_id"); 