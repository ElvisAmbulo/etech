# Complete Setup Guide

## 1. Database Setup

Run the contents of `docs/complete_setup.sql` in your **Supabase SQL Editor** (Dashboard → SQL Editor → New Query → paste → Run).

This creates all tables, functions, triggers, and RLS policies in one go.

## 2. Supabase Auth Settings

In your Supabase Dashboard → **Authentication** → **URL Configuration**:

| Setting | Value |
|---------|-------|
| Site URL | `https://etechsoftwares.vercel.app` |
| Redirect URLs | `https://etechsoftwares.vercel.app/**` |

## 3. Deploy the Edge Function

Using the Supabase CLI:

```bash
supabase functions deploy manage-users --no-verify-jwt --project-ref YOUR_PROJECT_REF
```

Or paste the contents of `supabase/functions/manage-users/index.ts` into **Dashboard → Edge Functions → Create Function**.

Ensure these secrets exist (Dashboard → Settings → Edge Functions → Secrets):
- `SUPABASE_URL` — your project URL
- `SUPABASE_SERVICE_ROLE_KEY` — your service role key

## 4. Vercel Environment Variables

In Vercel → Project Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://YOUR_REF.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | Your project ref |

## 5. First Admin Setup

1. Visit `https://etechsoftwares.vercel.app/admin/setup`
2. Fill in your name, email, and password
3. The first account is automatically assigned the **admin** role
4. If an admin already exists, this page redirects to `/admin/login`

## 6. Inviting Users

1. Log in at `/admin/login`
2. Go to **Settings** → enter email + role → **Send Invitation**
3. Share the generated invite link with the user
4. The invited user opens the link, sets their name + password, and their account is created with the assigned role

## 7. Routes Summary

| Route | Purpose |
|-------|---------|
| `/admin/setup` | First admin signup (disabled after first admin) |
| `/admin/login` | Admin login |
| `/accept-invite?token=...` | Accept invitation |
| `/admin` | Admin dashboard (protected) |
