import { LayoutDashboard, MessageSquare, FolderOpen, Package, Quote, FileText, BarChart3, LogOut, Settings, Wrench, Users } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions, PermissionKey } from "@/hooks/usePermissions";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface MenuItem {
  title: string;
  url: string;
  icon: any;
  permission?: PermissionKey;
}

const mainItems: MenuItem[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Leads", url: "/admin/leads", icon: MessageSquare, permission: "manage_leads" },
  { title: "Projects", url: "/admin/projects", icon: FolderOpen, permission: "manage_projects" },
  { title: "Products", url: "/admin/products", icon: Package, permission: "manage_products" },
  { title: "Services", url: "/admin/services", icon: Wrench, permission: "manage_services" },
  { title: "Team", url: "/admin/team", icon: Users, permission: "manage_team" },
  { title: "Testimonials", url: "/admin/testimonials", icon: Quote, permission: "manage_testimonials" },
  { title: "Content", url: "/admin/content", icon: FileText, permission: "manage_content" },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3, permission: "view_analytics" },
  { title: "Settings", url: "/admin/settings", icon: Settings, permission: "manage_settings" },
];

const AdminSidebar = () => {
  const { state, setOpenMobile, isMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { hasPermission } = usePermissions();

  // Auto-close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [location.pathname, isMobile, setOpenMobile]);

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const visibleItems = mainItems.filter((item) => !item.permission || hasPermission(item.permission));

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {!collapsed && <span className="font-display text-sm font-bold text-primary">eTech Admin</span>}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className={`hover:bg-muted/50 ${isActive(item.url) ? "bg-primary/10 text-primary font-medium" : ""}`}
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {!collapsed && user && <p className="text-xs text-muted-foreground px-3 mb-2 truncate">{user.email}</p>}
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          {!collapsed && "Sign Out"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
