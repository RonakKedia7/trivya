"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { mockDoctors } from "@/lib/mock-data";
import ThemeToggle from "@/components/theme-toggle";
import { useEffect, useMemo, useState } from "react";
import { Appointment } from "@/lib/types";
import { getAppointments } from "@/lib/storage";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const today = "2026-03-30";
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Get current doctor data
  const currentDoctor =
    mockDoctors.find((d) => d.email === user?.email) || mockDoctors[0];
  
  useEffect(() => {
    setAppointments(getAppointments());
  }, []);

  const doctorAppointments = useMemo(
    () => appointments.filter((a) => a.doctorId === currentDoctor.id),
    [appointments, currentDoctor.id],
  );

  const todayAppointments = useMemo(
    () => doctorAppointments.filter((a) => a.date === today),
    [doctorAppointments, today],
  );

  const upcomingAppointments = useMemo(() => {
    return doctorAppointments
      .filter((a) => a.date >= today && a.status === "scheduled")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [doctorAppointments, today]);

  const completedAppointments = useMemo(
    () => doctorAppointments.filter((a) => a.status === "completed"),
    [doctorAppointments],
  );

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
        <div className="hidden lg:block">
          <ThemeToggle />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Today&apos;s Appointments
              </p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {todayAppointments.length}
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Upcoming</p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {upcomingAppointments.length}
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
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {completedAppointments.length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <svg
                className="h-6 w-6 text-success"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Patients</p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {new Set(doctorAppointments.map((a) => a.patientId)).size}
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
        </div>
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
          {todayAppointments.length > 0 ? (
            <div className="divide-y divide-border">
              {todayAppointments.map((apt) => (
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
          {upcomingAppointments.length > 0 ? (
            <div className="divide-y divide-border">
              {upcomingAppointments.slice(0, 5).map((apt) => (
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
        <Link
          href="/doctor/availability"
          className="flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:bg-secondary/50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-1/10">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-foreground">Manage Availability</h3>
            <p className="text-sm text-muted-foreground">
              Update your schedule
            </p>
          </div>
        </Link>

        <Link
          href="/doctor/medical-records"
          className="flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:bg-secondary/50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-foreground">Medical Records</h3>
            <p className="text-sm text-muted-foreground">Create new records</p>
          </div>
        </Link>

        <Link
          href="/doctor/history"
          className="flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:bg-secondary/50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
            <svg
              className="h-6 w-6 text-success"
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
          <div>
            <h3 className="font-medium text-foreground">Patient History</h3>
            <p className="text-sm text-muted-foreground">View all patients</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
