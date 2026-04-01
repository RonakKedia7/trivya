'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { patientsService } from '@/lib/api';
import { Patient, Appointment, MedicalRecord } from '@/lib/types';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled':   return 'bg-chart-1/10 text-chart-1';
    case 'completed':   return 'bg-success/10 text-success';
    case 'cancelled':   return 'bg-destructive/10 text-destructive';
    case 'in-progress': return 'bg-chart-3/10 text-chart-3';
    default:            return 'bg-muted text-muted-foreground';
  }
};

export default function PatientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    Promise.all([
      patientsService.getById(id),
      patientsService.getAppointments(id),
      patientsService.getMedicalRecords(id),
    ]).then(([pRes, aRes, rRes]) => {
      if (!pRes.success || !pRes.data) {
        setNotFound(true);
      } else {
        setPatient(pRes.data);
      }
      if (aRes.success) setAppointments(aRes.data);
      if (rRes.success) setRecords(rRes.data);
      setIsLoading(false);
    });
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !patient) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold text-foreground">Patient Not Found</h1>
        <Link href="/admin/patients" className="mt-4 cursor-pointer text-primary hover:underline">
          Back to Patients
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/patients" className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Patients
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Patient Info Card */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-chart-2/10 text-2xl font-bold text-chart-2">
                {patient.name.charAt(0)}
              </div>
              <h1 className="mt-4 text-xl font-bold text-foreground">{patient.name}</h1>
              <p className="capitalize text-muted-foreground">{patient.gender}</p>
              <span className="mt-2 inline-flex rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">
                {patient.bloodGroup}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {[
                { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: patient.email },
                { icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', label: patient.phone || '—' },
                { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', label: patient.dateOfBirth },
                { icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z', label: patient.address || '—' },
                { icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z', label: patient.emergencyContact || '—' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-start gap-3">
                  <svg className="h-5 w-5 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                  </svg>
                  <span className="text-sm text-foreground">{label}</span>
                </div>
              ))}
            </div>

            {/* Summary stats */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <p className="text-xl font-bold text-foreground">{appointments.length}</p>
                <p className="text-xs text-muted-foreground">Appointments</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <p className="text-xl font-bold text-foreground">{records.length}</p>
                <p className="text-xs text-muted-foreground">Records</p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments & Medical Records */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointments */}
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">Appointments ({appointments.length})</h2>
            </div>
            {appointments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-secondary/30">
                        <td className="whitespace-nowrap px-6 py-4 font-medium text-foreground">{apt.doctorName}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">{apt.department}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">{apt.date} at {apt.time}</td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(apt.status)}`}>
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
                No appointments found for this patient.
              </div>
            )}
          </div>

          {/* Medical Records */}
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">Medical Records ({records.length})</h2>
            </div>
            {records.length > 0 ? (
              <div className="divide-y divide-border">
                {records.map((record) => (
                  <div key={record.id} className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">{record.diagnosis}</p>
                        <p className="text-sm text-muted-foreground">By {record.doctorName} on {record.visitDate}</p>
                      </div>
                      {record.finalized && (
                        <span className="inline-flex rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Finalized</span>
                      )}
                    </div>
                    {record.vitals && (
                      <div className="mb-4 grid gap-4 rounded-lg bg-secondary/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Blood Pressure</p>
                          <p className="font-medium text-foreground">{record.vitals.bloodPressure}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Temperature</p>
                          <p className="font-medium text-foreground">{record.vitals.temperature}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Heart Rate</p>
                          <p className="font-medium text-foreground">{record.vitals.heartRate}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Weight</p>
                          <p className="font-medium text-foreground">{record.vitals.weight}</p>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">Treatment:</p>
                        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{record.treatment}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Prescription:</p>
                        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{record.prescription || '—'}</p>
                      </div>
                      {record.notes && (
                        <div>
                          <p className="text-sm font-medium text-foreground">Notes:</p>
                          <p className="text-sm text-muted-foreground">{record.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                No medical records found for this patient.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
