/*
Quiet Luxury / Editorial Minimalism
- Auth: local-first (mock JWT token in localStorage)
*/

import * as React from "react";
import { useLocation } from "wouter";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Manager" | "Staff";
};

type AuthContextValue = {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "had_token";

function readUserFromToken(token: string | null): AuthUser | null {
  if (!token) return null;
  // For demo purposes token is just a string; we map it to a user.
  return {
    id: "u_admin_01",
    name: "Admin",
    email: "admin@hotel.local",
    role: "Super Admin",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(() =>
    readUserFromToken(localStorage.getItem(STORAGE_KEY))
  );

  const login = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 600));
    if (!email || !password) throw new Error("Missing credentials");
    localStorage.setItem(STORAGE_KEY, "demo_token");
    setUser(readUserFromToken("demo_token"));
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (!user) setLocation("/login");
  }, [user, setLocation]);

  if (!user) return null;
  return <>{children}</>;
}
