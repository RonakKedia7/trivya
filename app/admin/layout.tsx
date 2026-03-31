"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  Calendar,
  User,
  LogOut,
  Menu,
  X,
  Activity,
} from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/admin/patients", label: "Patients", icon: Users },
  { href: "/admin/appointments", label: "Appointments", icon: Calendar },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/login");
    }
  }, [user, isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Activity className="h-8 w-8 animate-pulse text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="flex h-screen bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-card transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex size-16 items-center justify-center rounded-lg">
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

        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
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

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-6 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex size-16 items-center justify-center rounded-lg">
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

        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
