
-- Role permissions table
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  permission text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role, permission)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage permissions" ON public.role_permissions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can read permissions" ON public.role_permissions
  FOR SELECT TO authenticated
  USING (true);

-- Security definer function to check permissions
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.role_permissions rp
    JOIN public.user_roles ur ON ur.role = rp.role
    WHERE ur.user_id = _user_id AND rp.permission = _permission
  )
$$;

-- Seed default admin permissions
INSERT INTO public.role_permissions (role, permission) VALUES
  ('admin', 'manage_leads'),
  ('admin', 'manage_projects'),
  ('admin', 'manage_products'),
  ('admin', 'manage_services'),
  ('admin', 'manage_team'),
  ('admin', 'manage_testimonials'),
  ('admin', 'manage_content'),
  ('admin', 'view_analytics'),
  ('admin', 'manage_settings'),
  ('admin', 'manage_users'),
  ('admin', 'manage_permissions'),
  ('moderator', 'manage_leads'),
  ('moderator', 'manage_testimonials'),
  ('moderator', 'view_analytics');
