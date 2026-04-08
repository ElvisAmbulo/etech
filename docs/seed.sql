-- ============================================
-- eTech Softwares - Seed Data
-- Run AFTER schema.sql
-- ============================================

-- Default company settings
INSERT INTO public.site_content (section, key, value) VALUES
  ('company', 'name', '{"text": "eTech Softwares"}'::jsonb),
  ('company', 'phone', '{"text": "+254 796 867 637"}'::jsonb),
  ('company', 'whatsapp', '{"text": "+254 745 534 176"}'::jsonb),
  ('company', 'whatsapp_number', '{"text": "254745534176"}'::jsonb),
  ('company', 'email', '{"text": "etechsoftwares@gmail.com"}'::jsonb),
  ('company', 'location', '{"text": "Nairobi, Kenya"}'::jsonb),
  ('company', 'tagline', '{"text": "Delivering innovative technology solutions that drive growth and transform businesses worldwide."}'::jsonb)
ON CONFLICT (section, key) DO NOTHING;

-- Default admin permissions (run after creating your admin user)
INSERT INTO public.role_permissions (role, permission) VALUES
  ('admin', 'manage_services'),
  ('admin', 'manage_products'),
  ('admin', 'manage_projects'),
  ('admin', 'manage_team'),
  ('admin', 'manage_testimonials'),
  ('admin', 'manage_leads'),
  ('admin', 'manage_content'),
  ('admin', 'manage_settings'),
  ('admin', 'manage_users'),
  ('admin', 'view_analytics')
ON CONFLICT (role, permission) DO NOTHING;
