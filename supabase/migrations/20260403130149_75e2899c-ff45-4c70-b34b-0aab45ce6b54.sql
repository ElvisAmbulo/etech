
-- Add phone column to contact_submissions
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS phone text;

-- Add site_url column to projects for website screenshot option
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS site_url text;
