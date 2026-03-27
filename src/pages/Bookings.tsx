import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Download, Pencil, XCircle, Eye } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import type { Booking, BookingStatus, PaymentStatus } from "@/lib/models";
import { toCsv, downloadText } from "@/lib/export";
import { formatDate, formatDateRange, formatMoney, useDebouncedValue } from "@/lib/format";
import { useHotelStore } from "@/stores/hotelStore";

function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge
      variant={status === "confirmed" ? "default" : status === "pending" ? "outline" : "destructive"}
      className="rounded-xl"
    >
      {status}
    </Badge>
  );
}

export default function BookingsPage() {
  const bookings = useHotelStore((s) => s.bookings);
  const rooms = useHotelStore((s) => s.rooms);
  const customers = useHotelStore((s) => s.customers);
  const upsertBooking = useHotelStore((s) => s.upsertBooking);
  const cancelBooking = useHotelStore((s) => s.cancelBooking);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<BookingStatus | "all">("all");
  const [pay, setPay] = useState<PaymentStatus | "all">("all");
  const [sortKey, setSortKey] = useState<"createdAt" | "total">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const debounced = useDebouncedValue(query, 250);

  const maps = useMemo(() => {
    return {
      roomById: new Map(rooms.map((r) => [r.id, r] as const)),
      customerById: new Map(customers.map((c) => [c.id, c] as const)),
    };
  }, [rooms, customers]);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();

    let rows = bookings
      .map((b) => ({
        ...b,
        customer: maps.customerById.get(b.customerId),
        room: maps.roomById.get(b.roomId),
      }))
      .filter((b) => {
        if (status !== "all" && b.status !== status) return false;
        if (pay !== "all" && b.paymentStatus !== pay) return false;
        if (!q) return true;
        return (
          b.id.toLowerCase().includes(q) ||
          (b.customer?.name ?? "").toLowerCase().includes(q) ||
          (b.customer?.email ?? "").toLowerCase().includes(q) ||
          (b.room?.number ?? "").toLowerCase().includes(q) ||
          b.roomType.toLowerCase().includes(q)
        );
      });

    rows.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "createdAt") return dir * a.createdAt.localeCompare(b.createdAt);
      return dir * (a.total - b.total);
    });

    return rows;
  }, [bookings, debounced, maps, pay, sortDir, sortKey, status]);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editing = useMemo(
    () => (editingId ? bookings.find((b) => b.id === editingId) ?? null : null),
    [bookings, editingId]
  );

  const exportCsv = () => {
    const rows = filtered.map((b) => ({
      id: b.id,
      guest: maps.customerById.get(b.customerId)?.name ?? "",
      room: maps.roomById.get(b.roomId)?.number ?? "",
      roomType: b.roomType,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      status: b.status,
      paymentStatus: b.paymentStatus,
      total: b.total,
      createdAt: b.createdAt,
    }));

    downloadText(`bookings_${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows));
    toast.success("Exported CSV");
  };

  const openDetail = (b: Booking) => {
    setEditingId(b.id);
    setOpen(true);
  };

  const update = async (patch: Partial<Booking>) => {
    if (!editing) return;
    await upsertBooking({ id: editing.id, ...patch });
    toast.success("Booking updated");
  };

  const cancel = async () => {
    if (!editing) return;
    await cancelBooking(editing.id);
    toast.success("Booking cancelled");
  };

  const activeRoom = editing ? maps.roomById.get(editing.roomId) : undefined;
  const activeCustomer = editing ? maps.customerById.get(editing.customerId) : undefined;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl">Booking Management</h1>
          <p className="mt-2 text-sm text-muted-foreground">Search, filter, view, edit, cancel, export.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl" onClick={exportCsv}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button className="rounded-xl" onClick={() => toast("Coming soon: create booking")}>New booking</Button>
        </div>
      </div>

      <Card className="lux-card rounded-3xl p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 rounded-xl"
              placeholder="Search guest, room, booking id…"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <Label className="text-xs text-muted-foreground">Filters</Label>
            </div>

            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
              <SelectTrigger className="w-[150px] rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={pay} onValueChange={(v) => setPay(v as any)}>
              <SelectTrigger className="w-[160px] rounded-xl">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={`${sortKey}:${sortDir}`} onValueChange={(v) => {
              const [k, d] = v.split(":");
              setSortKey(k as any);
              setSortDir(d as any);
            }}>
              <SelectTrigger className="w-[190px] rounded-xl">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt:desc">Newest first</SelectItem>
                <SelectItem value="createdAt:asc">Oldest first</SelectItem>
                <SelectItem value="total:desc">Highest total</SelectItem>
                <SelectItem value="total:asc">Lowest total</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="py-2 text-left font-medium">Guest</th>
                <th className="py-2 text-left font-medium">Room</th>
                <th className="py-2 text-left font-medium">Dates</th>
                <th className="py-2 text-left font-medium">Status</th>
                <th className="py-2 text-right font-medium">Total</th>
                <th className="py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => {
                const guest = maps.customerById.get(b.customerId);
                const room = maps.roomById.get(b.roomId);
                return (
                  <tr key={b.id} className="border-b border-border/30 last:border-0">
                    <td className="py-3">
                      <div className="font-medium">{guest?.name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{guest?.email ?? ""}</div>
                    </td>
                    <td className="py-3">
                      <div className="font-medium">{room?.number ?? "—"} · {b.roomType}</div>
                      <div className="text-xs text-muted-foreground">Booked {formatDate(b.createdAt)}</div>
                    </td>
                    <td className="py-3 text-muted-foreground">{formatDateRange(b.checkIn, b.checkOut)}</td>
                    <td className="py-3">
                      <StatusBadge status={b.status} />
                      <div className="mt-1 text-xs text-muted-foreground">{b.paymentStatus}</div>
                    </td>
                    <td className="py-3 text-right font-medium" style={{ fontFamily: "IBM Plex Sans" }}>
                      {formatMoney(b.total)}
                    </td>
                    <td className="py-3 text-right">
                      <Button variant="outline" size="sm" className="rounded-xl" onClick={() => openDetail(b)}>
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          Showing <span className="text-foreground">{filtered.length}</span> of {bookings.length} bookings
        </div>
      </Card>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setEditingId(null);
        }}
      >
        <DialogTrigger className="hidden" />
        <DialogContent className="max-w-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "Playfair Display" }}>Booking detail</DialogTitle>
          </DialogHeader>

          {editing ? (
            <div className="space-y-4">
              <Card className="lux-card rounded-2xl p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <div className="text-xs tracking-[0.18em] uppercase text-muted-foreground">Guest</div>
                    <div className="mt-1 font-medium">{activeCustomer?.name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{activeCustomer?.email ?? ""}</div>
                  </div>
                  <div>
                    <div className="text-xs tracking-[0.18em] uppercase text-muted-foreground">Room</div>
                    <div className="mt-1 font-medium">{activeRoom?.number ?? "—"} · {editing.roomType}</div>
                    <div className="text-xs text-muted-foreground">Status: {activeRoom?.status ?? ""}</div>
                  </div>
                  <div>
                    <div className="text-xs tracking-[0.18em] uppercase text-muted-foreground">Dates</div>
                    <div className="mt-1 text-sm">{formatDateRange(editing.checkIn, editing.checkOut)}</div>
                  </div>
                  <div>
                    <div className="text-xs tracking-[0.18em] uppercase text-muted-foreground">Total</div>
                    <div className="mt-1 text-sm font-medium" style={{ fontFamily: "IBM Plex Sans" }}>{formatMoney(editing.total)}</div>
                  </div>
                </div>
              </Card>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editing.status} onValueChange={(v) => update({ status: v as BookingStatus })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Payment</Label>
                  <Select value={editing.paymentStatus} onValueChange={(v) => update({ paymentStatus: v as PaymentStatus })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="destructive" className="rounded-xl" onClick={cancel}>
                  <XCircle className="h-4 w-4" />
                  Cancel booking
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    toast("Edit form placeholder");
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  Edit details
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
