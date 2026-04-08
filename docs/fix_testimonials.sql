-- ============================================================
-- Fix: Ensure approved testimonials appear on the frontend
-- Run this on your Supabase SQL Editor.
-- ============================================================

-- 1. Ensure the site_content table has a unique constraint on (section, key)
--    This is needed for upsert operations in the Content Manager.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'site_content_section_key_key'
  ) THEN
    ALTER TABLE public.site_content
      ADD CONSTRAINT site_content_section_key_key UNIQUE (section, key);
  END IF;
END $$;

-- 2. Fix any testimonials that were approved but have is_featured = false or NULL
--    The frontend queries: .eq("is_featured", true).eq("status", "approved")
--    If is_featured is false/null, approved testimonials won't show up.
UPDATE public.testimonials
SET is_featured = true
WHERE status = 'approved' AND (is_featured IS NULL OR is_featured = false);

-- 3. Verify: List all testimonials and their visibility status
SELECT id, name, status, is_featured, display_order
FROM public.testimonials
ORDER BY display_order ASC, created_at DESC;
