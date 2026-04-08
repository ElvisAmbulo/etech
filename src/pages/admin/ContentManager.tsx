import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

interface ContentItem {
  section: string;
  key: string;
  value: Record<string, string>;
}

const defaultContent: ContentItem[] = [
  { section: "hero", key: "headline", value: { text: "Building the future, one solution at a time." } },
  { section: "hero", key: "subheadline", value: { text: "We design, develop, and deploy software solutions that help businesses innovate, scale, and thrive in a digital-first world." } },
  { section: "hero", key: "badge", value: { text: "Technology Solutions Partner" } },
  { section: "about", key: "mission", value: { text: "To empower businesses with cutting-edge technology solutions that drive growth and innovation." } },
  { section: "about", key: "vision", value: { text: "To be Africa's most trusted technology partner, shaping the digital future." } },
  { section: "cta", key: "headline", value: { text: "Ready to Build Something Great?" } },
  { section: "cta", key: "description", value: { text: "Let's discuss your project and find the perfect solution for your business." } },
];

const ContentManager = () => {
  const [content, setContent] = useState<ContentItem[]>(defaultContent);
  const [showTestimonials, setShowTestimonials] = useState(true);
  const [showMap, setShowMap] = useState(true);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase.from("site_content").select("*");
      if (data && data.length > 0) {
        const merged = defaultContent.map((dc) => {
          const found = data.find((d) => d.section === dc.section && d.key === dc.key);
          return found ? { ...dc, value: found.value as Record<string, string> } : dc;
        });
        setContent(merged);

        const testimonialsToggle = data.find((d) => d.section === "company" && d.key === "show_testimonials");
        if (testimonialsToggle) {
          const val = testimonialsToggle.value as Record<string, string>;
          setShowTestimonials(val.text !== "false");
        }

        const mapToggle = data.find((d) => d.section === "company" && d.key === "show_map");
        if (mapToggle) {
          const val = mapToggle.value as Record<string, string>;
          setShowMap(val.text !== "false");
        }
      }
      setLoading(false);
    };
    fetchContent();
  }, []);

  const updateValue = (section: string, key: string, field: string, val: string) => {
    setContent((prev) =>
      prev.map((c) => (c.section === section && c.key === key ? { ...c, value: { ...c.value, [field]: val } } : c))
    );
  };

  const saveAll = async () => {
    for (const item of content) {
      await supabase.from("site_content").upsert(
        { section: item.section, key: item.key, value: item.value },
        { onConflict: "section,key" }
      );
    }
    // Save toggles
    await supabase.from("site_content").upsert(
      { section: "company", key: "show_testimonials", value: { text: showTestimonials ? "true" : "false" } },
      { onConflict: "section,key" }
    );
    await supabase.from("site_content").upsert(
      { section: "company", key: "show_map", value: { text: showMap ? "true" : "false" } },
      { onConflict: "section,key" }
    );
    toast({ title: "Content saved!" });
  };

  const grouped = content.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, ContentItem[]>);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Content Management</h1>
        <Button onClick={saveAll}><Save size={14} className="mr-1" /> Save All</Button>
      </div>

      {Object.entries(grouped).map(([section, items]) => (
        <Card key={section}>
          <CardHeader>
            <CardTitle className="capitalize text-lg">{section} Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => (
              <div key={`${item.section}-${item.key}`}>
                <label className="text-sm font-medium text-foreground capitalize mb-1 block">{item.key}</label>
                {(item.value.text?.length ?? 0) > 80 ? (
                  <Textarea
                    value={item.value.text ?? ""}
                    onChange={(e) => updateValue(item.section, item.key, "text", e.target.value)}
                    rows={3}
                  />
                ) : (
                  <Input
                    value={item.value.text ?? ""}
                    onChange={(e) => updateValue(item.section, item.key, "text", e.target.value)}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Visibility Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Section Visibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Testimonials Section</p>
              <p className="text-xs text-muted-foreground">Show client testimonials on the homepage</p>
            </div>
            <Switch checked={showTestimonials} onCheckedChange={setShowTestimonials} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Map Placeholder</p>
              <p className="text-xs text-muted-foreground">Show map on the contact page</p>
            </div>
            <Switch checked={showMap} onCheckedChange={setShowMap} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentManager;
