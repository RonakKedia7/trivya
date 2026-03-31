"use client";

import { useAuth } from "@/context/AuthContext";
import { mockDoctors } from "@/lib/mock-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  FileText,
  Clock,
  User,
  ArrowRight,
  Activity,
} from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import { useEffect, useMemo, useState } from "react";
import { Appointment, MedicalRecord } from "@/lib/types";
import { getAppointments, getMedicalRecords } from "@/lib/storage";

export default function PatientDashboard() {
  const { user } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);

  useEffect(() => {
    setAppointments(getAppointments());
    setRecords(getMedicalRecords());
  }, []);

  const myAppointments = useMemo(
    () => appointments.filter((apt) => apt.patientId === user?.id),
    [appointments, user?.id],
  );

  const upcomingAppointments = myAppointments
    .filter((apt) => apt.status === "scheduled")
    .slice(0, 3);

  const myRecords = useMemo(
    () => records.filter((record) => record.patientId === user?.id),
    [records, user?.id],
  );

  const recentRecords = myRecords.slice(0, 3);

  const getDoctorName = (doctorId: string) => {
    const doctor = mockDoctors.find((d) => d.id === doctorId);
    return doctor ? `Dr. ${doctor.name}` : "Unknown Doctor";
  };

  const getDoctorSpecialization = (doctorId: string) => {
    const doctor = mockDoctors.find((d) => d.id === doctorId);
    return doctor?.specialization || "General";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.name}
          </h1>
          <p className="text-muted-foreground">
            Manage your health and appointments
          </p>
        </div>
        <div className="hidden lg:block">
          <ThemeToggle />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {upcomingAppointments.length}
            </div>
            <p className="text-xs text-muted-foreground">Scheduled visits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Visits
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {myAppointments.filter((a) => a.status === "completed").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Completed appointments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Medical Records
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {myRecords.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Total records on file
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Next Appointment
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {upcomingAppointments.length > 0
                ? new Date(upcomingAppointments[0].date).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                    },
                  )
                : "None"}
            </div>
            <p className="text-xs text-muted-foreground">
              {upcomingAppointments.length > 0
                ? upcomingAppointments[0].time
                : "No upcoming visits"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your scheduled visits</CardDescription>
              </div>
              <Link href="/patient/appointments">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  No upcoming appointments
                </p>
                <Link href="/patient/find-doctors" className="mt-4">
                  <Button>Book an Appointment</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {getDoctorName(appointment.doctorId)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getDoctorSpecialization(appointment.doctorId)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        {new Date(appointment.date).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Medical Records */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Medical Records</CardTitle>
                <CardDescription>Your latest health records</CardDescription>
              </div>
              <Link href="/patient/medical-records">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No medical records yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentRecords.map((record) => (
                  <div
                    key={record.id}
                    className="rounded-lg border border-border p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-foreground">
                        {record.diagnosis}
                      </p>
                      <Badge variant="secondary">
                        {new Date(record.visitDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {record.treatment}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {getDoctorName(record.doctorId)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you might want to do</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/patient/find-doctors">
              <Button
                variant="outline"
                className="w-full h-auto py-4 flex-col gap-2"
              >
                <User className="h-6 w-6" />
                <span>Find a Doctor</span>
              </Button>
            </Link>
            <Link href="/patient/appointments">
              <Button
                variant="outline"
                className="w-full h-auto py-4 flex-col gap-2"
              >
                <Calendar className="h-6 w-6" />
                <span>My Appointments</span>
              </Button>
            </Link>
            <Link href="/patient/medical-records">
              <Button
                variant="outline"
                className="w-full h-auto py-4 flex-col gap-2"
              >
                <FileText className="h-6 w-6" />
                <span>Medical Records</span>
              </Button>
            </Link>
            <Link href="/patient/profile">
              <Button
                variant="outline"
                className="w-full h-auto py-4 flex-col gap-2"
              >
                <Activity className="h-6 w-6" />
                <span>Update Profile</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
