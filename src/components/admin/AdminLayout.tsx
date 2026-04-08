import { Navigate, Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "@/hooks/useAuth";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminLayout = () => {
  const { user, loading, sessionWarning, dismissWarning } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          {sessionWarning && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-600" />
                <p className="text-sm text-amber-700">Your session will expire soon due to inactivity.</p>
              </div>
              <Button size="sm" variant="outline" onClick={dismissWarning} className="text-xs h-7">
                Stay Signed In
              </Button>
            </div>
          )}
          <header className="h-14 flex items-center border-b border-border bg-background px-4">
            <SidebarTrigger className="mr-4" />
            <span className="font-display text-sm font-semibold text-foreground">eTech Softwares Admin</span>
          </header>
          <main className="flex-1 p-6 bg-background overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
