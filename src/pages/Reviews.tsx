import { useMemo, useState } from "react";
import { Eye, EyeOff, Star } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { formatDate } from "@/lib/format";
import { useHotelStore } from "@/stores/hotelStore";

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            "h-4 w-4 " + (i < value ? "text-primary fill-primary" : "text-muted-foreground")
          }
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const reviews = useHotelStore((s) => s.reviews);
  const customers = useHotelStore((s) => s.customers);
  const setReviewVisibility = useHotelStore((s) => s.setReviewVisibility);

  const customerById = useMemo(() => new Map(customers.map((c) => [c.id, c] as const)), [customers]);

  const [filter, setFilter] = useState<"all" | "visible" | "hidden">("all");

  const rows = useMemo(() => {
    const base = [...reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return base.filter((r) => (filter === "all" ? true : filter === "visible" ? r.visible : !r.visible));
  }, [filter, reviews]);

  const toggle = async (id: string, visible: boolean) => {
    await setReviewVisibility(id, visible);
    toast.success(visible ? "Review approved" : "Review hidden");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl">Review & Feedback</h1>
          <p className="mt-2 text-sm text-muted-foreground">Moderate guest reviews and ratings.</p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
            <SelectTrigger className="w-[180px] rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All reviews</SelectItem>
              <SelectItem value="visible">Visible</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="lux-card rounded-3xl p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Guest reviews</h2>
          <Badge variant="outline" className="rounded-xl border-border/70 bg-background/60">{rows.length} items</Badge>
        </div>

        <Separator className="my-3" />

        <div className="space-y-2">
          {rows.map((r) => {
            const c = customerById.get(r.customerId);
            return (
              <div key={r.id} className="rounded-3xl border border-border/50 bg-background/40 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-medium truncate">{c?.name ?? "Guest"}</div>
                      <Badge variant={r.visible ? "default" : "outline"} className="rounded-xl">
                        {r.visible ? "Visible" : "Hidden"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                    </div>
                    <div className="mt-2"><Stars value={r.rating} /></div>
                    <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                  </div>

                  <div className="flex gap-2">
                    {r.visible ? (
                      <Button variant="outline" className="rounded-xl" onClick={() => toggle(r.id, false)}>
                        <EyeOff className="h-4 w-4" />
                        Hide
                      </Button>
                    ) : (
                      <Button className="rounded-xl" onClick={() => toggle(r.id, true)}>
                        <Eye className="h-4 w-4" />
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {!rows.length ? (
            <div className="rounded-3xl border border-border/50 bg-background/40 p-4 text-sm text-muted-foreground">
              No reviews in this filter.
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
