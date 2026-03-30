'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockDoctors, mockAppointments, mockMedicalRecords, mockPatients } from '@/lib/mock-data';

export default function DoctorHistoryPage() {
  const { user } = useAuth();
  const currentDoctor = mockDoctors.find(d => d.email === user?.email) || mockDoctors[0];
  
  const doctorAppointments = mockAppointments.filter(a => a.doctorId === currentDoctor.id);
  const uniquePatientIds = [...new Set(doctorAppointments.map(a => a.patientId))];
  const doctorPatients = mockPatients.filter(p => uniquePatientIds.includes(p.id));

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const filteredPatients = doctorPatients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPatientAppointments = (patientId: string) => {
    return doctorAppointments.filter(a => a.patientId === patientId);
  };

  const getPatientRecords = (patientId: string) => {
    return mockMedicalRecords.filter(r => r.patientId === patientId && r.doctorId === currentDoctor.id);
  };

  const selectedPatientData = selectedPatient 
    ? mockPatients.find(p => p.id === selectedPatient) 
    : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-chart-1/10 text-chart-1';
      case 'completed':
        return 'bg-success/10 text-success';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Patient History</h1>
        <p className="text-muted-foreground">View all patients you have attended</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Patients List */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 rounded-xl border border-border bg-card">
            <div className="border-b border-border p-4">
              <input
                type="text"
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <div className="max-h-[calc(100vh-250px)] divide-y divide-border overflow-y-auto">
              {filteredPatients.map((patient) => {
                const appointments = getPatientAppointments(patient.id);
                return (
                  <button
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient.id)}
                    className={`flex w-full cursor-pointer items-center gap-3 p-4 text-left transition-colors hover:bg-secondary/50 ${
                      selectedPatient === patient.id ? 'bg-secondary' : ''
                    }`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-2/10 text-sm font-medium text-chart-2">
                      {patient.name.charAt(0)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-medium text-foreground">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">{appointments.length} visits</p>
                    </div>
                  </button>
                );
              })}
              {filteredPatients.length === 0 && (
                <div className="p-6 text-center text-muted-foreground">
                  No patients found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Patient Details */}
        <div className="lg:col-span-2">
          {selectedPatientData ? (
            <div className="space-y-6">
              {/* Patient Info Card */}
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-chart-2/10 text-2xl font-bold text-chart-2">
                    {selectedPatientData.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{selectedPatientData.name}</h2>
                    <p className="capitalize text-muted-foreground">{selectedPatientData.gender}, {selectedPatientData.bloodGroup}</p>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>{selectedPatientData.email}</span>
                      <span>{selectedPatientData.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointments */}
              <div className="rounded-xl border border-border bg-card">
                <div className="border-b border-border px-6 py-4">
                  <h3 className="text-lg font-semibold text-foreground">Appointment History</h3>
                </div>
                <div className="divide-y divide-border">
                  {getPatientAppointments(selectedPatientData.id).map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium text-foreground">{apt.date} at {apt.time}</p>
                        <p className="text-sm text-muted-foreground">{apt.reason}</p>
                      </div>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medical Records */}
              <div className="rounded-xl border border-border bg-card">
                <div className="border-b border-border px-6 py-4">
                  <h3 className="text-lg font-semibold text-foreground">Medical Records</h3>
                </div>
                {getPatientRecords(selectedPatientData.id).length > 0 ? (
                  <div className="divide-y divide-border">
                    {getPatientRecords(selectedPatientData.id).map((record) => (
                      <div key={record.id} className="p-6">
                        <div className="mb-3 flex items-start justify-between">
                          <div>
                            <p className="font-medium text-foreground">{record.diagnosis}</p>
                            <p className="text-sm text-muted-foreground">{record.date}</p>
                          </div>
                        </div>
                        {record.vitals && (
                          <div className="mb-3 grid grid-cols-2 gap-3 rounded-lg bg-secondary/50 p-3 sm:grid-cols-4">
                            <div>
                              <p className="text-xs text-muted-foreground">BP</p>
                              <p className="text-sm font-medium text-foreground">{record.vitals.bloodPressure}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Temp</p>
                              <p className="text-sm font-medium text-foreground">{record.vitals.temperature}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">HR</p>
                              <p className="text-sm font-medium text-foreground">{record.vitals.heartRate}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Weight</p>
                              <p className="text-sm font-medium text-foreground">{record.vitals.weight}</p>
                            </div>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-foreground">Prescription:</p>
                          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{record.prescription}</p>
                        </div>
                        {record.notes && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-foreground">Notes:</p>
                            <p className="text-sm text-muted-foreground">{record.notes}</p>
                          </div>
                        )}
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
          ) : (
            <div className="flex items-center justify-center rounded-xl border border-border bg-card py-20">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="mt-4 text-muted-foreground">Select a patient to view their history</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
