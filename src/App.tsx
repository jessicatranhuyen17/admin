import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, RequireAuth } from "@/contexts/AuthContext";

import { Router, Route, Switch, Redirect } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";

import AdminShell from "@/components/app/AdminShell";

import LoginPage from "@/pages/Login";
import DashboardPage from "@/pages/Dashboard";
import BookingsPage from "@/pages/Bookings";
import RoomsPage from "@/pages/Rooms";
import CustomersPage from "@/pages/Customers";
import PaymentsPage from "@/pages/Payments";
import ReviewsPage from "@/pages/Reviews";
import StaffPage from "@/pages/Staff";
import PromotionsPage from "@/pages/Promotions";
import CmsPage from "@/pages/Cms";
import SettingsPage from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

function AdminRoutes() {
  return (
    <RequireAuth>
      <AdminShell>
        <Switch>
          <Route path="/app">
            <Redirect to="/app/dashboard" />
          </Route>
          <Route path="/app/dashboard" component={DashboardPage} />
          <Route path="/app/bookings" component={BookingsPage} />
          <Route path="/app/rooms" component={RoomsPage} />
          <Route path="/app/customers" component={CustomersPage} />
          <Route path="/app/payments" component={PaymentsPage} />
          <Route path="/app/reviews" component={ReviewsPage} />
          <Route path="/app/staff" component={StaffPage} />
          <Route path="/app/promotions" component={PromotionsPage} />
          <Route path="/app/cms" component={CmsPage} />
          <Route path="/app/settings" component={SettingsPage} />
          <Route component={NotFound} />
        </Switch>
      </AdminShell>
    </RequireAuth>
  );
}

function AppRouter() {
  return (
    <Router hook={useHashLocation}>
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/app/:rest*" component={AdminRoutes} />
        <Route path="/">
          <Redirect to="/app/dashboard" />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <AppRouter />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
