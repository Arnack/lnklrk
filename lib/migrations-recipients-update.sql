-- Migration to update mass_email_recipients table with new fields
-- Add type field and platform boolean fields

-- Add new columns to mass_email_recipients table
ALTER TABLE mass_email_recipients 
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('brand', 'creator', 'creator_agency', 'brand_agency')),
ADD COLUMN IF NOT EXISTS tiktok BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS instagram BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS youtube BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ugc BOOLEAN DEFAULT FALSE;

-- Add comments for documentation
COMMENT ON COLUMN mass_email_recipients.type IS 'Type of recipient: brand, creator, creator_agency, or brand_agency';
COMMENT ON COLUMN mass_email_recipients.tiktok IS 'Whether recipient is active on TikTok';
COMMENT ON COLUMN mass_email_recipients.instagram IS 'Whether recipient is active on Instagram';
COMMENT ON COLUMN mass_email_recipients.youtube IS 'Whether recipient is active on YouTube';
COMMENT ON COLUMN mass_email_recipients.ugc IS 'Whether recipient creates UGC content';

-- Create index for type field for better performance
CREATE INDEX IF NOT EXISTS idx_mass_email_recipients_type ON mass_email_recipients(type);
