import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Quote, Check, X } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  is_featured: boolean | null;
  display_order: number | null;
  status: string;
  created_at: string;
}

const TestimonialsManager = () => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [editing, setEditing] = useState<Partial<Testimonial> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [tab, setTab] = useState("approved");
  const { toast } = useToast();

  const fetchAll = async () => {
    const { data } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
    setItems((data as Testimonial[]) ?? []);
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = items.filter((t) => {
    if (tab === "pending") return t.status === "pending";
    if (tab === "approved") return t.status === "approved";
    return t.status === "rejected";
  });

  const pendingCount = items.filter((t) => t.status === "pending").length;

  const openNew = () => {
    setEditing({ name: "", role: "", quote: "", is_featured: true, display_order: 0, status: "approved" });
    setIsNew(true);
  };
  const openEdit = (t: Testimonial) => { setEditing(t); setIsNew(false); };

  const save = async () => {
    if (!editing?.name || !editing?.quote) return;
    const record = {
      name: editing.name,
      role: editing.role,
      quote: editing.quote,
      is_featured: editing.is_featured,
      display_order: editing.display_order,
      status: editing.status || "approved",
    };
    if (isNew) {
      await supabase.from("testimonials").insert(record);
    } else {
      await supabase.from("testimonials").update(record).eq("id", editing.id!);
    }
    toast({ title: isNew ? "Testimonial added" : "Testimonial updated" });
    setEditing(null);
    fetchAll();
  };

  const updateStatus = async (id: string, status: string) => {
    const update: any = { status };
    // Auto-feature when approving so it shows on the homepage
    if (status === "approved") update.is_featured = true;
    if (status === "rejected") update.is_featured = false;
    await supabase.from("testimonials").update(update).eq("id", id);
    toast({ title: `Testimonial ${status}` });
    fetchAll();
  };

  const remove = async (id: string) => {
    await supabase.from("testimonials").delete().eq("id", id);
    toast({ title: "Testimonial deleted" });
    fetchAll();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Testimonials</h1>
        <Button size="sm" onClick={openNew}><Plus size={14} className="mr-1" /> Add Testimonial</Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-1.5 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No {tab} testimonials</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((t) => (
                <Card key={t.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3 flex-1">
                        <Quote size={16} className="text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-foreground italic line-clamp-3">"{t.quote}"</p>
                          <p className="text-xs font-medium text-foreground mt-2">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.role}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{new Date(t.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {t.status === "pending" && (
                          <>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={() => updateStatus(t.id, "approved")} title="Approve">
                              <Check size={14} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => updateStatus(t.id, "rejected")} title="Reject">
                              <X size={14} />
                            </Button>
                          </>
                        )}
                        {t.status === "rejected" && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={() => updateStatus(t.id, "approved")} title="Approve">
                            <Check size={14} />
                          </Button>
                        )}
                        {t.status === "approved" && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-orange-500" onClick={() => updateStatus(t.id, "rejected")} title="Hide">
                            <X size={14} />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(t)}><Pencil size={13} /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(t.id)}><Trash2 size={13} /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNew ? "Add Testimonial" : "Edit Testimonial"}</DialogTitle>
            <DialogDescription>Enter the testimonial details below.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <Input placeholder="Client Name" value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              <Input placeholder="Role / Company" value={editing.role ?? ""} onChange={(e) => setEditing({ ...editing, role: e.target.value })} />
              <Textarea placeholder="Quote" value={editing.quote ?? ""} onChange={(e) => setEditing({ ...editing, quote: e.target.value })} rows={3} />
              <div className="flex items-center gap-2">
                <Switch checked={editing.is_featured ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_featured: v })} />
                <span className="text-sm text-foreground">Featured on homepage</span>
              </div>
              <Button onClick={save} className="w-full">{isNew ? "Add" : "Save"}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestimonialsManager;
