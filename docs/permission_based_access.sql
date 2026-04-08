-- ============================================================
-- Permission-Based Content Access Migration
-- Run this in your Supabase SQL Editor
-- ============================================================
-- This adds permission-based RLS policies so that non-admin
-- roles (moderator, user) can access content tables based on
-- their assigned permissions in the role_permissions table.
-- ============================================================

-- contact_submissions: permission-based access
CREATE POLICY "Authenticated users can read submissions"
ON public.contact_submissions FOR SELECT TO authenticated
USING (has_permission(auth.uid(), 'manage_leads'));

CREATE POLICY "Permission-based update submissions"
ON public.contact_submissions FOR UPDATE TO authenticated
USING (has_permission(auth.uid(), 'manage_leads'));

CREATE POLICY "Permission-based delete submissions"
ON public.contact_submissions FOR DELETE TO authenticated
USING (has_permission(auth.uid(), 'manage_leads'));

-- projects: permission-based access
CREATE POLICY "Permission-based insert projects"
ON public.projects FOR INSERT TO authenticated
WITH CHECK (has_permission(auth.uid(), 'manage_projects'));

CREATE POLICY "Permission-based update projects"
ON public.projects FOR UPDATE TO authenticated
USING (has_permission(auth.uid(), 'manage_projects'));

CREATE POLICY "Permission-based delete projects"
ON public.projects FOR DELETE TO authenticated
USING (has_permission(auth.uid(), 'manage_projects'));

-- products: permission-based access
CREATE POLICY "Permission-based insert products"
ON public.products FOR INSERT TO authenticated
WITH CHECK (has_permission(auth.uid(), 'manage_products'));

CREATE POLICY "Permission-based update products"
ON public.products FOR UPDATE TO authenticated
USING (has_permission(auth.uid(), 'manage_products'));

CREATE POLICY "Permission-based delete products"
ON public.products FOR DELETE TO authenticated
USING (has_permission(auth.uid(), 'manage_products'));

-- services: permission-based access
CREATE POLICY "Permission-based insert services"
ON public.services FOR INSERT TO authenticated
WITH CHECK (has_permission(auth.uid(), 'manage_services'));

CREATE POLICY "Permission-based update services"
ON public.services FOR UPDATE TO authenticated
USING (has_permission(auth.uid(), 'manage_services'));

CREATE POLICY "Permission-based delete services"
ON public.services FOR DELETE TO authenticated
USING (has_permission(auth.uid(), 'manage_services'));

-- team_members: permission-based access
CREATE POLICY "Permission-based insert team"
ON public.team_members FOR INSERT TO authenticated
WITH CHECK (has_permission(auth.uid(), 'manage_team'));

CREATE POLICY "Permission-based update team"
ON public.team_members FOR UPDATE TO authenticated
USING (has_permission(auth.uid(), 'manage_team'));

CREATE POLICY "Permission-based delete team"
ON public.team_members FOR DELETE TO authenticated
USING (has_permission(auth.uid(), 'manage_team'));

-- testimonials: permission-based access
CREATE POLICY "Permission-based insert testimonials"
ON public.testimonials FOR INSERT TO authenticated
WITH CHECK (has_permission(auth.uid(), 'manage_testimonials'));

CREATE POLICY "Permission-based update testimonials"
ON public.testimonials FOR UPDATE TO authenticated
USING (has_permission(auth.uid(), 'manage_testimonials'));

CREATE POLICY "Permission-based delete testimonials"
ON public.testimonials FOR DELETE TO authenticated
USING (has_permission(auth.uid(), 'manage_testimonials'));

-- site_content: permission-based access
CREATE POLICY "Permission-based insert content"
ON public.site_content FOR INSERT TO authenticated
WITH CHECK (has_permission(auth.uid(), 'manage_content'));

CREATE POLICY "Permission-based update content"
ON public.site_content FOR UPDATE TO authenticated
USING (has_permission(auth.uid(), 'manage_content'));

CREATE POLICY "Permission-based delete content"
ON public.site_content FOR DELETE TO authenticated
USING (has_permission(auth.uid(), 'manage_content'));

-- profiles: users can read their own profile
CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id);
