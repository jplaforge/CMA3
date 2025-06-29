ALTER TABLE public.realtor_profiles
ADD COLUMN IF NOT EXISTS user_email TEXT;
