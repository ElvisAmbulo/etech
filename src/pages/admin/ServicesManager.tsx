import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Service {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  display_order: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

const iconOptions = ["Code", "Globe", "Cloud", "Settings", "Monitor", "Palette", "Layers", "Cpu", "Database", "Shield", "Smartphone", "Zap"];

const ServicesManager = () => {
  const [items, setItems] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Partial<Service> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const { toast } = useToast();

  const fetchAll = async () => {
    const { data } = await supabase.from("services").select("*").order("display_order");
    setItems((data as Service[]) ?? []);
  };

  useEffect(() => { fetchAll(); }, []);

  const openNew = () => { setEditing({ title: "", description: "", icon: "Code", display_order: 0, is_active: true }); setIsNew(true); };
  const openEdit = (s: Service) => { setEditing(s); setIsNew(false); };

  const save = async () => {
    if (!editing?.title) return;
    const record = { title: editing.title, description: editing.description, icon: editing.icon, display_order: editing.display_order, is_active: editing.is_active };
    if (isNew) {
      await supabase.from("services").insert(record);
    } else {
      await supabase.from("services").update(record).eq("id", editing.id!);
    }
    toast({ title: isNew ? "Service added" : "Service updated" });
    setEditing(null);
    fetchAll();
  };

  const remove = async (id: string) => {
    await supabase.from("services").delete().eq("id", id);
    toast({ title: "Service deleted" });
    fetchAll();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Services</h1>
        <Button size="sm" onClick={openNew}><Plus size={14} className="mr-1" /> Add Service</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
                    {!s.is_active && <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Hidden</span>}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">Icon: {s.icon}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(s)}><Pencil size={13} /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(s.id)}><Trash2 size={13} /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNew ? "Add Service" : "Edit Service"}</DialogTitle>
            <DialogDescription>Configure the service details below.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <Input placeholder="Service Title" value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              <Textarea placeholder="Description" value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} />
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setEditing({ ...editing, icon })}
                      className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${editing.icon === icon ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
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

export default ServicesManager;
