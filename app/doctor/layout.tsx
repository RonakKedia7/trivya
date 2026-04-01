"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Calendar,
  Clock3,
  FileText,
  History,
  User,
  LogOut,
  Menu,
  X,
  Activity,
} from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";

const navItems = [
  { href: "/doctor", label: "Dashboard", icon: LayoutDashboard },
  { href: "/doctor/appointments", label: "Appointments", icon: Calendar },
  { href: "/doctor/availability", label: "Availability", icon: Clock3 },
  { href: "/doctor/medical-records", label: "Medical Records", icon: FileText },
  { href: "/doctor/history", label: "Patient History", icon: History },
  { href: "/doctor/profile", label: "My Profile", icon: User },
];

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mustChangePassword = Boolean(user?.mustChangePassword);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "doctor")) {
      router.push("/login");
      return;
    }
    if (!isLoading && user?.role === "doctor" && mustChangePassword && pathname !== "/doctor/profile") {
      router.push("/doctor/profile");
    }
  }, [user, isLoading, isAuthenticated, mustChangePassword, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Activity className="h-8 w-8 animate-pulse text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "doctor") {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 transform flex-col border-r border-border bg-card transition-transform duration-200 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link href="/doctor" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg">
              <img src="/logo.png" alt="Logo" />
            </div>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/doctor" && pathname.startsWith(item.href));
            const isBlocked = mustChangePassword && item.href !== "/doctor/profile";

            return (
              <Link
                key={item.href}
                href={isBlocked ? "#" : item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                } ${isBlocked ? "pointer-events-none opacity-50" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-6 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex h-10 w-10 items-center justify-center rounded-lg">
            <img src="/logo.png" alt="Logo" />
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>

            <span className="hidden text-sm font-medium text-foreground sm:inline">
              {user?.name}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {mustChangePassword && (
            <div className="mb-4 rounded-lg border border-amber-300 bg-amber-100/50 px-4 py-3 text-sm font-medium text-amber-900 dark:border-amber-600/40 dark:bg-amber-900/20 dark:text-amber-200">
              You must update your password before continuing.
            </div>
          )}
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
