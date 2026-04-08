# Database Setup Guide

This guide helps you set up the complete database schema for the eTech Softwares project on your own Supabase instance.

## Prerequisites

1. A Supabase project (create one at [supabase.com](https://supabase.com))
2. Access to the Supabase SQL Editor (Dashboard → SQL Editor)

## Environment Variables

Set these in your Vercel project (Settings → Environment Variables):

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
VITE_SUPABASE_PROJECT_ID=YOUR_PROJECT_REF
```

You can find these values in your Supabase Dashboard → Settings → API.

## Setup Instructions

### Step 1: Run the Schema SQL

Copy the contents of `schema.sql` (in this same folder) and paste it into the Supabase SQL Editor. Click **Run** to execute.

This will create:
- All tables with proper columns and defaults
- The `app_role` enum (`admin`, `moderator`, `user`)
- Row-Level Security (RLS) policies on every table
- Database functions (`has_role`, `has_permission`, `handle_new_user`, `update_updated_at_column`)
- Triggers for auto-creating profiles and updating timestamps
- Unique constraints

### Step 2: Create Your Admin User

1. Go to Supabase Dashboard → Authentication → Users
2. Click **Add User** → Create a user with your email and password
3. Then run this SQL in the SQL Editor (replace `YOUR_USER_ID` with the UUID from step 2):

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'admin');
```

### Step 3: Seed Initial Site Content (Optional)

Run the contents of `seed.sql` to populate default company settings.

### Step 4: Set Up Edge Functions (Optional)

If you need the `manage-users` edge function:

1. Install the Supabase CLI: `npm i -g supabase`
2. Link your project: `supabase link --project-ref YOUR_PROJECT_REF`
3. Deploy: `supabase functions deploy manage-users`

Make sure `SUPABASE_SERVICE_ROLE_KEY` is available as a secret in your Supabase project (it is by default).

### Step 5: Update Client Configuration

In your codebase, update `src/integrations/supabase/client.ts` to use your environment variables. The current setup already reads from `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, so setting the Vercel env vars is sufficient.

## Table Overview

| Table | Purpose |
|-------|---------|
| `profiles` | User profile data (auto-created on signup) |
| `user_roles` | Maps users to roles (admin/moderator/user) |
| `role_permissions` | Maps roles to specific permissions |
| `site_content` | Dynamic site settings (company info, text content) |
| `services` | Services offered by the company |
| `products` | Products catalog |
| `projects` | Portfolio/project showcase |
| `team_members` | Team member profiles |
| `testimonials` | Client testimonials |
| `contact_submissions` | Contact form submissions |
| `page_views` | Analytics page view tracking |

## Permissions System

The app uses a granular permission system. Available permissions:

- `manage_services` - CRUD on services
- `manage_products` - CRUD on products
- `manage_projects` - CRUD on projects
- `manage_team` - CRUD on team members
- `manage_testimonials` - CRUD on testimonials
- `manage_leads` - View/manage contact submissions
- `manage_content` - Edit site content
- `manage_settings` - Access admin settings
- `manage_users` - User management
- `view_analytics` - View analytics dashboard

## Troubleshooting

- **RLS errors**: Make sure you've assigned the `admin` role to your user in `user_roles`
- **Auth issues**: Verify your anon key and URL are correct in environment variables
- **Missing data**: Run `seed.sql` to populate default site content
