"use client";

import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import { useEffect, useState } from "react";
import { appointmentsService } from "@/lib/api";
import type { AdminDashboardStats } from "@/lib/api";

const TODAY = new Date().toISOString().split("T")[0];

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    appointmentsService.getAdminStats().then((res) => {
      if (res.success) setStats(res.data);
      setIsLoading(false);
    });
  }, []);

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

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Doctors</p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {stats.totalDoctors}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-1/10">
              <svg
                className="h-6 w-6 text-chart-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <Link
            href="/admin/doctors"
            className="mt-4 inline-flex cursor-pointer items-center text-sm text-primary hover:underline"
          >
            View all doctors
            <svg
              className="ml-1 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Patients</p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {stats.totalPatients}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-2/10">
              <svg
                className="h-6 w-6 text-chart-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
          <Link
            href="/admin/patients"
            className="mt-4 inline-flex cursor-pointer items-center text-sm text-primary hover:underline"
          >
            View all patients
            <svg
              className="ml-1 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Today&apos;s Appointments
              </p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {stats.todayAppointments}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-3/10">
              <svg
                className="h-6 w-6 text-chart-3"
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
          <Link
            href="/admin/appointments"
            className="mt-4 inline-flex cursor-pointer items-center text-sm text-primary hover:underline"
          >
            View all appointments
            <svg
              className="ml-1 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Pending Appointments
              </p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {stats.pendingAppointments}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
              <svg
                className="h-6 w-6 text-warning"
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
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {stats.completedAppointments} completed
          </p>
        </div>
      </div>

      {/* Recent Appointments Table */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Appointments
          </h2>
          <Link
            href="/admin/appointments"
            className="cursor-pointer text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Date &amp; Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.recentAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-secondary/30">
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-medium text-foreground">
                      {appointment.patientName}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                    {appointment.doctorName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                    {appointment.department}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                    {appointment.date} at {appointment.time}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(appointment.status)}`}
                    >
                      {appointment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {/* Doctors by Department */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground">
            Doctors by Department
          </h3>
          <div className="mt-4 space-y-3">
            {Object.entries(stats.doctorsByDepartment).map(([dept, count]) => (
              <div key={dept} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{dept}</span>
                <span className="text-sm font-medium text-foreground">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Appointment Status Overview */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground">
            Appointment Status
          </h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-chart-1"></span>
                <span className="text-sm text-muted-foreground">Scheduled</span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {stats.pendingAppointments}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-success"></span>
                <span className="text-sm text-muted-foreground">Completed</span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {stats.completedAppointments}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-destructive"></span>
                <span className="text-sm text-muted-foreground">Cancelled</span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {stats.cancelledAppointments}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
