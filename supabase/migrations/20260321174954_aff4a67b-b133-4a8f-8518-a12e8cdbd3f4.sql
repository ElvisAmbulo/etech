
-- Add unique constraint on section+key for upsert support
CREATE UNIQUE INDEX IF NOT EXISTS site_content_section_key_idx ON public.site_content (section, key);
