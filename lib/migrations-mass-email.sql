-- Migration for Mass Email functionality
-- Add mass email campaigns and recipients tables

-- Create mass_email_campaigns table
CREATE TABLE IF NOT EXISTS mass_email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    template_id TEXT,
    template_variables JSONB,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent', 'failed')),
    stats JSONB,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create mass_email_recipients table
CREATE TABLE IF NOT EXISTS mass_email_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES mass_email_campaigns(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    platform TEXT,
    followers INTEGER,
    category TEXT,
    tags TEXT[],
    custom_fields JSONB,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    error_message TEXT,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mass_email_campaigns_user_id ON mass_email_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_mass_email_campaigns_status ON mass_email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_mass_email_campaigns_created_at ON mass_email_campaigns(created_at);

CREATE INDEX IF NOT EXISTS idx_mass_email_recipients_campaign_id ON mass_email_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_mass_email_recipients_status ON mass_email_recipients(status);
CREATE INDEX IF NOT EXISTS idx_mass_email_recipients_email ON mass_email_recipients(email);

-- Add comments for documentation
COMMENT ON TABLE mass_email_campaigns IS 'Stores mass email campaigns created by users';
COMMENT ON TABLE mass_email_recipients IS 'Stores recipients for mass email campaigns';

COMMENT ON COLUMN mass_email_campaigns.template_id IS 'Reference to email template used for this campaign';
COMMENT ON COLUMN mass_email_campaigns.template_variables IS 'Variables used to personalize the template';
COMMENT ON COLUMN mass_email_campaigns.stats IS 'Campaign statistics (total, sent, failed, pending)';

COMMENT ON COLUMN mass_email_recipients.custom_fields IS 'Additional personalized fields for each recipient';
COMMENT ON COLUMN mass_email_recipients.error_message IS 'Error message if email sending failed';
