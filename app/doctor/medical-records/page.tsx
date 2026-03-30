'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockDoctors, mockAppointments, mockMedicalRecords, mockPatients } from '@/lib/mock-data';
import { MedicalRecord } from '@/lib/types';

export default function DoctorMedicalRecordsPage() {
  const { user } = useAuth();
  const currentDoctor = mockDoctors.find(d => d.email === user?.email) || mockDoctors[0];
  
  const doctorAppointments = mockAppointments.filter(
    a => a.doctorId === currentDoctor.id && a.status === 'completed'
  );
  
  const [records, setRecords] = useState<MedicalRecord[]>(
    mockMedicalRecords.filter(r => r.doctorId === currentDoctor.id)
  );
  const [showNewRecordForm, setShowNewRecordForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<string>('');
  const [newRecord, setNewRecord] = useState({
    diagnosis: '',
    prescription: '',
    notes: '',
    vitals: {
      bloodPressure: '',
      temperature: '',
      heartRate: '',
      weight: '',
    },
  });

  const getAppointmentWithoutRecord = () => {
    const recordedAppointmentIds = records.map(r => r.appointmentId);
    return doctorAppointments.filter(a => !recordedAppointmentIds.includes(a.id));
  };

  const handleCreateRecord = () => {
    const appointment = mockAppointments.find(a => a.id === selectedAppointment);
    if (!appointment) return;

    const record: MedicalRecord = {
      id: `rec-${Date.now()}`,
      appointmentId: selectedAppointment,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      doctorId: currentDoctor.id,
      doctorName: currentDoctor.name,
      date: appointment.date,
      diagnosis: newRecord.diagnosis,
      prescription: newRecord.prescription,
      notes: newRecord.notes,
      vitals: newRecord.vitals.bloodPressure ? newRecord.vitals : undefined,
    };

    setRecords([record, ...records]);
    setShowNewRecordForm(false);
    setSelectedAppointment('');
    setNewRecord({
      diagnosis: '',
      prescription: '',
      notes: '',
      vitals: {
        bloodPressure: '',
        temperature: '',
        heartRate: '',
        weight: '',
      },
    });
  };

  const availableAppointments = getAppointmentWithoutRecord();

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Medical Records</h1>
          <p className="text-muted-foreground">Create and view patient medical records</p>
        </div>
        {availableAppointments.length > 0 && (
          <button
            onClick={() => setShowNewRecordForm(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Record
          </button>
        )}
      </div>

      {/* Records List */}
      {records.length > 0 ? (
        <div className="space-y-4">
          {records.map((record) => (
            <div key={record.id} className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{record.patientName}</h3>
                  <p className="text-sm text-muted-foreground">{record.date}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {record.diagnosis}
                </span>
              </div>

              {record.vitals && (
                <div className="mb-4 grid grid-cols-2 gap-4 rounded-lg bg-secondary/50 p-4 sm:grid-cols-4">
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

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Prescription:</p>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">{record.prescription}</p>
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
        <div className="rounded-xl border border-border bg-card py-12 text-center">
          <p className="text-muted-foreground">No medical records found.</p>
          {availableAppointments.length > 0 && (
            <button
              onClick={() => setShowNewRecordForm(true)}
              className="mt-4 cursor-pointer text-primary hover:underline"
            >
              Create your first record
            </button>
          )}
        </div>
      )}

      {/* New Record Modal */}
      {showNewRecordForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Create Medical Record</h2>
              <button
                onClick={() => setShowNewRecordForm(false)}
                className="cursor-pointer rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">Select Appointment</label>
                <select
                  value={selectedAppointment}
                  onChange={(e) => setSelectedAppointment(e.target.value)}
                  className="mt-1 w-full cursor-pointer rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                >
                  <option value="">Select an appointment...</option>
                  {availableAppointments.map((apt) => (
                    <option key={apt.id} value={apt.id}>
                      {apt.patientName} - {apt.date} ({apt.reason})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Diagnosis</label>
                <input
                  type="text"
                  value={newRecord.diagnosis}
                  onChange={(e) => setNewRecord({ ...newRecord, diagnosis: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="Enter diagnosis"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Vitals (Optional)</label>
                <div className="mt-1 grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={newRecord.vitals.bloodPressure}
                    onChange={(e) => setNewRecord({ 
                      ...newRecord, 
                      vitals: { ...newRecord.vitals, bloodPressure: e.target.value } 
                    })}
                    className="rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                    placeholder="Blood Pressure (e.g., 120/80)"
                  />
                  <input
                    type="text"
                    value={newRecord.vitals.temperature}
                    onChange={(e) => setNewRecord({ 
                      ...newRecord, 
                      vitals: { ...newRecord.vitals, temperature: e.target.value } 
                    })}
                    className="rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                    placeholder="Temperature (e.g., 98.6 F)"
                  />
                  <input
                    type="text"
                    value={newRecord.vitals.heartRate}
                    onChange={(e) => setNewRecord({ 
                      ...newRecord, 
                      vitals: { ...newRecord.vitals, heartRate: e.target.value } 
                    })}
                    className="rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                    placeholder="Heart Rate (e.g., 72 bpm)"
                  />
                  <input
                    type="text"
                    value={newRecord.vitals.weight}
                    onChange={(e) => setNewRecord({ 
                      ...newRecord, 
                      vitals: { ...newRecord.vitals, weight: e.target.value } 
                    })}
                    className="rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                    placeholder="Weight (e.g., 70 kg)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Prescription</label>
                <textarea
                  value={newRecord.prescription}
                  onChange={(e) => setNewRecord({ ...newRecord, prescription: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="Enter prescription details"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Notes</label>
                <textarea
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowNewRecordForm(false)}
                  className="flex-1 cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRecord}
                  disabled={!selectedAppointment || !newRecord.diagnosis || !newRecord.prescription}
                  className="flex-1 cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Create Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
