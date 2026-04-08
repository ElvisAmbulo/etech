import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Analytics = () => {
  const [pageData, setPageData] = useState<{ page: string; views: number }[]>([]);
  const [dailyData, setDailyData] = useState<{ date: string; views: number }[]>([]);
  const [totalViews, setTotalViews] = useState(0);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data, count } = await supabase.from("page_views").select("*", { count: "exact" });
      setTotalViews(count ?? 0);

      if (data) {
        // Group by page
        const byPage: Record<string, number> = {};
        const byDate: Record<string, number> = {};
        data.forEach((v) => {
          byPage[v.page] = (byPage[v.page] || 0) + 1;
          const date = new Date(v.created_at).toLocaleDateString();
          byDate[date] = (byDate[date] || 0) + 1;
        });
        setPageData(Object.entries(byPage).map(([page, views]) => ({ page, views })).sort((a, b) => b.views - a.views));
        setDailyData(Object.entries(byDate).map(([date, views]) => ({ date, views })).slice(-14));
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Page Views</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-foreground">{totalViews}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Unique Pages Tracked</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-foreground">{pageData.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Today's Views</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {dailyData.find((d) => d.date === new Date().toLocaleDateString())?.views ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {dailyData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Daily Views (Last 14 Days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <Tooltip />
                <Bar dataKey="views" fill="hsl(213, 80%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">Views by Page</CardTitle></CardHeader>
        <CardContent>
          {pageData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No page view data yet. Views are tracked automatically when visitors browse your site.</p>
          ) : (
            <div className="space-y-2">
              {pageData.map((p) => (
                <div key={p.page} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium text-foreground">{p.page}</span>
                  <span className="text-sm text-muted-foreground">{p.views} views</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
