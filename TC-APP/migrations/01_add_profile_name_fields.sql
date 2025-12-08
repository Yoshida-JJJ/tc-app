-- Add new columns for separating name types
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_name text,
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text;

-- Migrate existing 'name' to 'display_name' initially so it's not empty
UPDATE public.profiles 
SET display_name = name 
WHERE display_name IS NULL;
