import { useState } from "react";
import { ImageIcon, Save } from "lucide-react";
import { toast } from "sonner";

import heroImg from "@/assets/hotel/hero-lobby.webp";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useHotelStore } from "@/stores/hotelStore";

export default function CmsPage() {
  const cms = useHotelStore((s) => s.cms);
  const updateCms = useHotelStore((s) => s.updateCms);

  const [heroTitle, setHeroTitle] = useState(cms.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(cms.heroSubtitle);
  const [roomsIntro, setRoomsIntro] = useState(cms.roomsIntro);
  const [servicesIntro, setServicesIntro] = useState(cms.servicesIntro);
  const [galleryIntro, setGalleryIntro] = useState(cms.galleryIntro);

  const save = async () => {
    await updateCms({ heroTitle, heroSubtitle, roomsIntro, servicesIntro, galleryIntro });
    toast.success("CMS content saved");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl">Content Management</h1>
          <p className="mt-2 text-sm text-muted-foreground">Edit public-facing homepage sections (copy + media placeholders).</p>
        </div>
        <Button className="rounded-xl" onClick={save}>
          <Save className="h-4 w-4" />
          Save changes
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_0.95fr]">
        <Card className="lux-card rounded-3xl p-4">
          <h2 className="text-xl">Homepage copy</h2>
          <Separator className="my-3" />

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Hero title</Label>
              <Input className="rounded-xl" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Hero subtitle</Label>
              <Textarea className="rounded-2xl" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Rooms intro</Label>
              <Textarea className="rounded-2xl" value={roomsIntro} onChange={(e) => setRoomsIntro(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Services intro</Label>
              <Textarea className="rounded-2xl" value={servicesIntro} onChange={(e) => setServicesIntro(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Gallery intro</Label>
              <Textarea className="rounded-2xl" value={galleryIntro} onChange={(e) => setGalleryIntro(e.target.value)} />
            </div>

            <div className="rounded-3xl border border-border/50 bg-background/40 p-4 text-sm text-muted-foreground">
              Rich text editor + image/video library can be integrated later (e.g., TipTap, Lexical, or a headless CMS).
            </div>
          </div>
        </Card>

        <Card className="lux-card rounded-3xl overflow-hidden">
          <div className="relative h-56">
            <img src={heroImg} alt="Hero" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-tr from-background/85 via-background/40 to-background/15" />
            <div className="absolute bottom-5 left-5 right-5">
              <div className="flex items-center gap-2 text-xs tracking-[0.18em] uppercase text-muted-foreground">
                <ImageIcon className="h-4 w-4" />
                Preview
              </div>
              <h2 className="mt-2 text-2xl text-foreground">{heroTitle || "—"}</h2>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{heroSubtitle || "—"}</p>
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-xl">Rooms</h3>
            <p className="mt-2 text-sm text-muted-foreground">{roomsIntro || "—"}</p>
            <Separator className="my-3" />
            <h3 className="text-xl">Services</h3>
            <p className="mt-2 text-sm text-muted-foreground">{servicesIntro || "—"}</p>
            <Separator className="my-3" />
            <h3 className="text-xl">Gallery</h3>
            <p className="mt-2 text-sm text-muted-foreground">{galleryIntro || "—"}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
