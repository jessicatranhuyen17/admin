import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { toast } from "sonner";

import heroImg from "@/assets/hotel/hero-lobby.webp";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "admin@hotel.local", password: "admin" },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      toast.success("Welcome back.");
      setLocation("/app/dashboard");
    } catch (e: any) {
      toast.error(e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-svh lux-noise grid lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src={heroImg} alt="Hotel lobby" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-tr from-background/85 via-background/40 to-background/20" />
        <div className="absolute bottom-10 left-10 right-10">
          <h1 className="text-4xl text-foreground">Arrive softly.</h1>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Luxury operations, simplified. Manage bookings, rooms, revenue and guest experiences with calm precision.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <Card className="lux-card w-full max-w-md rounded-3xl p-6">
          <div className="space-y-1">
            <h2 className="text-2xl">Sign in</h2>
            <p className="text-sm text-muted-foreground">Use the demo credentials pre-filled below.</p>
          </div>

          <Separator className="my-5" />

          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input className="rounded-xl" placeholder="you@hotel.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input className="rounded-xl" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button className="w-full rounded-xl" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
