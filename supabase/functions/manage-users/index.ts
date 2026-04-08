import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const getAdmin = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

// ── Helpers ──

async function sendInviteEmail(
  supabaseAdmin: ReturnType<typeof getAdmin>,
  email: string,
  role: string,
  inviteUrl: string,
  inviterEmail: string
) {
  // Use Supabase's built-in email (admin.generateLink triggers email)
  // Since we can't send emails directly without a provider, we generate
  // an OTP-style magic link or rely on the invite URL.
  // For now, we'll use the admin API to send an invite email.
  try {
    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { invited_role: role, invite_url: inviteUrl },
      redirectTo: inviteUrl,
    });
    if (error) {
      console.error("Failed to send invite email:", error.message);
      // Non-blocking — invite link is still created
    }
  } catch (err) {
    console.error("Email send exception:", err);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseAdmin = getAdmin();
  const { action, ...params } = await req.json();

  // ── Public actions ──

  if (action === "check_admin_exists") {
    const { data, error } = await supabaseAdmin
      .from("user_roles").select("id").eq("role", "admin").limit(1);
    if (error) return json({ error: error.message }, 500);
    return json({ exists: (data ?? []).length > 0 });
  }

  if (action === "setup_first_admin") {
    const { data: existing } = await supabaseAdmin
      .from("user_roles").select("id").eq("role", "admin").limit(1);
    if (existing && existing.length > 0) return json({ error: "An admin already exists" }, 403);

    const { name, email, password } = params;
    if (!name || !email || !password) return json({ error: "Name, email, and password are required" }, 400);

    const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { full_name: name },
    });
    if (createErr) return json({ error: createErr.message }, 500);

    const userId = newUser.user.id;
    await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "admin" });
    await supabaseAdmin.from("profiles").upsert({ id: userId, email });

    const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
    await supabaseAdmin.from("team_members").insert({ name, role: "Administrator", initials, is_active: false });

    const defaultPermissions = [
      "manage_leads", "manage_projects", "manage_products",
      "manage_testimonials", "manage_services", "manage_team",
      "manage_content", "manage_settings", "view_analytics",
      "manage_users", "manage_permissions",
    ];
    const permRows = defaultPermissions.map((p) => ({ role: "admin", permission: p }));
    await supabaseAdmin.from("role_permissions").upsert(permRows, { onConflict: "role,permission", ignoreDuplicates: true });

    return json({ success: true });
  }

  if (action === "accept_invite") {
    const { token, name, password } = params;
    if (!token || !name || !password) return json({ error: "Token, name, and password are required" }, 400);

    const { data: invite, error: invErr } = await supabaseAdmin
      .from("pending_invitations").select("*").eq("token", token).eq("status", "pending").single();
    if (invErr || !invite) return json({ error: "Invalid or expired invitation" }, 400);

    if (new Date(invite.expires_at) < new Date()) {
      await supabaseAdmin.from("pending_invitations").update({ status: "expired" }).eq("id", invite.id);
      return json({ error: "Invitation has expired" }, 400);
    }

    const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: invite.email, password, email_confirm: true,
      user_metadata: { full_name: name },
    });
    if (createErr) return json({ error: createErr.message }, 500);

    const userId = newUser.user.id;
    await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: invite.role });
    await supabaseAdmin.from("profiles").upsert({ id: userId, email: invite.email });

    const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
    await supabaseAdmin.from("team_members").insert({ name, role: invite.role, initials, is_active: false });
    await supabaseAdmin.from("pending_invitations").update({ status: "accepted" }).eq("id", invite.id);

    return json({ success: true });
  }

  // ── Protected actions ──

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "No auth" }, 401);

  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
  if (authErr || !user) return json({ error: "Unauthorized" }, 401);

  const { data: isAdmin } = await supabaseAdmin.rpc("has_role", { _user_id: user.id, _role: "admin" });
  if (!isAdmin) return json({ error: "Forbidden" }, 403);

  try {
    if (action === "list") {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 100 });
      if (error) throw error;
      const { data: roles } = await supabaseAdmin.from("user_roles").select("*");
      const users = data.users.map((u) => ({
        id: u.id, email: u.email, created_at: u.created_at,
        roles: (roles ?? []).filter((r: any) => r.user_id === u.id).map((r: any) => r.role),
      }));
      return json({ users });
    }

    if (action === "invite") {
      const { email, role, siteUrl } = params;
      if (!email) throw new Error("Email is required");

      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const inviteUrl = `${siteUrl || "https://etechsoftwares.vercel.app"}/accept-invite?token=${token}`;

      const { data: existing } = await supabaseAdmin
        .from("pending_invitations").select("id").eq("email", email).eq("status", "pending").limit(1);

      if (existing && existing.length > 0) {
        await supabaseAdmin.from("pending_invitations")
          .update({ role: role || "user", token, expires_at: expiresAt, invited_by: user.id })
          .eq("email", email).eq("status", "pending");
      } else {
        await supabaseAdmin.from("pending_invitations").insert({
          email, role: role || "user", token, expires_at: expiresAt, invited_by: user.id,
        });
      }

      // Attempt to send invite email via Supabase Auth
      await sendInviteEmail(supabaseAdmin, email, role || "user", inviteUrl, user.email || "admin");

      return json({ success: true, token, inviteUrl });
    }

    if (action === "list_invites") {
      const { data, error } = await supabaseAdmin
        .from("pending_invitations").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return json({ invitations: data });
    }

    if (action === "revoke_invite") {
      const { invite_id } = params;
      await supabaseAdmin.from("pending_invitations").update({ status: "revoked" }).eq("id", invite_id);
      return json({ success: true });
    }

    if (action === "update_role") {
      const { user_id, role } = params;
      await supabaseAdmin.from("user_roles").delete().eq("user_id", user_id);
      if (role) await supabaseAdmin.from("user_roles").insert({ user_id, role });
      return json({ success: true });
    }

    if (action === "delete") {
      const { user_id } = params;
      if (user_id === user.id) throw new Error("Cannot delete yourself");
      const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);
      if (error) throw error;
      return json({ success: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
});
