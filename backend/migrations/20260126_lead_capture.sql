-- Lead Capture System Migration
-- This stores emails from the "Get Free Template" form on the landing page

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    source TEXT DEFAULT 'landing_page_template',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    template_sent BOOLEAN DEFAULT FALSE,
    template_sent_at TIMESTAMPTZ,
    notes TEXT
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to insert leads (for the form)
CREATE POLICY "Allow public to insert leads"
    ON leads
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Policy: Only authenticated admins can view leads
CREATE POLICY "Only admins can view leads"
    ON leads
    FOR SELECT
    TO authenticated
    USING (
        -- You can add admin check logic here later
        -- For now, any authenticated user can view
        true
    );

-- Add comment
COMMENT ON TABLE leads IS 'Stores email leads from landing page template download form';
