-- ============================================================
-- Migration: Pending Invitations Table
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Create pending_invitations table
CREATE TABLE IF NOT EXISTS public.pending_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pending_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage invitations"
  ON public.pending_invitations
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow the edge function (service role) to read/update invitations
-- Service role bypasses RLS by default, so no extra policy needed.

-- Allow anon users to read invitations by token (for accept flow)
CREATE POLICY "Anyone can read invitation by token"
  ON public.pending_invitations
  FOR SELECT
  TO anon
  USING (true);

-- Index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_pending_invitations_token ON public.pending_invitations(token);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_email_status ON public.pending_invitations(email, status);

-- Update trigger for updated_at
CREATE TRIGGER update_pending_invitations_updated_at
  BEFORE UPDATE ON public.pending_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
