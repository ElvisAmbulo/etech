import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

interface SettingField {
  key: string;
  dbKey: string;
  label: string;
  type?: string;
}

const fields: SettingField[] = [
  { key: "company_name", dbKey: "name", label: "Company Name" },
  { key: "phone", dbKey: "phone", label: "Phone" },
  { key: "whatsapp", dbKey: "whatsapp", label: "WhatsApp Display" },
  { key: "whatsapp_number", dbKey: "whatsapp_number", label: "WhatsApp Number (digits only)" },
  { key: "email", dbKey: "email", label: "Email", type: "email" },
  { key: "location", dbKey: "location", label: "Location" },
  { key: "tagline", dbKey: "tagline", label: "Tagline" },
];

const SiteInfoEditor = () => {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [showMap, setShowMap] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("site_content").select("*").eq("section", "company");
      if (data) {
        const v: Record<string, string> = {};
        data.forEach((row) => {
          if (row.key === "show_map") {
            const val = row.value as Record<string, string>;
            setShowMap(val.text !== "false");
            return;
          }
          const field = fields.find((f) => f.dbKey === row.key);
          if (field) v[field.key] = (row.value as Record<string, string>).text ?? "";
        });
        setValues(v);
      }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const field of fields) {
        if (values[field.key] === undefined) continue;
        await supabase
          .from("site_content")
          .upsert(
            { section: "company", key: field.dbKey, value: { text: values[field.key] } },
            { onConflict: "section,key" }
          );
      }
      // Save map toggle
      await supabase
        .from("site_content")
        .upsert(
          { section: "company", key: "show_map", value: { text: showMap ? "true" : "false" } },
          { onConflict: "section,key" }
        );
      toast({ title: "Site settings saved!" });
    } catch {
      toast({ title: "Error saving settings", variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Site Information</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="text-sm font-medium text-foreground mb-1 block">{f.label}</label>
            <Input
              type={f.type ?? "text"}
              value={values[f.key] ?? ""}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
            />
          </div>
        ))}
        <div className="flex items-center gap-2 pt-2">
          <Switch checked={showMap} onCheckedChange={setShowMap} />
          <span className="text-sm text-foreground">Show map on Contact page</span>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save size={14} className="mr-1" /> {saving ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SiteInfoEditor;
