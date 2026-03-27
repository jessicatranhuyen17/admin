import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-svh flex items-center justify-center p-8">
      <Card className="lux-card max-w-md w-full rounded-3xl p-6">
        <h1 className="text-2xl">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The route you requested does not exist.</p>
        <div className="mt-5 flex gap-2">
          <Button onClick={() => setLocation("/app/dashboard")}>Go to dashboard</Button>
          <Button variant="outline" onClick={() => setLocation("/login")}>Login</Button>
        </div>
      </Card>
    </div>
  );
}
