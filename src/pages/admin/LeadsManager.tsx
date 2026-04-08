import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Search, Phone, Mail, ChevronLeft, ChevronRight, Download, ArrowUpDown, Clock, User, MessageSquare } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const PAGE_SIZE = 15;

const statusConfig: Record<string, { label: string; color: string }> = {
  new: { label: "New", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  contacted: { label: "Contacted", color: "bg-amber-500/10 text-amber-600 border-amber-200" },
  qualified: { label: "Qualified", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
  closed: { label: "Closed", color: "bg-muted text-muted-foreground border-border" },
};

const LeadsManager = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<"created_at" | "name" | "status">("created_at");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [notesValue, setNotesValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const fetchLeads = async () => {
    setLoading(true);
    let query = supabase
      .from("contact_submissions")
      .select("*", { count: "exact" })
      .order(sortField, { ascending: sortAsc })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    if (search.trim()) {
      query = query.or(`name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%,phone.ilike.%${search.trim()}%`);
    }

    const { data, count } = await query;
    setLeads((data as Lead[]) ?? []);
    setTotalCount(count ?? 0);
    setLoading(false);
  };

  const fetchCounts = async () => {
    const { data } = await supabase.from("contact_submissions").select("status");
    if (data) {
      const counts: Record<string, number> = { new: 0, contacted: 0, qualified: 0, closed: 0 };
      data.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });
      setStatusCounts(counts);
    }
  };

  useEffect(() => { setPage(0); }, [statusFilter, search, sortField, sortAsc]);
  useEffect(() => { fetchLeads(); fetchCounts(); }, [statusFilter, search, sortField, sortAsc, page]);

  const openLead = (lead: Lead) => {
    setSelected(lead);
    setNotesValue(lead.notes ?? "");
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("contact_submissions").update({ status }).eq("id", id);
    toast({ title: "Status updated" });
    fetchLeads();
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const saveNotes = async () => {
    if (!selected) return;
    await supabase.from("contact_submissions").update({ notes: notesValue }).eq("id", selected.id);
    toast({ title: "Notes saved" });
    setSelected({ ...selected, notes: notesValue });
    fetchLeads();
  };

  const deleteLead = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead? This cannot be undone.")) return;
    await supabase.from("contact_submissions").delete().eq("id", id);
    toast({ title: "Lead deleted" });
    setSelected(null);
    fetchLeads();
  };

  const exportCSV = async () => {
    let query = supabase.from("contact_submissions").select("*").order("created_at", { ascending: false });
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    const { data } = await query;
    if (!data || data.length === 0) { toast({ title: "No leads to export" }); return; }
    const headers = ["Name", "Email", "Phone", "Subject", "Message", "Status", "Notes", "Date"];
    const rows = data.map((l: any) => [
      `"${l.name}"`, `"${l.email}"`, `"${l.phone || ""}"`, `"${l.subject || ""}"`,
      `"${(l.message || "").replace(/"/g, '""')}"`, l.status, `"${(l.notes || "").replace(/"/g, '""')}"`,
      new Date(l.created_at).toLocaleString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r: string[]) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `leads_${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast({ title: "Leads exported" });
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Lead Management</h1>
          <p className="text-sm text-muted-foreground mt-1">{totalCount} total leads</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download size={14} className="mr-1" /> Export CSV
        </Button>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <Card
            key={key}
            className={`cursor-pointer transition-all hover:shadow-sm ${statusFilter === key ? "ring-2 ring-primary" : ""}`}
            onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
          >
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-foreground">{statusCounts[key] || 0}</p>
              <p className="text-xs text-muted-foreground capitalize">{cfg.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-2.5 text-muted-foreground" />
          <Input placeholder="Search by name, email, or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" onClick={() => toggleSort("created_at")} className="text-xs">
          <ArrowUpDown size={14} className="mr-1" /> {sortAsc ? "Oldest" : "Newest"}
        </Button>
      </div>

      {/* Leads List */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare size={32} className="mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No leads found.</p>
            {search && <p className="text-xs text-muted-foreground mt-1">Try adjusting your search terms.</p>}
          </div>
        ) : (
          leads.map((lead) => (
            <Card key={lead.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => openLead(lead)}>
              <CardContent className="flex items-start justify-between p-4 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground text-sm truncate">{lead.name}</p>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusConfig[lead.status]?.color || ""}`}>
                      {statusConfig[lead.status]?.label || lead.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail size={10} /> {lead.email}</span>
                    {lead.phone && <span className="flex items-center gap-1"><Phone size={10} /> {lead.phone}</span>}
                    {lead.subject && <span>· {lead.subject}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-1">{lead.message}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock size={10} /> {timeAgo(lead.created_at)}
                  </span>
                  {lead.notes && <span className="text-[10px] text-primary">Has notes</span>}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ChevronLeft size={14} />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* Lead Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><User size={18} /> {selected?.name}</DialogTitle>
            <DialogDescription>Submitted {selected ? new Date(selected.created_at).toLocaleString() : ""}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-0.5">
                  <span className="text-xs text-muted-foreground">Email</span>
                  <p className="font-medium text-foreground"><a href={`mailto:${selected.email}`} className="hover:text-primary transition-colors">{selected.email}</a></p>
                </div>
                {selected.phone && (
                  <div className="space-y-0.5">
                    <span className="text-xs text-muted-foreground">Phone</span>
                    <p className="font-medium text-foreground"><a href={`tel:${selected.phone}`} className="hover:text-primary transition-colors">{selected.phone}</a></p>
                  </div>
                )}
                <div className="space-y-0.5">
                  <span className="text-xs text-muted-foreground">Subject</span>
                  <p className="font-medium text-foreground">{selected.subject || "—"}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs text-muted-foreground">Last Updated</span>
                  <p className="font-medium text-foreground">{new Date(selected.updated_at).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Message</p>
                <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg whitespace-pre-wrap">{selected.message}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <Select value={selected.status} onValueChange={(v) => updateStatus(selected.id, v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Internal Notes</p>
                <Textarea value={notesValue} onChange={(e) => setNotesValue(e.target.value)} placeholder="Add internal notes..." rows={3} />
                <Button size="sm" variant="outline" className="mt-2" onClick={saveNotes}>Save Notes</Button>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild><a href={`mailto:${selected.email}`}><Mail size={14} className="mr-1" /> Email</a></Button>
                  {selected.phone && <Button variant="outline" size="sm" asChild><a href={`tel:${selected.phone}`}><Phone size={14} className="mr-1" /> Call</a></Button>}
                </div>
                <Button variant="destructive" size="sm" onClick={() => deleteLead(selected.id)}>
                  <Trash2 size={14} className="mr-1" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadsManager;
