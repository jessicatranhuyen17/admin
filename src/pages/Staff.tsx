import { useMemo, useState } from "react";
import { Plus, ShieldCheck, UserCog, UserMinus } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import type { Staff, StaffRole } from "@/lib/models";
import { useHotelStore } from "@/stores/hotelStore";

const PERMISSIONS: Record<StaffRole, string[]> = {
  "Super Admin": [
    "Dashboard",
    "Bookings (full)",
    "Rooms (full)",
    "Customers (full)",
    "Payments (full)",
    "Reviews (moderate)",
    "Staff & RBAC",
    "Promotions",
    "CMS",
    "Settings",
  ],
  Manager: [
    "Dashboard",
    "Bookings (full)",
    "Rooms (full)",
    "Customers (view/edit)",
    "Payments (view)",
    "Reviews (moderate)",
    "Promotions",
  ],
  Staff: ["Dashboard (view)", "Bookings (view)", "Rooms (view)", "Customers (view)"],
};

function RoleBadge({ role }: { role: StaffRole }) {
  return (
    <Badge variant={role === "Super Admin" ? "default" : "outline"} className="rounded-xl">
      {role}
    </Badge>
  );
}

export default function StaffPage() {
  const staff = useHotelStore((s) => s.staff);
  const upsertStaff = useHotelStore((s) => s.upsertStaff);
  const deactivateStaff = useHotelStore((s) => s.deactivateStaff);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = useMemo(() => (editingId ? staff.find((s) => s.id === editingId) ?? null : null), [editingId, staff]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("Staff");

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setRole("Staff");
    setOpen(true);
  };

  const openEdit = (s: Staff) => {
    setEditingId(s.id);
    setName(s.name);
    setEmail(s.email);
    setRole(s.role);
    setOpen(true);
  };

  const save = async () => {
    await upsertStaff({ id: editingId ?? undefined, name, email, role, active: true });
    toast.success(editingId ? "Staff updated" : "Staff added");
    setOpen(false);
  };

  const deactivate = async (id: string) => {
    if (!confirm("Deactivate this staff account?")) return;
    await deactivateStaff(id);
    toast.success("Account deactivated");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl">Staff Management</h1>
          <p className="mt-2 text-sm text-muted-foreground">Admin roles, permissions (RBAC), and staff accounts.</p>
        </div>
        <Button className="rounded-xl" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add staff
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="lux-card rounded-3xl p-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl">Accounts</h2>
              <p className="mt-1 text-xs text-muted-foreground">Local-first demo accounts (JWT-ready structure)</p>
            </div>
            <Badge variant="outline" className="rounded-xl border-border/70 bg-background/60">{staff.length} total</Badge>
          </div>

          <Separator className="my-3" />

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b border-border/60">
                  <th className="py-2 text-left font-medium">Staff</th>
                  <th className="py-2 text-left font-medium">Role</th>
                  <th className="py-2 text-left font-medium">Status</th>
                  <th className="py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id} className="border-b border-border/30 last:border-0">
                    <td className="py-3">
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.email}</div>
                    </td>
                    <td className="py-3"><RoleBadge role={s.role} /></td>
                    <td className="py-3">
                      <Badge variant={s.active ? "default" : "destructive"} className="rounded-xl">
                        {s.active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => openEdit(s)}>
                          <UserCog className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" className="rounded-xl" onClick={() => deactivate(s.id)} disabled={!s.active}>
                          <UserMinus className="h-4 w-4" />
                          Deactivate
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="lux-card rounded-3xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl">RBAC</h2>
              <p className="mt-1 text-xs text-muted-foreground">Permissions overview by role</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <Separator className="my-3" />

          <div className="space-y-3">
            {(Object.keys(PERMISSIONS) as StaffRole[]).map((r) => (
              <div key={r} className="rounded-3xl border border-border/50 bg-background/40 p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{r}</div>
                  <RoleBadge role={r} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {PERMISSIONS[r].map((p) => (
                    <Badge key={p} variant="outline" className="rounded-xl">{p}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setEditingId(null);
        }}
      >
        <DialogTrigger className="hidden" />
        <DialogContent className="max-w-xl rounded-3xl">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "Playfair Display" }}>{editing ? "Edit staff" : "Add staff"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input className="rounded-xl" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input className="rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as StaffRole)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Super Admin">Super Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex justify-end gap-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button className="rounded-xl" onClick={save} disabled={!name.trim() || !email.trim()}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
