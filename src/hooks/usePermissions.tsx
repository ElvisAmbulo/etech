import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const ALL_PERMISSIONS = [
  { key: "manage_leads", label: "Manage Leads" },
  { key: "manage_projects", label: "Manage Projects" },
  { key: "manage_products", label: "Manage Products" },
  { key: "manage_services", label: "Manage Services" },
  { key: "manage_team", label: "Manage Team" },
  { key: "manage_testimonials", label: "Manage Testimonials" },
  { key: "manage_content", label: "Manage Content" },
  { key: "view_analytics", label: "View Analytics" },
  { key: "manage_settings", label: "Manage Settings" },
  { key: "manage_users", label: "Manage Users" },
  { key: "manage_permissions", label: "Manage Permissions" },
] as const;

export type PermissionKey = typeof ALL_PERMISSIONS[number]["key"];

export const usePermissions = () => {
  const { user, isAdmin } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPermissions([]);
      setLoading(false);
      return;
    }
    const fetch = async () => {
      // Get user's roles
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (!roles?.length) {
        setPermissions([]);
        setLoading(false);
        return;
      }

      const roleNames = roles.map((r) => r.role);
      const { data: perms } = await supabase
        .from("role_permissions")
        .select("permission")
        .in("role", roleNames);

      setPermissions([...new Set(perms?.map((p) => p.permission) ?? [])]);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const hasPermission = (perm: string) => isAdmin || permissions.includes(perm);

  return { permissions, hasPermission, loading };
};
