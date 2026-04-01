'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Doctor, MedicalRecord } from '@/lib/types';
import { medicalRecordsService, appointmentsService, doctorsService } from '@/lib/api';
import type { CreateMedicalRecordRequest } from '@/lib/api';
import { Appointment } from '@/lib/types';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export default function DoctorMedicalRecordsPage() {
  const { user } = useAuth();
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [completedAppointments, setCompletedAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewRecordForm, setShowNewRecordForm] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [newRecord, setNewRecord] = useState({
    diagnosis: '', treatment: '', prescription: '', notes: '',
    vitals: { bloodPressure: '', temperature: '', heartRate: '', weight: '' },
  });

  useEffect(() => {
    if (!user) return;
    doctorsService.getById(user.id).then(docRes => {
       if (docRes.success && docRes.data) {
          setCurrentDoctor(docRes.data);
          Promise.all([
            medicalRecordsService.getByDoctor(docRes.data.id),
            appointmentsService.getMine(user, { status: 'completed' }),
          ]).then(([recRes, aptRes]) => {
            if (recRes.success) setRecords(recRes.data);
            if (aptRes.success) setCompletedAppointments(aptRes.data);
            setIsLoading(false);
          });
       } else {
          setIsLoading(false);
       }
    });
  }, [user]);

  const availableAppointments = completedAppointments.filter(
    a => !records.some(r => r.appointmentId === a.id)
  );

  const handleCreateRecord = async () => {
    const appointment = completedAppointments.find(a => a.id === selectedAppointmentId);
    if (!appointment || !currentDoctor) return;

    setIsSaving(true);
    const req: CreateMedicalRecordRequest = {
      appointmentId: selectedAppointmentId,
      diagnosis: newRecord.diagnosis,
      treatment: newRecord.treatment,
      prescription: newRecord.prescription || undefined,
      notes: newRecord.notes || undefined,
      finalized: true,
      vitals: newRecord.vitals.bloodPressure ? newRecord.vitals : undefined,
    };

    const res = await medicalRecordsService.create(req, {
      id: currentDoctor.id,
      name: currentDoctor.name,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      date: appointment.date,
    });

    if (res.success) {
      setRecords(prev => [res.data, ...prev]);
      setShowNewRecordForm(false);
      setSelectedAppointmentId('');
      setNewRecord({ diagnosis: '', treatment: '', prescription: '', notes: '', vitals: { bloodPressure: '', temperature: '', heartRate: '', weight: '' } });
    }
    setIsSaving(false);
  };

  const inputCls = 'mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20';

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
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Record
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : records.length > 0 ? (
        <div className="space-y-4">
          {records.map((record) => (
            <div key={record.id} className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{record.patientName}</h3>
                  <p className="text-sm text-muted-foreground">{record.visitDate}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{record.diagnosis}</span>
              </div>

              {record.vitals && (
                <div className="mb-4 grid gap-4 rounded-lg bg-secondary/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div><p className="text-xs text-muted-foreground">Blood Pressure</p><p className="font-medium text-foreground">{record.vitals.bloodPressure}</p></div>
                  <div><p className="text-xs text-muted-foreground">Temperature</p><p className="font-medium text-foreground">{record.vitals.temperature}</p></div>
                  <div><p className="text-xs text-muted-foreground">Heart Rate</p><p className="font-medium text-foreground">{record.vitals.heartRate}</p></div>
                  <div><p className="text-xs text-muted-foreground">Weight</p><p className="font-medium text-foreground">{record.vitals.weight}</p></div>
                </div>
              )}

              <div className="space-y-3">
                <div><p className="text-sm font-medium text-foreground">Treatment:</p><p className="whitespace-pre-wrap text-sm text-muted-foreground">{record.treatment}</p></div>
                <div>
                  <p className="text-sm font-medium text-foreground">Prescription:</p>
                  {record.prescription ? <p className="whitespace-pre-wrap text-sm text-muted-foreground">{record.prescription}</p> : <p className="text-sm text-muted-foreground">—</p>}
                </div>
                {record.notes && <div><p className="text-sm font-medium text-foreground">Notes:</p><p className="text-sm text-muted-foreground">{record.notes}</p></div>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card py-12 text-center">
          <p className="text-muted-foreground">No medical records found.</p>
          {availableAppointments.length > 0 && (
            <button onClick={() => setShowNewRecordForm(true)} className="mt-4 cursor-pointer text-primary hover:underline">
              Create your first record
            </button>
          )}
        </div>
      )}

      {/* New Record Modal */}
      {showNewRecordForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Create Medical Record</h2>
              <button onClick={() => setShowNewRecordForm(false)} className="cursor-pointer rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">Select Appointment</label>
                <Select value={selectedAppointmentId || 'none'} onValueChange={(v) => setSelectedAppointmentId(v === 'none' ? '' : v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select an appointment..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select an appointment...</SelectItem>
                    {availableAppointments.map((apt) => (
                      <SelectItem key={apt.id} value={apt.id}>
                        {apt.patientName} - {apt.date} ({apt.reason})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Diagnosis</label>
                <input type="text" value={newRecord.diagnosis} onChange={(e) => setNewRecord({ ...newRecord, diagnosis: e.target.value })} className={inputCls} placeholder="Enter diagnosis" />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Treatment Details</label>
                <textarea value={newRecord.treatment} onChange={(e) => setNewRecord({ ...newRecord, treatment: e.target.value })} rows={3} className={inputCls} placeholder="Enter treatment plan / details" />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Vitals (Optional)</label>
                <div className="mt-1 grid gap-4 sm:grid-cols-2">
                  {[
                    { key: 'bloodPressure', placeholder: 'Blood Pressure (e.g., 120/80)' },
                    { key: 'temperature', placeholder: 'Temperature (e.g., 98.6 F)' },
                    { key: 'heartRate', placeholder: 'Heart Rate (e.g., 72 bpm)' },
                    { key: 'weight', placeholder: 'Weight (e.g., 70 kg)' },
                  ].map(({ key, placeholder }) => (
                    <input
                      key={key}
                      type="text"
                      value={(newRecord.vitals as Record<string,string>)[key]}
                      onChange={(e) => setNewRecord({ ...newRecord, vitals: { ...newRecord.vitals, [key]: e.target.value } })}
                      className="rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                      placeholder={placeholder}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Prescription</label>
                <textarea value={newRecord.prescription} onChange={(e) => setNewRecord({ ...newRecord, prescription: e.target.value })} rows={3} className={inputCls} placeholder="Enter prescription details" />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Notes</label>
                <textarea value={newRecord.notes} onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })} rows={3} className={inputCls} placeholder="Additional notes..." />
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowNewRecordForm(false)} className="flex-1 cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
                  Cancel
                </button>
                <button
                  onClick={handleCreateRecord}
                  disabled={!selectedAppointmentId || !newRecord.diagnosis || !newRecord.treatment || isSaving}
                  className="flex-1 cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? 'Saving…' : 'Create Record'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
