"use client";

import { useEffect, useMemo, useState, use } from "react";
import Link from "next/link";
import { Doctor, WeeklySchedule, TimeSlot } from "@/lib/types";
import { doctorsService, appointmentsService } from "@/lib/api";
import { Loader2 } from "lucide-react";

const defaultTimeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
];

export default function DoctorDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [schedule, setSchedule] = useState<WeeklySchedule>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      doctorsService.getById(id),
      doctorsService.getAvailability(id),
      appointmentsService.getAll({ doctorId: id, limit: 100 }),
    ]).then(([docRes, availRes, aptRes]) => {
      if (docRes.success) setDoctor(docRes.data);
      if (availRes.success) setSchedule(availRes.data);
      if (aptRes.success)
        setAppointments(aptRes.data.filter((a: any) => a.doctorId === id));
      setIsLoading(false);
    });
  }, [id]);

  const toggleDayWorking = (dayIndex: number) => {
    if (!isEditingSchedule) return;
    const newSchedule = [...schedule];
    const day = newSchedule[dayIndex];
    day.isWorking = !day.isWorking;

    if (day.isWorking && day.slots.length === 0) {
      day.slots = defaultTimeSlots.reduce((acc, time, i) => {
        if (i % 2 === 0 && defaultTimeSlots[i + 1]) {
          acc.push({
            startTime: time,
            endTime: defaultTimeSlots[i + 1],
            isAvailable: true,
          });
        }
        return acc;
      }, [] as TimeSlot[]);
    }
    setSchedule(newSchedule);
  };

  const toggleSlot = (dayIndex: number, slotIndex: number) => {
    if (!isEditingSchedule) return;
    const newSchedule = [...schedule];
    newSchedule[dayIndex].slots[slotIndex].isAvailable =
      !newSchedule[dayIndex].slots[slotIndex].isAvailable;
    setSchedule(newSchedule);
  };

  const handleSaveSchedule = async () => {
    setIsSaving(true);
    const res = await doctorsService.updateAvailability(id, { schedule });
    if (res.success) {
      setSchedule(res.data);
      setIsEditingSchedule(false);
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold text-foreground">Doctor Not Found</h1>
        <Link
          href="/admin/doctors"
          className="mt-4 cursor-pointer text-primary hover:underline"
        >
          Back to Doctors
        </Link>
      </div>
    );
  }

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
      <Link
        href="/admin/doctors"
        className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Doctors
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Doctor Info Card */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                {doctor.name.charAt(0)}
              </div>
              <h1 className="mt-4 text-xl font-bold text-foreground">
                {doctor.name}
              </h1>
              <p className="text-muted-foreground">{doctor.specialization}</p>
              <span className="mt-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {doctor.department}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm text-foreground">{doctor.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="text-sm text-foreground">{doctor.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
                <span className="text-sm text-foreground">
                  {doctor.qualification}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 text-muted-foreground"
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
                <span className="text-sm text-foreground">
                  {doctor.experience} years experience
                </span>
              </div>
              <div className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm text-foreground">
                  ${doctor.consultationFee} per visit
                </span>
              </div>
            </div>

            <div className="mt-6 border-t border-border pt-6">
              <h3 className="font-medium text-foreground">About</h3>
              <p className="mt-2 text-sm text-muted-foreground">{doctor.bio}</p>
            </div>
          </div>
        </div>

        {/* Appointments & Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Schedule */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Weekly Availability
              </h2>
              {isEditingSchedule ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditingSchedule(false)}
                    className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSchedule}
                    disabled={isSaving}
                    className="cursor-pointer rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save Schedule"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingSchedule(true)}
                  className="cursor-pointer rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
                >
                  Edit Schedule
                </button>
              )}
            </div>

            <div className="grid gap-2">
              {schedule.map((day, dayIndex) => (
                <div
                  key={day.day}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between rounded-lg px-4 py-3 ${isEditingSchedule ? "bg-secondary/30 border border-border/50" : "bg-secondary/50"}`}
                >
                  <div className="flex items-center gap-4 mb-2 sm:mb-0">
                    <span className="font-medium text-foreground w-24">
                      {day.day}
                    </span>
                    {isEditingSchedule && (
                      <button
                        onClick={() => toggleDayWorking(dayIndex)}
                        className={`cursor-pointer rounded-full px-2 py-1 text-xs font-medium transition-colors ${day.isWorking ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}
                      >
                        {day.isWorking ? "Working" : "Day Off"}
                      </button>
                    )}
                  </div>

                  {day.isWorking ? (
                    <div className="flex flex-wrap gap-2">
                      {day.slots.map((slot, slotIndex) => (
                        <button
                          key={slotIndex}
                          onClick={() => toggleSlot(dayIndex, slotIndex)}
                          disabled={!isEditingSchedule}
                          className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${isEditingSchedule ? "cursor-pointer hover:opacity-80" : ""} ${slot.isAvailable ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
                        >
                          {slot.startTime} - {slot.endTime}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {!isEditingSchedule && "Day Off"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Appointments */}
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">
                Assigned Appointments ({appointments.length})
              </h2>
            </div>
            {appointments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-secondary/30">
                        <td className="whitespace-nowrap px-6 py-4 font-medium text-foreground">
                          {apt.patientName}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                          {apt.date} at {apt.time}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {apt.reason}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(apt.status)}`}
                          >
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                No appointments found for this doctor.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
