import { useMemo, useState } from "react";
import { CreditCard, Download, FileText, PieChart as PieIcon } from "lucide-react";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import type { PaymentStatus, Transaction } from "@/lib/models";
import { formatDate, formatMoney } from "@/lib/format";
import { toCsv, downloadText } from "@/lib/export";
import { useHotelStore } from "@/stores/hotelStore";

const PIE_COLORS = ["var(--primary)", "oklch(0.65 0.11 35)", "oklch(0.72 0.12 130)"];

function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge
      variant={status === "paid" ? "default" : status === "pending" ? "outline" : "destructive"}
      className="rounded-xl"
    >
      {status}
    </Badge>
  );
}

export default function PaymentsPage() {
  const bookings = useHotelStore((s) => s.bookings);
  const customers = useHotelStore((s) => s.customers);
  const rooms = useHotelStore((s) => s.rooms);
  const transactions = useHotelStore((s) => s.transactions);

  const [status, setStatus] = useState<PaymentStatus | "all">("all");
  const [method, setMethod] = useState<Transaction["method"] | "all">("all");

  const maps = useMemo(() => {
    return {
      bookingById: new Map(bookings.map((b) => [b.id, b] as const)),
      customerById: new Map(customers.map((c) => [c.id, c] as const)),
      roomById: new Map(rooms.map((r) => [r.id, r] as const)),
    };
  }, [bookings, customers, rooms]);

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => (status === "all" ? true : t.status === status))
      .filter((t) => (method === "all" ? true : t.method === method))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [method, status, transactions]);

  const monthBreakdown = useMemo(() => {
    const monthKey = new Date().toISOString().slice(0, 7);
    const sums = new Map<string, number>([
      ["card", 0],
      ["cash", 0],
      ["online", 0],
    ]);
    for (const t of transactions) {
      if (t.status !== "paid") continue;
      if (t.createdAt.slice(0, 7) !== monthKey) continue;
      sums.set(t.method, (sums.get(t.method) ?? 0) + t.amount);
    }
    const data = Array.from(sums.entries()).map(([name, value]) => ({ name, value }));
    const total = data.reduce((s, x) => s + x.value, 0);
    return { data, total };
  }, [transactions]);

  const exportCsv = () => {
    downloadText(
      `transactions_${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(
        filtered.map((t) => ({
          id: t.id,
          bookingId: t.bookingId,
          amount: t.amount,
          method: t.method,
          status: t.status,
          createdAt: t.createdAt,
        }))
      )
    );
    toast.success("Exported CSV");
  };

  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceBookingId, setInvoiceBookingId] = useState<string>(bookings[0]?.id ?? "");
  const invoiceBooking = maps.bookingById.get(invoiceBookingId);
  const invoiceCustomer = invoiceBooking ? maps.customerById.get(invoiceBooking.customerId) : undefined;
  const invoiceRoom = invoiceBooking ? maps.roomById.get(invoiceBooking.roomId) : undefined;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl">Payment Management</h1>
          <p className="mt-2 text-sm text-muted-foreground">Transactions, statuses, breakdown, and invoice UI.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl" onClick={exportCsv}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button className="rounded-xl" onClick={() => setInvoiceOpen(true)}>
            <FileText className="h-4 w-4" />
            Generate invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[0.95fr_1.35fr]">
        <Card className="lux-card rounded-3xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl">Revenue breakdown</h2>
              <p className="mt-1 text-xs text-muted-foreground">Paid revenue this month</p>
            </div>
            <Badge variant="outline" className="rounded-xl border-border/70 bg-background/60">
              <PieIcon className="h-3.5 w-3.5" />
              {formatMoney(monthBreakdown.total)}
            </Badge>
          </div>
          <Separator className="my-3" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  formatter={(v: any) => formatMoney(Number(v))}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                  }}
                />
                <Pie
                  data={monthBreakdown.data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {monthBreakdown.data.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid gap-2">
            {monthBreakdown.data.map((d, idx) => (
              <div key={d.name} className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/40 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <span className="text-sm font-medium capitalize">{d.name}</span>
                </div>
                <span className="text-sm" style={{ fontFamily: "IBM Plex Sans" }}>{formatMoney(d.value)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lux-card rounded-3xl p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl">Transactions</h2>
              <p className="mt-1 text-xs text-muted-foreground">Filter by status and payment method</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                  <SelectTrigger className="w-[160px] rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Method</Label>
                <Select value={method} onValueChange={(v) => setMethod(v as any)}>
                  <SelectTrigger className="w-[160px] rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator className="my-3" />

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b border-border/60">
                  <th className="py-2 text-left font-medium">Booking</th>
                  <th className="py-2 text-left font-medium">Method</th>
                  <th className="py-2 text-left font-medium">Status</th>
                  <th className="py-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const b = maps.bookingById.get(t.bookingId);
                  const c = b ? maps.customerById.get(b.customerId) : undefined;
                  return (
                    <tr key={t.id} className="border-b border-border/30 last:border-0">
                      <td className="py-3">
                        <div className="font-medium">{c?.name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">
                          {t.bookingId} · {formatDate(t.createdAt)}
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge variant="outline" className="rounded-xl capitalize">{t.method}</Badge>
                      </td>
                      <td className="py-3"><StatusBadge status={t.status} /></td>
                      <td className="py-3 text-right font-medium" style={{ fontFamily: "IBM Plex Sans" }}>{formatMoney(t.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3 text-xs text-muted-foreground">Showing {filtered.length} transactions</div>
        </Card>
      </div>

      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogTrigger className="hidden" />
        <DialogContent className="max-w-3xl rounded-3xl">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "Playfair Display" }}>Invoice</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2 sm:grid-cols-[220px_1fr] sm:items-end">
              <div className="space-y-2">
                <Label>Booking</Label>
                <Select value={invoiceBookingId} onValueChange={setInvoiceBookingId}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select booking" /></SelectTrigger>
                  <SelectContent>
                    {bookings.slice(0, 30).map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.id}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-xs text-muted-foreground">
                Tip: This is a UI generator for a backend-ready invoice flow.
              </div>
            </div>

            <Card className="lux-card rounded-3xl p-5">
              {invoiceBooking ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs tracking-[0.18em] uppercase text-muted-foreground">Invoice</div>
                      <div className="mt-1 text-2xl">{invoiceBooking.id}</div>
                      <div className="mt-1 text-xs text-muted-foreground">Issued {formatDate(new Date().toISOString())}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs tracking-[0.18em] uppercase text-muted-foreground">Total</div>
                      <div className="mt-1 text-xl font-semibold" style={{ fontFamily: "IBM Plex Sans" }}>{formatMoney(invoiceBooking.total)}</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="text-xs tracking-[0.18em] uppercase text-muted-foreground">Billed to</div>
                      <div className="mt-1 text-sm font-medium">{invoiceCustomer?.name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{invoiceCustomer?.email ?? ""}</div>
                    </div>
                    <div>
                      <div className="text-xs tracking-[0.18em] uppercase text-muted-foreground">Stay</div>
                      <div className="mt-1 text-sm font-medium">{invoiceRoom?.number ?? "—"} · {invoiceBooking.roomType}</div>
                      <div className="text-xs text-muted-foreground">{invoiceBooking.checkIn.slice(0, 10)} → {invoiceBooking.checkOut.slice(0, 10)}</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="rounded-2xl border border-border/50 bg-background/40 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Accommodation</span>
                      <span style={{ fontFamily: "IBM Plex Sans" }}>{formatMoney(invoiceBooking.total)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Payment status</span>
                      <span className="capitalize">{invoiceBooking.paymentStatus}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Select a booking to generate an invoice.</div>
              )}
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setInvoiceOpen(false)}>
                Close
              </Button>
              <Button
                className="rounded-xl"
                onClick={() => {
                  window.print();
                  toast.success("Print dialog opened");
                }}
              >
                <CreditCard className="h-4 w-4" />
                Print / Save PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
