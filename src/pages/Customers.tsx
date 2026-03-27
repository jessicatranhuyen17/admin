import { useMemo, useState } from "react";
import { Search, UserRound, Crown, Tag } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import type { Customer } from "@/lib/models";
import { formatDateRange, formatMoney, useDebouncedValue } from "@/lib/format";
import { useHotelStore } from "@/stores/hotelStore";

function VipBadge({ level }: { level: Customer["vipLevel"] }) {
  if (level === "None") return <Badge variant="outline" className="rounded-xl">None</Badge>;
  return (
    <Badge className="rounded-xl bg-primary text-primary-foreground">
      <Crown className="h-3.5 w-3.5" />
      {level}
    </Badge>
  );
}

export default function CustomersPage() {
  const customers = useHotelStore((s) => s.customers);
  const bookings = useHotelStore((s) => s.bookings);
  const rooms = useHotelStore((s) => s.rooms);
  const upsertCustomer = useHotelStore((s) => s.upsertCustomer);

  const [query, setQuery] = useState("");
  const q = useDebouncedValue(query, 250).trim().toLowerCase();

  const roomsById = useMemo(() => new Map(rooms.map((r) => [r.id, r] as const)), [rooms]);

  const filtered = useMemo(() => {
    if (!q) return customers;
    return customers.filter((c) =>
      [c.name, c.email, c.phone, c.vipLevel, c.tags.join(" ")].join(" ").toLowerCase().includes(q)
    );
  }, [customers, q]);

  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = useMemo(
    () => (activeId ? customers.find((c) => c.id === activeId) ?? null : null),
    [activeId, customers]
  );

  const history = useMemo(() => {
    if (!active) return [];
    return bookings
      .filter((b) => b.customerId === active.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((b) => ({
        ...b,
        room: roomsById.get(b.roomId),
      }));
  }, [active, bookings, roomsById]);

  const openProfile = (c: Customer) => {
    setActiveId(c.id);
    setOpen(true);
  };

  const updateVip = async (vipLevel: Customer["vipLevel"]) => {
    if (!active) return;
    await upsertCustomer({ id: active.id, vipLevel });
    toast.success("Customer updated");
  };

  const addTag = async (tag: string) => {
    if (!active) return;
    const next = Array.from(new Set([...(active.tags ?? []), tag])).filter(Boolean);
    await upsertCustomer({ id: active.id, tags: next });
    toast.success("Tag added");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl">Customer Management</h1>
          <p className="mt-2 text-sm text-muted-foreground">Guest profiles, booking history, VIP segmentation.</p>
        </div>
        <Button className="rounded-xl" onClick={() => toast("Coming soon: add customer")}>Add customer</Button>
      </div>

      <Card className="lux-card rounded-3xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10 rounded-xl" placeholder="Search name, email, phone, tags…" />
        </div>
        <Separator className="my-4" />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="py-2 text-left font-medium">Guest</th>
                <th className="py-2 text-left font-medium">VIP</th>
                <th className="py-2 text-left font-medium">Tags</th>
                <th className="py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border/30 last:border-0">
                  <td className="py-3">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.email} · {c.phone}</div>
                  </td>
                  <td className="py-3"><VipBadge level={c.vipLevel} /></td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {(c.tags ?? []).length ? (c.tags ?? []).map((t) => (
                        <Badge key={t} variant="outline" className="rounded-xl">{t}</Badge>
                      )) : <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <Button variant="outline" className="rounded-xl" size="sm" onClick={() => openProfile(c)}>
                      <UserRound className="h-4 w-4" />
                      Profile
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-xs text-muted-foreground">Showing {filtered.length} customers</div>
      </Card>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setActiveId(null);
        }}
      >
        <DialogTrigger className="hidden" />
        <DialogContent className="max-w-3xl rounded-3xl">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "Playfair Display" }}>Customer profile</DialogTitle>
          </DialogHeader>

          {active ? (
            <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
              <Card className="lux-card rounded-3xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs tracking-[0.18em] uppercase text-muted-foreground">Guest</div>
                    <div className="mt-1 text-xl font-semibold" style={{ fontFamily: "IBM Plex Sans" }}>{active.name}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{active.email} · {active.phone}</div>
                  </div>
                  <VipBadge level={active.vipLevel} />
                </div>

                <Separator className="my-3" />

                <div className="space-y-2">
                  <Label>VIP level</Label>
                  <Select value={active.vipLevel} onValueChange={(v) => updateVip(v as any)}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="Silver">Silver</SelectItem>
                      <SelectItem value="Gold">Gold</SelectItem>
                      <SelectItem value="Platinum">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-4 space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-1">
                    {(active.tags ?? []).map((t) => (
                      <Badge key={t} variant="outline" className="rounded-xl">{t}</Badge>
                    ))}
                    {!(active.tags ?? []).length ? <span className="text-xs text-muted-foreground">No tags</span> : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      className="rounded-xl"
                      placeholder="Add tag (e.g. vip, quiet-floor)"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const val = (e.currentTarget.value ?? "").trim();
                          if (val) addTag(val);
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                    <Button variant="outline" className="rounded-xl" onClick={() => toast("Tip: press Enter to add")}
                    >
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="lux-card rounded-3xl p-4">
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="text-xl">Booking history</h3>
                    <p className="mt-1 text-xs text-muted-foreground">All bookings for this guest</p>
                  </div>
                  <Badge variant="outline" className="rounded-xl border-border/70 bg-background/60">{history.length} records</Badge>
                </div>
                <Separator className="my-3" />

                <div className="max-h-[380px] overflow-auto pr-1">
                  <div className="space-y-2">
                    {history.map((b) => (
                      <div key={b.id} className="rounded-2xl border border-border/50 bg-background/40 p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-sm font-medium">{b.room?.number ?? "—"} · {b.roomType}</div>
                            <div className="text-xs text-muted-foreground">{formatDateRange(b.checkIn, b.checkOut)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium" style={{ fontFamily: "IBM Plex Sans" }}>{formatMoney(b.total)}</div>
                            <div className="text-xs text-muted-foreground">{b.status} · {b.paymentStatus}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!history.length ? (
                      <div className="rounded-2xl border border-border/50 bg-background/40 p-4 text-sm text-muted-foreground">
                        No bookings yet.
                      </div>
                    ) : null}
                  </div>
                </div>
              </Card>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
