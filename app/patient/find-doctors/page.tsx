"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { mockDoctors } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Search, User, Calendar, Clock, Star, MapPin } from "lucide-react"
import { Appointment } from "@/lib/types"
import { DatePicker } from "@/components/ui/date-picker"
import { getAppointments, setAppointments as persistAppointments } from "@/lib/storage"

export default function FindDoctorsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [specialization, setSpecialization] = useState("all")
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)
  const [appointmentDate, setAppointmentDate] = useState("")
  const [appointmentTime, setAppointmentTime] = useState("")
  const [appointmentReason, setAppointmentReason] = useState("")
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    setAppointments(getAppointments())
  }, [])

  const specializations = [...new Set(mockDoctors.map((d) => d.specialization))]

  const filteredDoctors = mockDoctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialization =
      specialization === "all" || doctor.specialization === specialization
    return matchesSearch && matchesSpecialization
  })

  const timeSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
  ]

  const handleBookAppointment = () => {
    if (!selectedDoctor || !appointmentDate || !appointmentTime || !user) return

    const doctor = mockDoctors.find((d) => d.id === selectedDoctor)
    const createdAt = new Date().toISOString().split("T")[0]

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: user.id,
      patientName: user.name,
      doctorId: selectedDoctor,
      doctorName: doctor?.name || "Unknown",
      department: doctor?.department || "General Medicine",
      date: appointmentDate,
      time: appointmentTime,
      status: "scheduled",
      reason: appointmentReason || "General Consultation",
      createdAt,
    }

    const next = [newAppointment, ...appointments]
    setAppointments(next)
    persistAppointments([newAppointment, ...getAppointments()])
    setBookingDialogOpen(false)
    setSelectedDoctor(null)
    setAppointmentDate("")
    setAppointmentTime("")
    setAppointmentReason("")
  }

  const openBookingDialog = (doctorId: string) => {
    setSelectedDoctor(doctorId)
    setBookingDialogOpen(true)
  }

  const getSelectedDoctorDetails = () => {
    return mockDoctors.find((d) => d.id === selectedDoctor)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Find Doctors</h1>
        <p className="text-muted-foreground">
          Search and book appointments with our specialists
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={specialization} onValueChange={setSpecialization}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Doctors List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDoctors.map((doctor) => (
          <Card key={doctor.id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">Dr. {doctor.name}</CardTitle>
                  <CardDescription>{doctor.specialization}</CardDescription>
                  <div className="mt-1 flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">4.8</span>
                    <span className="text-sm text-muted-foreground">(120 reviews)</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Medical Center, Building A</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Available: Mon - Fri, 9 AM - 5 PM</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{doctor.experience} years exp.</Badge>
                <Badge variant="outline">${doctor.consultationFee}/visit</Badge>
              </div>
              <Button
                className="w-full"
                onClick={() => openBookingDialog(doctor.id)}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Book Appointment
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-foreground">No doctors found</p>
          <p className="text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
            <DialogDescription>
              {getSelectedDoctorDetails() && (
                <>
                  Schedule an appointment with Dr.{" "}
                  {getSelectedDoctorDetails()?.name} (
                  {getSelectedDoctorDetails()?.specialization})
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Select Date</Label>
              <DatePicker
                value={appointmentDate}
                onChange={setAppointmentDate}
                placeholder="Select appointment date"
                minDate={new Date()}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Select Time</Label>
              <Select value={appointmentTime} onValueChange={setAppointmentTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for Visit</Label>
              <Input
                id="reason"
                placeholder="Brief description of your concern"
                value={appointmentReason}
                onChange={(e) => setAppointmentReason(e.target.value)}
              />
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm font-medium">Consultation Fee</p>
              <p className="text-2xl font-bold text-primary">
                ${getSelectedDoctorDetails()?.consultationFee || 0}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBookAppointment}
              disabled={!appointmentDate || !appointmentTime}
            >
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
