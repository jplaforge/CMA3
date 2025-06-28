-- Add the missing realtor_photo_url column to the realtor_profiles table
ALTER TABLE realtor_profiles 
ADD COLUMN IF NOT EXISTS realtor_photo_url TEXT;

-- Add a comment to document the new column
COMMENT ON COLUMN realtor_profiles.realtor_photo_url IS 'URL to the realtor''s profile photo, if found during website analysis.';

-- Update the trigger function to ensure the updated_at timestamp is maintained
-- (This is already handled by the existing trigger, but adding for completeness)
