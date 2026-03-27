/*
Quiet Luxury / Editorial Minimalism
- Sidebar + topbar admin shell
- Brass accent for actions
*/

import { Link, useLocation } from "wouter";
import {
  BadgePercent,
  BedDouble,
  Bell,
  CalendarDays,
  ChevronDown,
  CreditCard,
  Gauge,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Receipt,
  Settings,
  Shield,
  Tags,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHotelInit } from "@/hooks/use-hotel-init";
import { Skeleton } from "@/components/ui/skeleton";

export type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_MAIN: NavItem[] = [
  { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/app/bookings", icon: CalendarDays },
  { label: "Rooms", href: "/app/rooms", icon: BedDouble },
  { label: "Customers", href: "/app/customers", icon: Users },
  { label: "Payments", href: "/app/payments", icon: CreditCard },
];

const NAV_OPERATIONS: NavItem[] = [
  { label: "Reviews", href: "/app/reviews", icon: MessageSquareText },
  { label: "Staff & Roles", href: "/app/staff", icon: Shield },
  { label: "Promotions", href: "/app/promotions", icon: BadgePercent },
  { label: "CMS", href: "/app/cms", icon: Receipt },
  { label: "Settings", href: "/app/settings", icon: Settings },
];

function getBreadcrumb(pathname: string) {
  // /app/bookings/123 → ["App", "Bookings", "123"]
  const parts = pathname.replace(/^\/#?/, "").split("/").filter(Boolean);
  const normalized = parts.length ? parts : ["app", "dashboard"];
  const segments = normalized.map((p) => ({
    raw: p,
    label: p
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase()),
  }));
  return segments;
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const crumb = getBreadcrumb(location);
  const initialized = useHotelInit();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="lux-noise min-h-svh w-full">
        <Sidebar collapsible="icon" variant="inset">
          <SidebarHeader className="gap-2">
            <div className="flex items-center gap-2 px-2 pt-1">
              <div className="h-9 w-9 rounded-xl bg-primary/15 ring-1 ring-primary/25 grid place-items-center">
                <Gauge className="h-4.5 w-4.5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">Artisan Lakeview</div>
                <div className="truncate text-xs text-muted-foreground">Admin Console</div>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-[11px] tracking-[0.18em] uppercase">Core</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV_MAIN.map((item) => {
                    const active = location === item.href || location.startsWith(item.href + "/");
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                          <Link href={item.href}>
                            <Icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-[11px] tracking-[0.18em] uppercase">Operations</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV_OPERATIONS.map((item) => {
                    const active = location === item.href || location.startsWith(item.href + "/");
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                          <Link href={item.href}>
                            <Icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="gap-2">
            <div className="px-2 pb-2">
              <div className="rounded-xl lux-hairline bg-sidebar-accent/40 p-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/15 text-primary">AD</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">Admin</div>
                    <div className="truncate text-xs text-muted-foreground">admin@hotel.local</div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-lg">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={toggleTheme}>
                        <Tags className="h-4 w-4" />
                        <span>Toggle theme</span>
                        <span className="ml-auto text-xs text-muted-foreground">{theme}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => {
                          logout();
                          window.location.hash = "#/login";
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-20 bg-background/70 backdrop-blur-xl">
            <div className="flex items-center gap-3 px-4 py-3">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-6" />

              <Breadcrumb>
                <BreadcrumbList>
                  {crumb.map((c, idx) => {
                    const isLast = idx === crumb.length - 1;
                    const href = "#/" + crumb.slice(0, idx + 1).map((x) => x.raw).join("/");
                    return (
                      <div key={href} className="contents">
                        <BreadcrumbItem>
                          {isLast ? (
                            <BreadcrumbPage className="max-w-[30ch] truncate">{c.label}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink href={href}>{c.label}</BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {!isLast && <BreadcrumbSeparator />}
                      </div>
                    );
                  })}
                </BreadcrumbList>
              </Breadcrumb>

              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="outline"
                  className={cn(
                    "hidden sm:inline-flex rounded-xl",
                    "border-border/70 bg-background/60"
                  )}
                  onClick={() => alert("Quick action placeholder")}
                >
                  <Receipt className="h-4 w-4" />
                  Create invoice
                </Button>

                <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => alert("Notifications placeholder")}
                >
                  <Bell className="h-5 w-5" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="rounded-xl border-border/70 bg-background/60">
                      <Avatar className="h-7 w-7 mr-2">
                        <AvatarFallback className="bg-primary/15 text-primary">AD</AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline">Admin</span>
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={toggleTheme}>
                      <Tags className="h-4 w-4" />
                      Toggle theme
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => {
                        logout();
                        window.location.hash = "#/login";
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <Separator />
          </header>

          <main className="px-4 py-6">
            <div className="mx-auto max-w-[1400px]">
              {initialized ? (
                children
              ) : (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-[260px]" />
                  <div className="grid gap-3 md:grid-cols-4">
                    <Skeleton className="h-28 rounded-3xl" />
                    <Skeleton className="h-28 rounded-3xl" />
                    <Skeleton className="h-28 rounded-3xl" />
                    <Skeleton className="h-28 rounded-3xl" />
                  </div>
                  <Skeleton className="h-72 rounded-3xl" />
                </div>
              )}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
