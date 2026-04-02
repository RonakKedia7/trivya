"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

const PUBLIC_ROUTES = new Set<string>(["/", "/login", "/register"]);

function getDashboardPath(role: string | undefined) {
  switch (role) {
    case "admin":
      return "/admin";
    case "doctor":
      return "/doctor";
    case "patient":
      return "/patient";
    default:
      return "/login";
  }
}

function getRequiredRoleForPath(
  pathname: string,
): "admin" | "doctor" | "patient" | null {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return "admin";
  if (pathname === "/doctor" || pathname.startsWith("/doctor/"))
    return "doctor";
  if (pathname === "/patient" || pathname.startsWith("/patient/"))
    return "patient";
  return null;
}

export function RouteGuard({ children }: { children: ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const pathname = usePathname() || "/";
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const requiredRole = getRequiredRoleForPath(pathname);

    if (requiredRole) {
      if (!isAuthenticated) {
        router.replace("/login");
        return;
      }

      if (user?.role !== requiredRole) {
        router.replace(getDashboardPath(user?.role));
        return;
      }

      return;
    }

    if (PUBLIC_ROUTES.has(pathname) && isAuthenticated) {
      if (pathname === "/login" || pathname === "/register") {
        router.replace(getDashboardPath(user?.role));
      }
    }
  }, [isAuthenticated, isLoading, pathname, router, user?.role]);

  return children;
}
