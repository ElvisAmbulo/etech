-- Content toggles: testimonials visibility & map placeholder
-- Run this in your Supabase SQL Editor

-- Ensure unique constraint on site_content (section, key) if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'site_content_section_key_unique'
  ) THEN
    ALTER TABLE public.site_content ADD CONSTRAINT site_content_section_key_unique UNIQUE (section, key);
  END IF;
END $$;

-- Insert default toggle values (won't conflict if they already exist)
INSERT INTO public.site_content (section, key, value)
VALUES
  ('company', 'show_testimonials', '{"text": "true"}'::jsonb),
  ('company', 'show_map', '{"text": "true"}'::jsonb)
ON CONFLICT (section, key) DO NOTHING;

-- Ensure all approved testimonials are marked as featured so they render
UPDATE public.testimonials
SET is_featured = true
WHERE status = 'approved' AND is_featured = false;
