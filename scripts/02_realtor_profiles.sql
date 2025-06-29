-- Create a table to store realtor profile information
CREATE TABLE IF NOT EXISTS realtor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Optional: if you have user authentication
    realtor_url TEXT NOT NULL UNIQUE,
    realtor_name TEXT,
    agency_name TEXT,
    primary_color TEXT,
    secondary_color TEXT,
    realtor_photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: Add a unique index if not using user_id or if realtor_url should be globally unique
-- CREATE UNIQUE INDEX IF NOT EXISTS realtor_profiles_realtor_url_idx ON realtor_profiles (realtor_url);

-- Enable Row Level Security (RLS)
ALTER TABLE realtor_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for RLS (adjust based on your auth setup)
-- Example: Allow users to manage their own profiles if user_id is used
CREATE POLICY "Allow individual user access to their own profiles"
ON realtor_profiles
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Example: Allow public read if no user_id or for general access (less secure for personal data)
-- CREATE POLICY "Allow public read access"
-- ON realtor_profiles
-- FOR SELECT
-- USING (true);

-- If not using user_id and want it to be simpler for a single-user context or demo:
-- Remove user_id column and related policies, or make user_id nullable.
-- For this example, I'll assume a multi-user context is possible, but you can simplify.

-- Trigger to update "updated_at" timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_realtor_profiles_modtime
BEFORE UPDATE ON realtor_profiles
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

COMMENT ON TABLE realtor_profiles IS 'Stores analyzed profile information for realtors based on their website URL.';
COMMENT ON COLUMN realtor_profiles.realtor_url IS 'The official URL of the realtor or agency website.';
COMMENT ON COLUMN realtor_profiles.realtor_name IS 'Extracted name of the realtor.';
COMMENT ON COLUMN realtor_profiles.agency_name IS 'Extracted name of the real estate agency.';
COMMENT ON COLUMN realtor_profiles.primary_color IS 'Extracted primary theme color (e.g., hex or descriptive).';
COMMENT ON COLUMN realtor_profiles.secondary_color IS 'Extracted secondary theme color (e.g., hex or descriptive).';
COMMENT ON COLUMN realtor_profiles.realtor_photo_url IS 'URL to the realtor\'s profile photo, if found.';
