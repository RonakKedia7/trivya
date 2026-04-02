"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/theme-toggle";
import { useEffect, useState } from "react";
import { Appointment, Doctor } from "@/lib/types";
import { appointmentsService, doctorsService } from "@/lib/api";
import type { DoctorDashboardStats } from "@/lib/api";
import { Loader2 } from "lucide-react";

const TODAY = new Date().toISOString().split("T")[0];

export default function DoctorDashboard() {
  const { user } = useAuth();

  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [stats, setStats] = useState<DoctorDashboardStats | null>(null);
  const [todayApts, setTodayApts] = useState<Appointment[]>([]);
  const [upcomingApts, setUpcomingApts] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    doctorsService.getById(user.id).then((docRes) => {
      if (docRes.success && docRes.data) {
        setCurrentDoctor(docRes.data);
        Promise.all([
          appointmentsService.getDoctorStats(docRes.data.id, TODAY),
          appointmentsService.getMine(user, { date: TODAY }),
          appointmentsService.getMine(user, { status: "scheduled" }),
        ]).then(([statsRes, todayRes, upcomingRes]) => {
          if (statsRes.success) setStats(statsRes.data);
          if (todayRes.success) setTodayApts(todayRes.data);
          if (upcomingRes.success)
            setUpcomingApts(upcomingRes.data.slice(0, 5));
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-chart-1/10 text-chart-1";
      case "completed":
        return "bg-success/10 text-success";
      case "cancelled":
        return "bg-destructive/10 text-destructive";
      case "in-progress":
        return "bg-warning/10 text-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading || !currentDoctor) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome, {currentDoctor.name}
          </h1>
          <p className="text-muted-foreground">
            {currentDoctor.specialization} - {currentDoctor.department}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Today's Appointments",
            value: stats?.todayAppointments ?? 0,
            color: "chart-1",
          },
          {
            label: "Upcoming",
            value: stats?.upcomingAppointments ?? 0,
            color: "warning",
          },
          {
            label: "Completed",
            value: stats?.completedAppointments ?? 0,
            color: "success",
          },
          {
            label: "Total Patients",
            value: stats?.totalPatients ?? 0,
            color: "chart-2",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-3xl font-bold text-foreground">
                  {value}
                </p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full bg-${color}/10`}
              >
                <svg
                  className={`h-6 w-6 text-${color}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Appointments */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold text-foreground">
              Today&apos;s Appointments
            </h2>
            <Link
              href="/doctor/appointments"
              className="cursor-pointer text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {todayApts.length > 0 ? (
            <div className="divide-y divide-border">
              {todayApts.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-2/10 text-sm font-medium text-chart-2">
                      {apt.patientName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {apt.patientName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {apt.time} - {apt.reason}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(apt.status)}`}
                  >
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              No appointments scheduled for today.
            </div>
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold text-foreground">
              Upcoming Appointments
            </h2>
            <Link
              href="/doctor/appointments"
              className="cursor-pointer text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {upcomingApts.length > 0 ? (
            <div className="divide-y divide-border">
              {upcomingApts.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-2/10 text-sm font-medium text-chart-2">
                      {apt.patientName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {apt.patientName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {apt.date} at {apt.time}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(apt.status)}`}
                  >
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              No upcoming appointments.
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          {
            href: "/doctor/availability",
            label: "Manage Availability",
            sublabel: "Update your schedule",
            color: "chart-1",
          },
          {
            href: "/doctor/medical-records",
            label: "Medical Records",
            sublabel: "Create new records",
            color: "chart-2",
          },
          {
            href: "/doctor/history",
            label: "Patient History",
            sublabel: "View all patients",
            color: "success",
          },
        ].map(({ href, label, sublabel, color }) => (
          <Link
            key={href}
            href={href}
            className="flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:bg-secondary/50"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${color}/10`}
            >
              <svg
                className={`h-6 w-6 text-${color}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-foreground">{label}</h3>
              <p className="text-sm text-muted-foreground">{sublabel}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
