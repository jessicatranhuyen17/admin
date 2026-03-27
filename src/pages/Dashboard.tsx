import { useMemo } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, BedDouble, CalendarDays, DollarSign, Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHotelStore } from "@/stores/hotelStore";
import { formatDate, formatMoney, formatDateRange } from "@/lib/format";

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

export default function DashboardPage() {
  const rooms = useHotelStore((s) => s.rooms);
  const customers = useHotelStore((s) => s.customers);
  const bookings = useHotelStore((s) => s.bookings);
  const transactions = useHotelStore((s) => s.transactions);
  const getKpis = useHotelStore((s) => s.getKpis);

  const kpis = getKpis();

  const bookingTrend = useMemo(() => {
    const now = new Date();
    const days = 30;
    const map = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const d = new Date(now);
      d.setUTCDate(d.getUTCDate() - (days - 1 - i));
      map.set(d.toISOString().slice(0, 10), 0);
    }
    for (const b of bookings) {
      const k = dayKey(b.createdAt);
      if (map.has(k)) map.set(k, (map.get(k) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([date, count]) => ({ date: date.slice(5), count }));
  }, [bookings]);

  const revenueTrend = useMemo(() => {
    const now = new Date();
    const days = 14;
    const map = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const d = new Date(now);
      d.setUTCDate(d.getUTCDate() - (days - 1 - i));
      map.set(d.toISOString().slice(0, 10), 0);
    }
    for (const t of transactions) {
      if (t.status !== "paid") continue;
      const k = dayKey(t.createdAt);
      if (map.has(k)) map.set(k, (map.get(k) ?? 0) + t.amount);
    }
    return Array.from(map.entries()).map(([date, revenue]) => ({ date: date.slice(5), revenue }));
  }, [transactions]);

  const recentBookings = useMemo(() => {
    const byId = new Map(customers.map((c) => [c.id, c] as const));
    const roomsById = new Map(rooms.map((r) => [r.id, r] as const));
    return [...bookings]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 8)
      .map((b) => ({
        ...b,
        customer: byId.get(b.customerId),
        room: roomsById.get(b.roomId),
      }));
  }, [bookings, customers, rooms]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl">Dashboard Overview</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            High-level performance, bookings flow, and revenue signals—kept intentionally calm.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl" onClick={() => window.print()}>
            Export snapshot
          </Button>
          <Button className="rounded-xl" onClick={() => alert("Connect to API placeholder")}>Connect API</Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card className="lux-card rounded-3xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs tracking-[0.18em] uppercase text-muted-foreground">Total bookings</div>
              <div className="mt-2 text-2xl font-semibold" style={{ fontFamily: "IBM Plex Sans" }}>
                {kpis.totalBookings.toLocaleString()}
              </div>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-primary/15 ring-1 ring-primary/25 grid place-items-center">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <ArrowUpRight className="h-4 w-4 text-primary" />
            Trend view below
          </div>
        </Card>

        <Card className="lux-card rounded-3xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs tracking-[0.18em] uppercase text-muted-foreground">Revenue (month)</div>
              <div className="mt-2 text-2xl font-semibold" style={{ fontFamily: "IBM Plex Sans" }}>
                {formatMoney(kpis.revenueMonthly)}
              </div>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-primary/15 ring-1 ring-primary/25 grid place-items-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Paid transactions only</div>
        </Card>

        <Card className="lux-card rounded-3xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs tracking-[0.18em] uppercase text-muted-foreground">Occupancy</div>
              <div className="mt-2 text-2xl font-semibold" style={{ fontFamily: "IBM Plex Sans" }}>
                {Math.round(kpis.occupancyRate * 100)}%
              </div>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-primary/15 ring-1 ring-primary/25 grid place-items-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Based on room statuses</div>
        </Card>

        <Card className="lux-card rounded-3xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs tracking-[0.18em] uppercase text-muted-foreground">Available rooms</div>
              <div className="mt-2 text-2xl font-semibold" style={{ fontFamily: "IBM Plex Sans" }}>
                {kpis.availableRooms}
              </div>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-primary/15 ring-1 ring-primary/25 grid place-items-center">
              <BedDouble className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Out of {rooms.length} rooms</div>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="lux-card rounded-3xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl">Booking trend</h2>
              <p className="mt-1 text-xs text-muted-foreground">Last 30 days</p>
            </div>
            <Badge variant="outline" className="rounded-xl border-border/70 bg-background/60">Daily count</Badge>
          </div>
          <Separator className="my-3" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bookingTrend} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="luxArea" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(1 0 0 / 12%)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="var(--primary)" fill="url(#luxArea)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lux-card rounded-3xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl">Revenue analytics</h2>
              <p className="mt-1 text-xs text-muted-foreground">Last 14 days</p>
            </div>
            <Badge variant="outline" className="rounded-xl border-border/70 bg-background/60">Paid</Badge>
          </div>
          <Separator className="my-3" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueTrend} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid stroke="oklch(1 0 0 / 12%)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={42} />
                <Tooltip
                  formatter={(v: any) => formatMoney(Number(v))}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                  }}
                />
                <Bar dataKey="revenue" fill="var(--primary)" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="lux-card rounded-3xl p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl">Recent bookings</h2>
            <p className="mt-1 text-xs text-muted-foreground">Latest activity across all channels</p>
          </div>
          <Button variant="outline" className="rounded-xl" asChild>
            <a href="#/app/bookings">Open bookings</a>
          </Button>
        </div>
        <Separator className="my-3" />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="py-2 text-left font-medium">Guest</th>
                <th className="py-2 text-left font-medium">Room</th>
                <th className="py-2 text-left font-medium">Dates</th>
                <th className="py-2 text-left font-medium">Status</th>
                <th className="py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b.id} className="border-b border-border/30 last:border-0">
                  <td className="py-3">
                    <div className="font-medium">{b.customer?.name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(b.createdAt)}</div>
                  </td>
                  <td className="py-3">
                    <div className="font-medium">
                      {b.room?.number ?? "—"} · {b.roomType}
                    </div>
                    <div className="text-xs text-muted-foreground">{b.room?.status ?? ""}</div>
                  </td>
                  <td className="py-3 text-muted-foreground">{formatDateRange(b.checkIn, b.checkOut)}</td>
                  <td className="py-3">
                    <Badge
                      variant={b.status === "confirmed" ? "default" : b.status === "pending" ? "outline" : "destructive"}
                      className="rounded-xl"
                    >
                      {b.status}
                    </Badge>
                    <div className="mt-1 text-xs text-muted-foreground">{b.paymentStatus}</div>
                  </td>
                  <td className="py-3 text-right font-medium" style={{ fontFamily: "IBM Plex Sans" }}>
                    {formatMoney(b.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
