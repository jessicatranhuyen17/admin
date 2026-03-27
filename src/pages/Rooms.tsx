import { useMemo, useState } from "react";
import { Plus, Trash2, Pencil, Upload, CalendarDays } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";

import type { Room, RoomStatus, RoomType } from "@/lib/models";
import { formatMoney, formatDate } from "@/lib/format";
import { useHotelStore } from "@/stores/hotelStore";

function StatusBadge({ status }: { status: RoomStatus }) {
  const variant = status === "available" ? "default" : status === "occupied" ? "outline" : "destructive";
  return (
    <Badge variant={variant as any} className="rounded-xl">
      {status}
    </Badge>
  );
}

export default function RoomsPage() {
  const rooms = useHotelStore((s) => s.rooms);
  const bookings = useHotelStore((s) => s.bookings);
  const upsertRoom = useHotelStore((s) => s.upsertRoom);
  const deleteRoom = useHotelStore((s) => s.deleteRoom);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editing = useMemo(() => (editingId ? rooms.find((r) => r.id === editingId) ?? null : null), [rooms, editingId]);

  const [number, setNumber] = useState("");
  const [type, setType] = useState<RoomType>("Standard");
  const [price, setPrice] = useState<number>(180);
  const [status, setStatus] = useState<RoomStatus>("available");
  const [floor, setFloor] = useState<number>(1);
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const openCreate = () => {
    setEditingId(null);
    setNumber("");
    setType("Standard");
    setPrice(180);
    setStatus("available");
    setFloor(1);
    setNotes("");
    setImages([]);
    setOpen(true);
  };

  const openEdit = (r: Room) => {
    setEditingId(r.id);
    setNumber(r.number);
    setType(r.type);
    setPrice(r.pricePerNight);
    setStatus(r.status);
    setFloor(r.floor ?? 1);
    setNotes(r.notes ?? "");
    setImages(r.images ?? []);
    setOpen(true);
  };

  const save = async () => {
    await upsertRoom({
      id: editingId ?? undefined,
      number,
      type,
      pricePerNight: Number(price),
      status,
      floor: Number(floor),
      notes,
      images,
    });
    toast.success(editingId ? "Room updated" : "Room added");
    setOpen(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this room?")) return;
    await deleteRoom(id);
    toast.success("Room deleted");
  };

  const onUpload = (files: FileList | null) => {
    if (!files?.length) return;
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...urls]);
    toast.success("Images attached (stored locally)");
  };

  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date());

  const availability = useMemo(() => {
    const d = calendarDate ? new Date(calendarDate) : new Date();
    const dayStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const overlaps = (checkInIso: string, checkOutIso: string) => {
      const start = new Date(checkInIso);
      const end = new Date(checkOutIso);
      return start < dayEnd && end > dayStart;
    };

    const bookedRoomIds = new Set(
      bookings
        .filter((b) => b.status !== "cancelled" && overlaps(b.checkIn, b.checkOut))
        .map((b) => b.roomId)
    );

    return rooms.map((r) => ({
      room: r,
      isBooked: bookedRoomIds.has(r.id),
    }));
  }, [bookings, calendarDate, rooms]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl">Room Management</h1>
          <p className="mt-2 text-sm text-muted-foreground">Inventory, pricing, status, images, and a simple availability view.</p>
        </div>
        <Button className="rounded-xl" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add room
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.4fr_0.9fr]">
        <Card className="lux-card rounded-3xl p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl">Rooms</h2>
            <div className="text-xs text-muted-foreground">{rooms.length} total</div>
          </div>
          <Separator className="my-3" />

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {rooms.map((r) => (
              <Card key={r.id} className="lux-card rounded-3xl overflow-hidden">
                <div className="h-32 bg-muted relative">
                  {r.images?.[0] ? (
                    <img src={r.images[0]} alt={r.type} className="absolute inset-0 h-full w-full object-cover" />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-tr from-background/80 via-background/20 to-transparent" />
                  <div className="absolute left-3 top-3 flex items-center gap-2">
                    <StatusBadge status={r.status} />
                    <Badge variant="outline" className="rounded-xl border-border/70 bg-background/60">
                      {r.type}
                    </Badge>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs tracking-[0.18em] uppercase text-muted-foreground">Room</div>
                      <div className="mt-1 text-lg font-semibold" style={{ fontFamily: "IBM Plex Sans" }}>{r.number}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs tracking-[0.18em] uppercase text-muted-foreground">Price</div>
                      <div className="mt-1 text-sm font-medium" style={{ fontFamily: "IBM Plex Sans" }}>{formatMoney(r.pricePerNight)}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">Floor {r.floor ?? "—"}</div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="rounded-xl" onClick={() => openEdit(r)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" className="rounded-xl" onClick={() => remove(r.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        <Card className="lux-card rounded-3xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl">Availability</h2>
              <p className="mt-1 text-xs text-muted-foreground">Select a date to see booked rooms (based on bookings).</p>
            </div>
            <Badge variant="outline" className="rounded-xl border-border/70 bg-background/60">
              <CalendarDays className="h-3.5 w-3.5" />
              {calendarDate ? formatDate(calendarDate.toISOString()) : "—"}
            </Badge>
          </div>
          <Separator className="my-3" />

          <div className="grid gap-4">
            <Calendar mode="single" selected={calendarDate} onSelect={setCalendarDate} className="rounded-2xl border border-border/60" />

            <div className="space-y-2">
              {availability.map(({ room, isBooked }) => (
                <div key={room.id} className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/40 px-3 py-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{room.number} · {room.type}</div>
                    <div className="text-xs text-muted-foreground">{formatMoney(room.pricePerNight)} / night</div>
                  </div>
                  <Badge variant={isBooked ? "destructive" : "default"} className="rounded-xl">
                    {isBooked ? "Booked" : "Open"}
                  </Badge>
                </div>
              ))}
            </div>
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
        <DialogContent className="max-w-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "Playfair Display" }}>{editing ? "Edit room" : "Add room"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Room number</Label>
                <Input className="rounded-xl" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="e.g. 504" />
              </div>
              <div className="space-y-2">
                <Label>Floor</Label>
                <Input className="rounded-xl" type="number" value={floor} onChange={(e) => setFloor(Number(e.target.value))} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as RoomType)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Deluxe">Deluxe</SelectItem>
                    <SelectItem value="Suite">Suite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as RoomStatus)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price / night</Label>
                <Input className="rounded-xl" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea className="rounded-2xl" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Maintenance details, special notes…" />
            </div>

            <div className="space-y-2">
              <Label>Images</Label>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" className="rounded-xl" asChild>
                  <label>
                    <Upload className="h-4 w-4" />
                    Upload
                    <input className="hidden" type="file" multiple accept="image/*" onChange={(e) => onUpload(e.target.files)} />
                  </label>
                </Button>
                <div className="text-xs text-muted-foreground">{images.length} attached</div>
              </div>

              {images.length ? (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((src) => (
                    <div key={src} className="relative overflow-hidden rounded-2xl border border-border/60">
                      <img src={src} alt="Room" className="h-20 w-full object-cover" />
                      <button
                        className="absolute right-1 top-1 rounded-lg bg-background/70 px-2 py-1 text-xs"
                        onClick={() => setImages((prev) => prev.filter((x) => x !== src))}
                        type="button"
                      >
                        remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <Separator />

            <div className="flex justify-end gap-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button className="rounded-xl" onClick={save} disabled={!number.trim()}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
