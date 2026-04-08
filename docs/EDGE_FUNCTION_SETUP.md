# Edge Function & Database Setup Guide

This guide fixes the **500 Internal Server Error** you see on the Admin Settings page. The error occurs because the `manage-users` edge function and the `pending_invitations` table need to be set up on **your own Supabase project**.

---

## Prerequisites

- A Supabase project with the main schema already applied (see `DATABASE_SETUP.md`)
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed: `npm install -g supabase`
- Your Supabase project ref (found in Dashboard → Settings → General)
- Your Supabase service role key (found in Dashboard → Settings → API → `service_role` secret)

---

## Step 1: Create the `pending_invitations` Table

Go to your **Supabase Dashboard → SQL Editor** and paste the following SQL:

```sql
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

-- Allow anon users to read invitations by token (for accept flow)
CREATE POLICY "Anyone can read invitation by token"
  ON public.pending_invitations
  FOR SELECT
  TO anon
  USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pending_invitations_token ON public.pending_invitations(token);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_email_status ON public.pending_invitations(email, status);

-- Update trigger for updated_at
CREATE TRIGGER update_pending_invitations_updated_at
  BEFORE UPDATE ON public.pending_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

Click **Run** to execute.

---

## Step 2: Deploy the Edge Function

### Option A: Using Supabase CLI (Recommended)

1. **Login to Supabase CLI:**
   ```bash
   supabase login
   ```

2. **Link your project:**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   Replace `YOUR_PROJECT_REF` with your actual project ref (e.g., `abcdefghijklmnop`).

3. **Deploy the function:**
   ```bash
   supabase functions deploy manage-users --no-verify-jwt
   ```

   The `--no-verify-jwt` flag is required because some actions (like `check_admin_exists`, `setup_first_admin`, and `accept_invite`) are called without authentication.

4. **Verify deployment:**
   ```bash
   supabase functions list
   ```
   You should see `manage-users` in the list.

### Option B: Via Supabase Dashboard

1. Go to **Dashboard → Edge Functions**
2. Click **New Function**
3. Name it `manage-users`
4. Copy the entire contents of `supabase/functions/manage-users/index.ts` into the editor
5. **Important:** Disable JWT verification for this function (toggle off "Verify JWT" in function settings)
6. Click **Deploy**

---

## Step 3: Verify Secrets

The edge function uses these environment variables, which are **automatically available** in every Supabase project:

| Secret Name | Description | Auto-set? |
|---|---|---|
| `SUPABASE_URL` | Your project's API URL | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin-level API key | ✅ Yes |

You do **not** need to manually set these. They are pre-configured by Supabase.

To verify, run:
```bash
supabase secrets list
```

You should see both `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` listed.

---

## Step 4: Verify Vercel Environment Variables

Make sure these are set in **Vercel → Project Settings → Environment Variables**:

| Variable | Value | Where to find it |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://YOUR_PROJECT_REF.supabase.co` | Dashboard → Settings → API |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your `anon` public key | Dashboard → Settings → API |
| `VITE_SUPABASE_PROJECT_ID` | Your project ref | Dashboard → Settings → General |

After updating, **redeploy** your Vercel project for changes to take effect.

---

## Step 5: Test

1. Go to `https://your-site.vercel.app/admin/settings`
2. The "User Management" section should load without errors
3. Try clicking **Invite User** to verify the invitation flow works

---

## Troubleshooting

### Still getting 500 errors?

1. **Check edge function logs:**
   ```bash
   supabase functions logs manage-users
   ```

2. **Common issues:**
   - **"relation pending_invitations does not exist"** → You haven't run Step 1
   - **"JWT verification failed"** → Redeploy with `--no-verify-jwt`
   - **Function not found (404)** → The function hasn't been deployed (Step 2)
   - **CORS errors** → Make sure you deployed the exact code from `supabase/functions/manage-users/index.ts`

3. **Verify the function is accessible:**
   ```bash
   curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/manage-users \
     -H "Content-Type: application/json" \
     -d '{"action": "check_admin_exists"}'
   ```
   You should get `{"exists": true}` or `{"exists": false}`.

### Need to update the function?

After making code changes:
```bash
supabase functions deploy manage-users --no-verify-jwt
```
