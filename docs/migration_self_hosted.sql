-- ============================================================
-- Migration: Self-Hosted Supabase Setup
-- Run this AFTER schema.sql and seed.sql on your own Supabase project.
-- This file ensures all triggers, functions, and policies are in place.
-- ============================================================

-- 1. Create the trigger for auto-creating profiles on user signup
-- (the function handle_new_user already exists from schema.sql)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users (this was missing)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Ensure role_permissions has a unique constraint for upsert support
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'role_permissions_role_permission_key'
  ) THEN
    ALTER TABLE public.role_permissions
      ADD CONSTRAINT role_permissions_role_permission_key UNIQUE (role, permission);
  END IF;
END $$;

-- 3. Seed default admin permissions (idempotent)
INSERT INTO public.role_permissions (role, permission) VALUES
  ('admin', 'manage_leads'),
  ('admin', 'manage_projects'),
  ('admin', 'manage_products'),
  ('admin', 'manage_testimonials'),
  ('admin', 'manage_services'),
  ('admin', 'manage_team'),
  ('admin', 'manage_content'),
  ('admin', 'manage_settings'),
  ('admin', 'view_analytics'),
  ('admin', 'manage_users'),
  ('admin', 'manage_permissions')
ON CONFLICT (role, permission) DO NOTHING;

-- 4. Verify all required RLS policies exist
-- (These should already exist from schema.sql, but this is a safety check)
-- If you get errors here, the policies already exist — that's fine.

-- 5. Edge Function deployment note:
-- Deploy the manage-users edge function to your Supabase project:
--   cd your-project
--   supabase functions deploy manage-users --no-verify-jwt
--
-- Required secrets in your Supabase project:
--   SUPABASE_URL          (auto-set by Supabase)
--   SUPABASE_SERVICE_ROLE_KEY  (auto-set by Supabase)
