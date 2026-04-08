-- ============================================================
-- Database update: phone field, site_url field, map toggle, testimonials fix
-- Run this on your Supabase SQL Editor if you are self-hosting.
-- ============================================================

-- 1. Add phone column to contact_submissions for lead phone numbers
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS phone text;

-- 2. Add site_url column to projects for website screenshot previews
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS site_url text;

-- 3. Ensure site_content has a unique constraint on (section, key) for upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'site_content_section_key_key'
  ) THEN
    ALTER TABLE public.site_content
      ADD CONSTRAINT site_content_section_key_key UNIQUE (section, key);
  END IF;
END $$;

-- 4. Fix testimonials: set all approved testimonials as featured
UPDATE public.testimonials
SET is_featured = true
WHERE status = 'approved' AND (is_featured IS NULL OR is_featured = false);

-- 5. Initialize map toggle setting (visible by default)
INSERT INTO public.site_content (section, key, value)
VALUES ('company', 'show_map', '{"text": "true"}')
ON CONFLICT (section, key) DO NOTHING;
