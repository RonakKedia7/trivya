"use client"

import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FileText, User, Calendar, Pill, Stethoscope } from "lucide-react"
import { useEffect, useState } from "react"
import { MedicalRecord, Doctor } from "@/lib/types"
import { medicalRecordsService, doctorsService } from "@/lib/api"

export default function PatientMedicalRecordsPage() {
  const { user } = useAuth()

  const [myRecords, setMyRecords] = useState<MedicalRecord[]>([])
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([])

  useEffect(() => {
    if (!user?.id) return;
    
    Promise.all([
      medicalRecordsService.getByPatient(user.id),
      doctorsService.getAll({ limit: 500 })
    ]).then(([recRes, docRes]) => {
      if (recRes.success) setMyRecords(recRes.data);
      if (docRes.success) setDoctorsList(docRes.data);
    });
  }, [user?.id])

  const getDoctorName = (doctorId: string) => {
    const doctor = doctorsList.find((d) => d.id === doctorId)
    return doctor ? `Dr. ${doctor.name}` : "Unknown Doctor"
  }

  const getDoctorSpecialization = (doctorId: string) => {
    const doctor = doctorsList.find((d) => d.id === doctorId)
    return doctor?.specialization || "General"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Medical Records</h1>
        <p className="text-muted-foreground">
          View your complete medical history
        </p>
      </div>

      {myRecords.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-foreground">
              No medical records yet
            </p>
            <p className="text-muted-foreground">
              Your medical records will appear here after your appointments
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {myRecords.map((record) => (
            <Card key={record.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{record.diagnosis}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4" />
                      {getDoctorName(record.doctorId)} -{" "}
                      {getDoctorSpecialization(record.doctorId)}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="w-fit">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(record.visitDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="treatment">
                    <AccordionTrigger className="text-sm">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" />
                        Treatment Details
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">{record.treatment}</p>
                    </AccordionContent>
                  </AccordionItem>

                  {record.prescription && (
                    <AccordionItem value="prescription">
                      <AccordionTrigger className="text-sm">
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4" />
                          Prescription
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="rounded-lg bg-muted p-4">
                          <p className="text-sm text-foreground whitespace-pre-line">
                            {record.prescription}
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {record.vitals && (
                    <AccordionItem value="vitals">
                      <AccordionTrigger className="text-sm">
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                          Patient Vitals
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-4 rounded-lg bg-secondary/30 p-4 border border-border">
                          <div>
                            <p className="text-xs text-muted-foreground">Blood Pressure</p>
                            <p className="font-medium text-foreground">{record.vitals.bloodPressure || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Heart Rate</p>
                            <p className="font-medium text-foreground">{record.vitals.heartRate || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Temperature</p>
                            <p className="font-medium text-foreground">{record.vitals.temperature || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Weight</p>
                            <p className="font-medium text-foreground">{record.vitals.weight || 'N/A'}</p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {record.notes && (
                    <AccordionItem value="notes">
                      <AccordionTrigger className="text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Additional Notes
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">{record.notes}</p>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
