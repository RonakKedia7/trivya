"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { appointmentsService, doctorsService } from "@/lib/api"
import { Doctor } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Search, User, Calendar, Clock, Star, MapPin, Loader2 } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"
import { departments } from "@/lib/mock-data"

const TIME_SLOTS = [
  "09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
  "02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM","04:30 PM",
]

export default function FindDoctorsPage() {
  const { user } = useAuth()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [specialization, setSpecialization] = useState("all")

  // Booking dialog state
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [appointmentDate, setAppointmentDate] = useState("")
  const [appointmentTime, setAppointmentTime] = useState("")
  const [appointmentReason, setAppointmentReason] = useState("")
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingError, setBookingError] = useState("")
  const [bookingSuccess, setBookingSuccess] = useState(false)

  // Fetch doctors via the service layer
  useEffect(() => {
    setIsLoading(true)
    doctorsService
      .getAll({
        search: searchTerm || undefined,
        specialization: specialization === "all" ? undefined : specialization,
      })
      .then((res) => {
        if (res.success) setDoctors(res.data)
        setIsLoading(false)
      })
  }, [searchTerm, specialization])

  const openBookingDialog = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setBookingDialogOpen(true)
    setBookingError("")
    setBookingSuccess(false)
    setAppointmentDate("")
    setAppointmentTime("")
    setAppointmentReason("")
  }

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !appointmentDate || !appointmentTime || !user) return

    setIsBooking(true)
    setBookingError("")

    const res = await appointmentsService.create(user, {
      doctorId: selectedDoctor.id,
      date: appointmentDate,
      time: appointmentTime,
      reason: appointmentReason || "General Consultation",
    })

    if (res.success) {
      setBookingSuccess(true)
      setTimeout(() => {
        setBookingDialogOpen(false)
        setBookingSuccess(false)
      }, 1500)
    } else {
      setBookingError(res.error ?? "Booking failed. Please try again.")
    }

    setIsBooking(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Find Doctors</h1>
        <p className="text-muted-foreground">Search and book appointments with our specialists</p>
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
                {departments.map((spec) => (
                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* Doctors List */}
      {!isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{doctor.name}</CardTitle>
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
                  <span>Available: Mon – Fri, 9 AM – 5 PM</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{doctor.experience} yrs exp.</Badge>
                  <Badge variant="outline">${doctor.consultationFee}/visit</Badge>
                </div>
                <Button className="w-full" onClick={() => openBookingDialog(doctor)}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Appointment
                </Button>
              </CardContent>
            </Card>
          ))}
          {doctors.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-foreground">No doctors found</p>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
            <DialogDescription>
              {selectedDoctor && (
                <>Schedule with {selectedDoctor.name} ({selectedDoctor.specialization})</>
              )}
            </DialogDescription>
          </DialogHeader>

          {bookingSuccess ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <svg className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-semibold text-foreground">Appointment Booked!</p>
              <p className="text-sm text-muted-foreground">You&apos;ll see it in My Appointments.</p>
            </div>
          ) : (
            <>
              {bookingError && (
                <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {bookingError}
                </div>
              )}
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Select Date</Label>
                  <DatePicker value={appointmentDate} onChange={setAppointmentDate} placeholder="Select appointment date" minDate={new Date()} />
                </div>
                <div className="grid gap-2">
                  <Label>Select Time</Label>
                  <Select value={appointmentTime} onValueChange={setAppointmentTime}>
                    <SelectTrigger><SelectValue placeholder="Select a time slot" /></SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((slot) => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Reason for Visit</Label>
                  <Input placeholder="Brief description of your concern" value={appointmentReason} onChange={(e) => setAppointmentReason(e.target.value)} />
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium">Consultation Fee</p>
                  <p className="text-2xl font-bold text-primary">${selectedDoctor?.consultationFee ?? 0}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setBookingDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleBookAppointment} disabled={!appointmentDate || !appointmentTime || isBooking}>
                  {isBooking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Confirm Booking
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
