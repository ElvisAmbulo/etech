import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Shield, Send, Copy, X, Check, Link } from "lucide-react";
import SiteInfoEditor from "@/components/admin/SiteInfoEditor";
import RolePermissionsEditor from "@/components/admin/RolePermissionsEditor";

interface ManagedUser {
  id: string;
  email: string;
  created_at: string;
  roles: string[];
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  token: string;
  created_at: string;
  expires_at: string;
}

const AdminSettings = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [inviteSending, setInviteSending] = useState(false);
  const [lastInviteUrl, setLastInviteUrl] = useState("");
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [editRole, setEditRole] = useState("user");

  const callManageUsers = async (body: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await supabase.functions.invoke("manage-users", {
      body,
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (res.error) throw new Error(res.error.message);
    return res.data;
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [userData, inviteData] = await Promise.all([
        callManageUsers({ action: "list" }),
        callManageUsers({ action: "list_invites" }),
      ]);
      setUsers(userData.users ?? []);
      setInvitations(inviteData.invitations ?? []);
    } catch (err: any) {
      toast({ title: "Error loading users", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => { if (hasPermission("manage_users")) fetchUsers(); }, []);

  const changePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Password updated" }); setNewPassword(""); }
  };

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast({ title: "Email is required", variant: "destructive" });
      return;
    }
    setInviteSending(true);
    try {
      const data = await callManageUsers({
        action: "invite",
        email: inviteEmail,
        role: inviteRole,
        siteUrl: window.location.origin,
      });
      const inviteUrl = data.inviteUrl || `${window.location.origin}/accept-invite?token=${data.token}`;
      setLastInviteUrl(inviteUrl);
      toast({
        title: "Invitation sent!",
        description: `An invitation email has been sent to ${inviteEmail}. You can also copy the link below.`,
      });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setInviteSending(false);
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied to clipboard!" });
  };

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      await callManageUsers({ action: "revoke_invite", invite_id: inviteId });
      toast({ title: "Invitation revoked" });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleUpdateRole = async () => {
    if (!editingUser) return;
    try {
      await callManageUsers({ action: "update_role", user_id: editingUser.id, role: editRole });
      toast({ title: "Role updated" });
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.id) { toast({ title: "Cannot delete yourself", variant: "destructive" }); return; }
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await callManageUsers({ action: "delete", user_id: userId });
      toast({ title: "User deleted" });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const roleBadgeColor = (role: string) => {
    if (role === "admin") return "destructive";
    if (role === "moderator") return "default";
    return "secondary";
  };

  const pendingInvites = invitations.filter((inv) => inv.status === "pending");

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>

      {/* Account */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Account</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <p className="text-sm font-medium text-foreground">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Change Password</label>
            <div className="flex gap-2">
              <Input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <Button onClick={changePassword} size="sm">Update</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Site Info */}
      {hasPermission("manage_settings") && <SiteInfoEditor />}

      {/* User Management */}
      {hasPermission("manage_users") && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2"><Shield size={18} /> User Management</CardTitle>
              <Button size="sm" onClick={() => { setShowInvite(true); setLastInviteUrl(""); setInviteEmail(""); setInviteRole("user"); }}>
                <Send size={14} className="mr-1" /> Invite User
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {pendingInvites.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Pending Invitations</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingInvites.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium text-sm">{inv.email}</TableCell>
                        <TableCell><Badge variant={roleBadgeColor(inv.role) as any} className="text-xs">{inv.role}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(inv.expires_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyLink(`${window.location.origin}/accept-invite?token=${inv.token}`)} title="Copy invite link">
                              <Copy size={13} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleRevokeInvite(inv.id)} title="Revoke">
                              <X size={13} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {loading ? (
              <p className="text-sm text-muted-foreground">Loading users...</p>
            ) : (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Active Users</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium text-sm">
                          {u.email}
                          {u.id === user?.id && <span className="text-xs text-muted-foreground ml-1">(you)</span>}
                        </TableCell>
                        <TableCell>
                          {u.roles.length > 0 ? u.roles.map((r) => (
                            <Badge key={r} variant={roleBadgeColor(r) as any} className="mr-1 text-xs">{r}</Badge>
                          )) : <span className="text-xs text-muted-foreground">No role</span>}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingUser(u); setEditRole(u.roles[0] || "user"); }}>
                              <Pencil size={13} />
                            </Button>
                            {u.id !== user?.id && (
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteUser(u.id)}>
                                <Trash2 size={13} />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {hasPermission("manage_permissions") && <RolePermissionsEditor />}

      {/* Invite User Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>An invitation email will be sent automatically. You can also copy the link to share manually.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!lastInviteUrl ? (
              <>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                  <Input type="email" placeholder="user@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Role</label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleInvite} className="w-full" disabled={inviteSending}>
                  {inviteSending ? "Sending..." : <><Send size={14} className="mr-1" /> Send Invitation</>}
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <Check size={16} className="text-emerald-600 shrink-0" />
                  <p className="text-sm text-emerald-700">Invitation sent to {inviteEmail}!</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
                    <Link size={12} /> Invite Link
                  </label>
                  <div className="flex gap-2">
                    <Input value={lastInviteUrl} readOnly className="text-xs" />
                    <Button size="sm" variant="outline" onClick={() => copyLink(lastInviteUrl)}>
                      <Copy size={14} />
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Share this link if the email doesn't arrive. Expires in 7 days.</p>
                </div>
                <Button variant="outline" className="w-full" onClick={() => { setLastInviteUrl(""); setInviteEmail(""); }}>
                  Invite Another User
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role — {editingUser?.email}</DialogTitle>
            <DialogDescription>Change the role for this user.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={editRole} onValueChange={setEditRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleUpdateRole} className="w-full">Save Role</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSettings;
