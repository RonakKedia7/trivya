"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { appointmentsService } from "@/lib/api"
import { Appointment } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Calendar, Clock, User, X, Loader2 } from "lucide-react"
import Link from "next/link"

export default function PatientAppointmentsPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setIsLoading(true)
    appointmentsService.getMine(user).then((res) => {
      if (res.success) setAppointments(res.data)
      setIsLoading(false)
    })
  }, [user])

  const upcoming   = appointments.filter(a => a.status === "scheduled")
  const past       = appointments.filter(a => a.status === "completed")
  const cancelled  = appointments.filter(a => a.status === "cancelled")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:          return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  const handleCancel = async (appointmentId: string) => {
    const res = await appointmentsService.cancel(appointmentId)
    if (res.success) {
      setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: "cancelled" } : a))
    }
  }

  const AppointmentCard = ({ appointment, showActions = false }: { appointment: Appointment; showActions?: boolean }) => {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg border border-border p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Dr. {appointment.doctorName}</p>
            <p className="text-sm text-muted-foreground">{appointment.department}</p>
            <p className="text-sm text-muted-foreground mt-1">{appointment.reason}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(appointment.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{appointment.time}</span>
            </div>
          </div>
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </Badge>
          {showActions && appointment.status === "scheduled" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive">
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this appointment with Dr. {appointment.doctorName}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleCancel(appointment.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Cancel Appointment
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Appointments</h1>
          <p className="text-muted-foreground">View and manage your appointments</p>
        </div>
        <Link href="/patient/find-doctors">
          <Button className="w-full sm:w-auto">
            <Calendar className="mr-2 h-4 w-4" /> Book New
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelled.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <Card>
              <CardHeader><CardTitle>Upcoming Appointments</CardTitle><CardDescription>Your scheduled visits</CardDescription></CardHeader>
              <CardContent>
                {upcoming.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No upcoming appointments</p>
                    <Link href="/patient/find-doctors" className="mt-4"><Button>Book an Appointment</Button></Link>
                  </div>
                ) : (
                  <div className="space-y-4">{upcoming.map(a => <AppointmentCard key={a.id} appointment={a} showActions />)}</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="past">
            <Card>
              <CardHeader><CardTitle>Past Appointments</CardTitle><CardDescription>Your completed visits</CardDescription></CardHeader>
              <CardContent>
                {past.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No past appointments</p>
                  </div>
                ) : (
                  <div className="space-y-4">{past.map(a => <AppointmentCard key={a.id} appointment={a} />)}</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cancelled">
            <Card>
              <CardHeader><CardTitle>Cancelled Appointments</CardTitle><CardDescription>Your cancelled visits</CardDescription></CardHeader>
              <CardContent>
                {cancelled.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <X className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No cancelled appointments</p>
                  </div>
                ) : (
                  <div className="space-y-4">{cancelled.map(a => <AppointmentCard key={a.id} appointment={a} />)}</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
