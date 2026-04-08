import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

const ProductsManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [featuresInput, setFeaturesInput] = useState("");
  const { toast } = useToast();

  const fetchAll = async () => {
    const { data } = await supabase.from("products").select("*").order("display_order");
    setProducts(data ?? []);
  };

  useEffect(() => { fetchAll(); }, []);

  const openNew = () => { setEditing({ name: "", description: "", features: [], cta_text: "Learn More", cta_link: "", display_order: 0 }); setIsNew(true); setFeaturesInput(""); };
  const openEdit = (p: Product) => { setEditing(p); setIsNew(false); setFeaturesInput((p.features ?? []).join(", ")); };

  const save = async () => {
    if (!editing?.name) return;
    const features = featuresInput.split(",").map((f) => f.trim()).filter(Boolean);
    const record = { name: editing.name, description: editing.description, features, image_url: editing.image_url, cta_text: editing.cta_text, cta_link: editing.cta_link, display_order: editing.display_order };

    if (isNew) {
      await supabase.from("products").insert(record);
    } else {
      await supabase.from("products").update(record).eq("id", editing.id!);
    }
    toast({ title: isNew ? "Product added" : "Product updated" });
    setEditing(null);
    fetchAll();
  };

  const remove = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    toast({ title: "Product deleted" });
    fetchAll();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Products</h1>
        <Button size="sm" onClick={openNew}><Plus size={14} className="mr-1" /> Add Product</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-foreground text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}><Pencil size={13} /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(p.id)}><Trash2 size={13} /></Button>
                </div>
              </div>
              <div className="flex gap-1 flex-wrap mt-2">
                {(p.features ?? []).map((f) => <span key={f} className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">{f}</span>)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNew ? "Add Product" : "Edit Product"}</DialogTitle>
            <DialogDescription>Fill in the product details below.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <Input placeholder="Product Name" value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              <Textarea placeholder="Description" value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} />
              <Input placeholder="Features (comma separated)" value={featuresInput} onChange={(e) => setFeaturesInput(e.target.value)} />
              <Input placeholder="CTA Text" value={editing.cta_text ?? ""} onChange={(e) => setEditing({ ...editing, cta_text: e.target.value })} />
              <Input placeholder="CTA Link" value={editing.cta_link ?? ""} onChange={(e) => setEditing({ ...editing, cta_link: e.target.value })} />
              <Input placeholder="Display Order" type="number" value={editing.display_order ?? 0} onChange={(e) => setEditing({ ...editing, display_order: parseInt(e.target.value) })} />
              <Button onClick={save} className="w-full">{isNew ? "Add" : "Save"}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsManager;
