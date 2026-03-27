import { useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { useHotelStore } from "@/stores/hotelStore";

export default function SettingsPage() {
  const settings = useHotelStore((s) => s.settings);
  const updateSettings = useHotelStore((s) => s.updateSettings);
  const reset = useHotelStore((s) => s.reset);

  const [hotelName, setHotelName] = useState(settings.hotelName);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [bookingPolicy, setBookingPolicy] = useState(settings.bookingPolicy);

  const [acceptCard, setAcceptCard] = useState(settings.paymentConfig.acceptCard);
  const [acceptCash, setAcceptCash] = useState(settings.paymentConfig.acceptCash);
  const [acceptOnline, setAcceptOnline] = useState(settings.paymentConfig.acceptOnline);

  const [nEmail, setNEmail] = useState(settings.notifications.email);
  const [nSms, setNSms] = useState(settings.notifications.sms);
  const [nInApp, setNInApp] = useState(settings.notifications.inApp);

  const save = async () => {
    await updateSettings({
      hotelName,
      address,
      phone,
      email,
      bookingPolicy,
      paymentConfig: { acceptCard, acceptCash, acceptOnline },
      notifications: { email: nEmail, sms: nSms, inApp: nInApp },
    });
    toast.success("Settings saved");
  };

  const resetAll = async () => {
    if (!confirm("Reset sample data back to seed?")) return;
    await reset();
    toast.success("Reset to seed data");
    // Refresh form values
    const next = useHotelStore.getState().settings;
    setHotelName(next.hotelName);
    setAddress(next.address);
    setPhone(next.phone);
    setEmail(next.email);
    setBookingPolicy(next.bookingPolicy);
    setAcceptCard(next.paymentConfig.acceptCard);
    setAcceptCash(next.paymentConfig.acceptCash);
    setAcceptOnline(next.paymentConfig.acceptOnline);
    setNEmail(next.notifications.email);
    setNSms(next.notifications.sms);
    setNInApp(next.notifications.inApp);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl">Settings</h1>
          <p className="mt-2 text-sm text-muted-foreground">Hotel info, policies, payment configuration, notification settings.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl" onClick={resetAll}>
            <RotateCcw className="h-4 w-4" />
            Reset seed data
          </Button>
          <Button className="rounded-xl" onClick={save}>
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="lux-card rounded-3xl p-4">
          <h2 className="text-xl">Hotel info</h2>
          <Separator className="my-3" />

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Hotel name</Label>
              <Input className="rounded-xl" value={hotelName} onChange={(e) => setHotelName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input className="rounded-xl" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input className="rounded-xl" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input className="rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="lux-card rounded-3xl p-4">
          <h2 className="text-xl">Booking policies</h2>
          <Separator className="my-3" />

          <div className="space-y-2">
            <Label>Policy text</Label>
            <Textarea className="rounded-2xl min-h-[210px]" value={bookingPolicy} onChange={(e) => setBookingPolicy(e.target.value)} />
            <div className="text-xs text-muted-foreground">Displayed to guests during checkout and in confirmation emails.</div>
          </div>
        </Card>

        <Card className="lux-card rounded-3xl p-4">
          <h2 className="text-xl">Payment configuration</h2>
          <Separator className="my-3" />

          <div className="grid gap-2">
            <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/40 px-3 py-2">
              <div>
                <div className="text-sm font-medium">Accept card</div>
                <div className="text-xs text-muted-foreground">Visa/Mastercard/Amex</div>
              </div>
              <Switch checked={acceptCard} onCheckedChange={setAcceptCard} />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/40 px-3 py-2">
              <div>
                <div className="text-sm font-medium">Accept cash</div>
                <div className="text-xs text-muted-foreground">On arrival / checkout</div>
              </div>
              <Switch checked={acceptCash} onCheckedChange={setAcceptCash} />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/40 px-3 py-2">
              <div>
                <div className="text-sm font-medium">Accept online</div>
                <div className="text-xs text-muted-foreground">Bank transfer / gateways</div>
              </div>
              <Switch checked={acceptOnline} onCheckedChange={setAcceptOnline} />
            </div>
          </div>
        </Card>

        <Card className="lux-card rounded-3xl p-4">
          <h2 className="text-xl">Notification settings</h2>
          <Separator className="my-3" />

          <div className="grid gap-2">
            <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/40 px-3 py-2">
              <div>
                <div className="text-sm font-medium">Email</div>
                <div className="text-xs text-muted-foreground">Invoices, confirmations, alerts</div>
              </div>
              <Switch checked={nEmail} onCheckedChange={setNEmail} />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/40 px-3 py-2">
              <div>
                <div className="text-sm font-medium">SMS</div>
                <div className="text-xs text-muted-foreground">High urgency only</div>
              </div>
              <Switch checked={nSms} onCheckedChange={setNSms} />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/40 px-3 py-2">
              <div>
                <div className="text-sm font-medium">In-app</div>
                <div className="text-xs text-muted-foreground">Realtime notifications panel (demo)</div>
              </div>
              <Switch checked={nInApp} onCheckedChange={setNInApp} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
