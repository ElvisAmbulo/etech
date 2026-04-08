import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ALL_PERMISSIONS } from "@/hooks/usePermissions";
import { Shield, Save } from "lucide-react";

const ROLES = ["admin", "moderator", "user"] as const;

const RolePermissionsEditor = () => {
  const { toast } = useToast();
  const [permMap, setPermMap] = useState<Record<string, Set<string>>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("role_permissions").select("*");
      const map: Record<string, Set<string>> = {};
      ROLES.forEach((r) => (map[r] = new Set()));
      data?.forEach((row) => {
        if (map[row.role]) map[row.role].add(row.permission);
      });
      setPermMap(map);
    };
    fetch();
  }, []);

  const toggle = (role: string, perm: string) => {
    setPermMap((prev) => {
      const copy = { ...prev };
      const s = new Set(copy[role]);
      if (s.has(perm)) s.delete(perm); else s.add(perm);
      copy[role] = s;
      return copy;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Delete all existing and re-insert
      await supabase.from("role_permissions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      const rows: { role: string; permission: string }[] = [];
      ROLES.forEach((role) => {
        permMap[role]?.forEach((perm) => rows.push({ role, permission: perm }));
      });
      if (rows.length > 0) {
        await supabase.from("role_permissions").insert(rows as any);
      }
      toast({ title: "Permissions saved!" });
    } catch {
      toast({ title: "Error saving permissions", variant: "destructive" });
    }
    setSaving(false);
  };

  const roleBadgeVariant = (role: string) => {
    if (role === "admin") return "destructive";
    if (role === "moderator") return "default";
    return "secondary";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2"><Shield size={18} /> Role Permissions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Permission</th>
                {ROLES.map((r) => (
                  <th key={r} className="text-center py-2 px-3">
                    <Badge variant={roleBadgeVariant(r) as any} className="text-xs">{r}</Badge>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_PERMISSIONS.map((p) => (
                <tr key={p.key} className="border-b border-border/50">
                  <td className="py-2.5 pr-4 text-foreground">{p.label}</td>
                  {ROLES.map((r) => (
                    <td key={r} className="text-center py-2.5 px-3">
                      <Checkbox
                        checked={permMap[r]?.has(p.key) ?? false}
                        onCheckedChange={() => toggle(r, p.key)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button onClick={handleSave} disabled={saving} className="mt-4">
          <Save size={14} className="mr-1" /> {saving ? "Saving..." : "Save Permissions"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RolePermissionsEditor;
