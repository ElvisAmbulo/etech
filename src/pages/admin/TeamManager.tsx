import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string | null;
  initials: string | null;
  image_url: string | null;
  display_order: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

const TeamManager = () => {
  const [items, setItems] = useState<TeamMember[]>([]);
  const [editing, setEditing] = useState<Partial<TeamMember> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const { toast } = useToast();

  const fetchAll = async () => {
    const { data } = await supabase.from("team_members").select("*").order("display_order");
    setItems((data as TeamMember[]) ?? []);
  };

  useEffect(() => { fetchAll(); }, []);

  const openNew = () => { setEditing({ name: "", role: "", initials: "", image_url: "", display_order: 0, is_active: true }); setIsNew(true); };
  const openEdit = (t: TeamMember) => { setEditing(t); setIsNew(false); };

  const save = async () => {
    if (!editing?.name) return;
    const initials = editing.initials || editing.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    const record = { name: editing.name, role: editing.role, initials, image_url: editing.image_url, display_order: editing.display_order, is_active: editing.is_active };
    if (isNew) {
      await supabase.from("team_members").insert(record);
    } else {
      await supabase.from("team_members").update(record).eq("id", editing.id!);
    }
    toast({ title: isNew ? "Team member added" : "Team member updated" });
    setEditing(null);
    fetchAll();
  };

  const remove = async (id: string) => {
    await supabase.from("team_members").delete().eq("id", id);
    toast({ title: "Team member deleted" });
    fetchAll();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Team Members</h1>
        <Button size="sm" onClick={openNew}><Plus size={14} className="mr-1" /> Add Member</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((t) => (
          <Card key={t.id}>
            <CardContent className="p-4 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <span className="font-display font-bold text-primary">{t.initials}</span>
              </div>
              <h3 className="text-sm font-semibold text-foreground">{t.name}</h3>
              <p className="text-xs text-muted-foreground">{t.role}</p>
              {!t.is_active && <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground mt-1 inline-block">Hidden</span>}
              <div className="flex justify-center gap-1 mt-3">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(t)}><Pencil size={13} /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(t.id)}><Trash2 size={13} /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNew ? "Add Team Member" : "Edit Team Member"}</DialogTitle>
            <DialogDescription>Fill in the team member details below.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <Input placeholder="Full Name" value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              <Input placeholder="Role / Title" value={editing.role ?? ""} onChange={(e) => setEditing({ ...editing, role: e.target.value })} />
              <Input placeholder="Initials (auto-generated if empty)" value={editing.initials ?? ""} onChange={(e) => setEditing({ ...editing, initials: e.target.value })} />
              <Input placeholder="Image URL (optional)" value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} />
              <Input type="number" placeholder="Display Order" value={editing.display_order ?? 0} onChange={(e) => setEditing({ ...editing, display_order: parseInt(e.target.value) || 0 })} />
              <div className="flex items-center gap-2">
                <Switch checked={editing.is_active ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
                <span className="text-sm text-foreground">Active</span>
              </div>
              <Button onClick={save} className="w-full">{isNew ? "Add" : "Save"}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamManager;
