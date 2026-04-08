import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Eye, FolderOpen, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [stats, setStats] = useState({ leads: 0, views: 0, projects: 0, products: 0, newLeads: 0 });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const [leads, views, projects, products, newLeads, recent] = await Promise.all([
        supabase.from("contact_submissions").select("id", { count: "exact", head: true }),
        supabase.from("page_views").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("contact_submissions").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }).limit(5),
      ]);
      setStats({
        leads: leads.count ?? 0,
        views: views.count ?? 0,
        projects: projects.count ?? 0,
        products: products.count ?? 0,
        newLeads: newLeads.count ?? 0,
      });
      setRecentLeads(recent.data ?? []);
    };
    fetchStats();
  }, []);

  const cards = [
    { title: "Total Leads", value: stats.leads, icon: MessageSquare, accent: "text-primary" },
    { title: "New Leads", value: stats.newLeads, icon: MessageSquare, accent: "text-accent" },
    { title: "Page Views", value: stats.views, icon: Eye, accent: "text-primary" },
    { title: "Projects", value: stats.projects, icon: FolderOpen, accent: "text-accent" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
              <c.icon size={18} className={c.accent} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {recentLeads.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leads yet.</p>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    lead.status === "new" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    {lead.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
