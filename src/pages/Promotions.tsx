import { useMemo, useState } from "react";
import { BadgePercent, Plus, Power, Pencil } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import type { Promo } from "@/lib/models";
import { useHotelStore } from "@/stores/hotelStore";

export default function PromotionsPage() {
  const promos = useHotelStore((s) => s.promos);
  const upsertPromo = useHotelStore((s) => s.upsertPromo);
  const togglePromo = useHotelStore((s) => s.togglePromo);

  const sorted = useMemo(() => [...promos].sort((a, b) => a.code.localeCompare(b.code)), [promos]);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = useMemo(() => (editingId ? promos.find((p) => p.id === editingId) ?? null : null), [editingId, promos]);

  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);

  const openCreate = () => {
    setEditingId(null);
    setCode("");
    setDiscountPercent(10);
    setDescription("");
    setActive(true);
    setOpen(true);
  };

  const openEdit = (p: Promo) => {
    setEditingId(p.id);
    setCode(p.code);
    setDiscountPercent(p.discountPercent);
    setDescription(p.description);
    setActive(p.active);
    setOpen(true);
  };

  const save = async () => {
    await upsertPromo({ id: editingId ?? undefined, code: code.trim().toUpperCase(), discountPercent: Number(discountPercent), description, active });
    toast.success(editingId ? "Promotion updated" : "Promotion created");
    setOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl">Promotions & Discounts</h1>
          <p className="mt-2 text-sm text-muted-foreground">Promo codes, discount rules, campaign toggles.</p>
        </div>
        <Button className="rounded-xl" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Create promo
        </Button>
      </div>

      <Card className="lux-card rounded-3xl p-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl">Promo codes</h2>
            <p className="mt-1 text-xs text-muted-foreground">Backend-ready structure (constraints & usage limits can be added later)</p>
          </div>
          <Badge variant="outline" className="rounded-xl border-border/70 bg-background/60">{sorted.length} codes</Badge>
        </div>

        <Separator className="my-3" />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="py-2 text-left font-medium">Code</th>
                <th className="py-2 text-left font-medium">Discount</th>
                <th className="py-2 text-left font-medium">Description</th>
                <th className="py-2 text-left font-medium">Active</th>
                <th className="py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => (
                <tr key={p.id} className="border-b border-border/30 last:border-0">
                  <td className="py-3">
                    <div className="font-medium" style={{ fontFamily: "IBM Plex Sans" }}>{p.code}</div>
                  </td>
                  <td className="py-3">
                    <Badge className="rounded-xl bg-primary text-primary-foreground">
                      <BadgePercent className="h-3.5 w-3.5" />
                      {p.discountPercent}%
                    </Badge>
                  </td>
                  <td className="py-3 text-muted-foreground">{p.description}</td>
                  <td className="py-3">
                    <Switch checked={p.active} onCheckedChange={() => togglePromo(p.id)} />
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" className="rounded-xl" onClick={() => openEdit(p)}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-xl" onClick={() => togglePromo(p.id)}>
                        <Power className="h-4 w-4" />
                        Toggle
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
        <DialogContent className="max-w-xl rounded-3xl">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "Playfair Display" }}>{editing ? "Edit promo" : "Create promo"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input className="rounded-xl" value={code} onChange={(e) => setCode(e.target.value)} placeholder="LAKEVIEW10" />
              </div>
              <div className="space-y-2">
                <Label>Discount (%)</Label>
                <Input className="rounded-xl" type="number" value={discountPercent} onChange={(e) => setDiscountPercent(Number(e.target.value))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea className="rounded-2xl" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short rule / notes…" />
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/40 px-3 py-2">
              <div>
                <div className="text-sm font-medium">Active</div>
                <div className="text-xs text-muted-foreground">Enable this code for checkout</div>
              </div>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>

            <Separator />

            <div className="flex justify-end gap-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="rounded-xl" onClick={save} disabled={!code.trim()}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
