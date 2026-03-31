"use client"

import { useAuth } from "@/context/AuthContext"
import { mockDoctors } from "@/lib/mock-data"
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
import { MedicalRecord } from "@/lib/types"
import { getMedicalRecords } from "@/lib/storage"

export default function PatientMedicalRecordsPage() {
  const { user } = useAuth()

  const [myRecords, setMyRecords] = useState<MedicalRecord[]>([])

  useEffect(() => {
    const records = getMedicalRecords().filter((r) => r.patientId === user?.id)
    setMyRecords(records)
  }, [user?.id])

  const getDoctorName = (doctorId: string) => {
    const doctor = mockDoctors.find((d) => d.id === doctorId)
    return doctor ? `Dr. ${doctor.name}` : "Unknown Doctor"
  }

  const getDoctorSpecialization = (doctorId: string) => {
    const doctor = mockDoctors.find((d) => d.id === doctorId)
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
