import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Globe, Image } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  image_url: string | null;
  site_url: string | null;
  is_featured: boolean | null;
  display_order: number | null;
  created_at: string;
  updated_at: string;
}

const emptyProject = {
  title: "",
  description: "",
  tags: [] as string[],
  image_url: "",
  site_url: "",
  is_featured: false,
  display_order: 0,
};

const ProjectsManager = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Partial<Project> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [tagsInput, setTagsInput] = useState("");
  const [imageMode, setImageMode] = useState<"image_url" | "site_url">("image_url");
  const { toast } = useToast();

  const fetchProjects = async () => {
    const { data } = await supabase.from("projects").select("*").order("display_order");
    setProjects((data as Project[]) ?? []);
  };

  useEffect(() => { fetchProjects(); }, []);

  const openNew = () => {
    setEditing(emptyProject);
    setIsNew(true);
    setTagsInput("");
    setImageMode("image_url");
  };

  const openEdit = (p: Project) => {
    setEditing(p);
    setIsNew(false);
    setTagsInput((p.tags ?? []).join(", "));
    setImageMode(p.site_url ? "site_url" : "image_url");
  };

  const save = async () => {
    if (!editing?.title) return;
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    const record: any = {
      title: editing.title,
      description: editing.description,
      tags,
      is_featured: editing.is_featured,
      display_order: editing.display_order,
      image_url: imageMode === "image_url" ? (editing.image_url || null) : null,
      site_url: imageMode === "site_url" ? (editing.site_url || null) : null,
    };

    if (isNew) {
      await supabase.from("projects").insert(record);
    } else {
      await supabase.from("projects").update(record).eq("id", editing.id!);
    }
    toast({ title: isNew ? "Project added" : "Project updated" });
    setEditing(null);
    fetchProjects();
  };

  const remove = async (id: string) => {
    await supabase.from("projects").delete().eq("id", id);
    toast({ title: "Project deleted" });
    fetchProjects();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Projects</h1>
        <Button size="sm" onClick={openNew}><Plus size={14} className="mr-1" /> Add Project</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-foreground text-sm">{p.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                  {p.site_url && (
                    <p className="text-xs text-primary mt-1 flex items-center gap-1"><Globe size={10} /> {p.site_url}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}><Pencil size={13} /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(p.id)}><Trash2 size={13} /></Button>
                </div>
              </div>
              <div className="flex gap-1 flex-wrap">
                {(p.tags ?? []).map((t) => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{t}</span>)}
              </div>
              {p.is_featured && <span className="text-xs text-accent font-medium">★ Featured</span>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNew ? "Add Project" : "Edit Project"}</DialogTitle>
            <DialogDescription>Fill in the project details below.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <Input placeholder="Title" value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              <Textarea placeholder="Description" value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} />
              <Input placeholder="Tags (comma separated)" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Project Preview</label>
                <Select value={imageMode} onValueChange={(v) => setImageMode(v as "image_url" | "site_url")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image_url">
                      <span className="flex items-center gap-2"><Image size={14} /> Image URL</span>
                    </SelectItem>
                    <SelectItem value="site_url">
                      <span className="flex items-center gap-2"><Globe size={14} /> Site URL (screenshot)</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {imageMode === "image_url" ? (
                <Input placeholder="Image URL (https://...)" value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} />
              ) : (
                <Input placeholder="Site URL (https://example.com)" value={editing.site_url ?? ""} onChange={(e) => setEditing({ ...editing, site_url: e.target.value })} />
              )}

              <Input placeholder="Display Order" type="number" value={editing.display_order ?? 0} onChange={(e) => setEditing({ ...editing, display_order: parseInt(e.target.value) })} />
              <div className="flex items-center gap-2">
                <Switch checked={editing.is_featured ?? false} onCheckedChange={(v) => setEditing({ ...editing, is_featured: v })} />
                <span className="text-sm text-foreground">Featured</span>
              </div>
              <Button onClick={save} className="w-full">{isNew ? "Add" : "Save"}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsManager;
