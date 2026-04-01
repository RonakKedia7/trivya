'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Appointment, AppointmentStatus, Doctor, MedicalRecord } from '@/lib/types';
import { appointmentsService, doctorsService, medicalRecordsService } from '@/lib/api';
import type { CreateMedicalRecordRequest } from '@/lib/api';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export default function DoctorAppointmentsPage() {
  const { user } = useAuth();
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [recordDraft, setRecordDraft] = useState({ 
    diagnosis: '', treatment: '', prescription: '', notes: '',
    vitals: { bloodPressure: '', temperature: '', heartRate: '', weight: '' }
  });
  const [existingRecord, setExistingRecord] = useState<MedicalRecord | null>(null);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (!currentDoctor) {
      doctorsService.getById(user.id).then(res => {
         if (res.success && res.data) setCurrentDoctor(res.data);
      });
    }
  }, [user, currentDoctor]);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    appointmentsService.getMine(user, {
      status: statusFilter || undefined,
      date: dateFilter || undefined,
    }).then((res) => {
      if (res.success) setAppointments(res.data);
      setIsLoading(false);
    });
  }, [user, statusFilter, dateFilter]);

  useEffect(() => {
    if (!selectedAppointment) { setExistingRecord(null); return; }
    medicalRecordsService.getByAppointment(selectedAppointment.id).then((res) => {
      const rec = res.success ? res.data : null;
      setExistingRecord(rec);
      setRecordDraft({
        diagnosis: rec?.diagnosis ?? selectedAppointment.reason,
        treatment: rec?.treatment ?? '',
        prescription: rec?.prescription ?? '',
        notes: rec?.notes ?? '',
        vitals: rec?.vitals ?? { bloodPressure: '', temperature: '', heartRate: '', weight: '' }
      });
      setFormError('');
    });
  }, [selectedAppointment]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':   return 'bg-chart-1/10 text-chart-1';
      case 'completed':   return 'bg-success/10 text-success';
      case 'cancelled':   return 'bg-destructive/10 text-destructive';
      case 'in-progress': return 'bg-warning/10 text-warning';
      default:            return 'bg-muted text-muted-foreground';
    }
  };

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    const res = await appointmentsService.updateStatus(id, { status });
    if (res.success) {
      setAppointments(prev => prev.map(a => a.id === id ? res.data : a));
      if (selectedAppointment?.id === id) setSelectedAppointment(res.data);
    }
  };

  const saveDraft = async (finalize: boolean) => {
    if (!selectedAppointment || !currentDoctor) return;
    setIsSaving(true);
    setFormError('');

    if (finalize) {
      if (!recordDraft.treatment.trim()) { setFormError('Treatment details are required.'); setIsSaving(false); return; }
      if (!recordDraft.prescription.trim()) { setFormError('Prescription information is required.'); setIsSaving(false); return; }
    }

    const req: CreateMedicalRecordRequest = {
      appointmentId: selectedAppointment.id,
      diagnosis: recordDraft.diagnosis.trim() || selectedAppointment.reason,
      treatment: recordDraft.treatment.trim(),
      prescription: recordDraft.prescription.trim() || undefined,
      notes: recordDraft.notes.trim() || undefined,
      finalized: finalize,
      vitals: Object.values(recordDraft.vitals).some(v => v.trim() !== '') ? recordDraft.vitals : undefined,
    };

    const res = await medicalRecordsService.create(req, {
      id: currentDoctor.id,
      name: currentDoctor.name,
      patientId: selectedAppointment.patientId,
      patientName: selectedAppointment.patientName,
      date: selectedAppointment.date,
    });

    if (res.success && finalize) {
      await updateStatus(selectedAppointment.id, 'completed');
    }

    setIsSaving(false);
  };

  const handleStartFromRow = async (apt: Appointment) => {
    if (apt.status !== 'scheduled') return;
    const res = await appointmentsService.updateStatus(apt.id, { status: 'in-progress' });
    if (res.success) {
      setAppointments(prev => prev.map(a => a.id === apt.id ? res.data : a));
      setSelectedAppointment(res.data);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">My Appointments</h1>
        <p className="text-muted-foreground">Manage and update your appointments</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="sm:w-[220px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <DatePicker value={dateFilter} onChange={setDateFilter} placeholder="Filter by date" className="sm:w-[220px]" />
        {(statusFilter || dateFilter) && (
          <button onClick={() => { setStatusFilter(''); setDateFilter(''); }} className="h-10 cursor-pointer rounded-lg border border-border px-4 text-sm text-muted-foreground transition-colors hover:bg-secondary sm:w-[220px]">
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Date &amp; Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-secondary/30">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chart-2/10 text-sm font-medium text-chart-2">
                          {apt.patientName.charAt(0)}
                        </div>
                        <span className="font-medium text-foreground">{apt.patientName}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">{apt.date} at {apt.time}</td>
                    <td className="px-6 py-4 text-muted-foreground"><span className="line-clamp-1">{apt.reason}</span></td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(apt.status)}`}>{apt.status}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedAppointment(apt)} className="cursor-pointer text-sm text-primary hover:underline">View</button>
                        {apt.status === 'scheduled' && (
                          <button onClick={() => handleStartFromRow(apt)} className="cursor-pointer text-sm text-warning hover:underline">Start</button>
                        )}
                        {apt.status === 'in-progress' && (
                          <button onClick={() => setSelectedAppointment(apt)} className="cursor-pointer text-sm text-success hover:underline">Complete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {appointments.length === 0 && (
              <div className="py-12 text-center"><p className="text-muted-foreground">No appointments found.</p></div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Appointment Details</h2>
              <button onClick={() => setSelectedAppointment(null)} className="cursor-pointer rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-chart-2/10 text-xl font-medium text-chart-2">
                  {selectedAppointment.patientName.charAt(0)}
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{selectedAppointment.patientName}</p>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(selectedAppointment.status)}`}>{selectedAppointment.status}</span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div><p className="text-sm text-muted-foreground">Date</p><p className="font-medium text-foreground">{selectedAppointment.date}</p></div>
                <div><p className="text-sm text-muted-foreground">Time</p><p className="font-medium text-foreground">{selectedAppointment.time}</p></div>
              </div>
              <div><p className="text-sm text-muted-foreground">Reason</p><p className="font-medium text-foreground">{selectedAppointment.reason}</p></div>

              {/* Visit Notes */}
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Visit Notes</p>
                  {existingRecord?.finalized ? (
                    <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">Finalized</span>
                  ) : (
                    <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">Draft</span>
                  )}
                </div>

                {formError && (
                  <div className="mb-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{formError}</div>
                )}

                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Diagnosis / Summary</label>
                    <input value={recordDraft.diagnosis} onChange={(e) => setRecordDraft(p => ({ ...p, diagnosis: e.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-4 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20" placeholder="Short summary" />
                  </div>
                  
                  <div className="rounded-lg bg-secondary/30 p-4 border border-border mt-2">
                    <p className="text-sm font-medium text-foreground mb-3">Patient Vitals</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Blood Pressure</label>
                        <input value={recordDraft.vitals.bloodPressure} onChange={(e) => setRecordDraft(p => ({ ...p, vitals: { ...p.vitals, bloodPressure: e.target.value } }))} className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20" placeholder="120/80" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Heart Rate</label>
                        <input value={recordDraft.vitals.heartRate} onChange={(e) => setRecordDraft(p => ({ ...p, vitals: { ...p.vitals, heartRate: e.target.value } }))} className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20" placeholder="72 bpm" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Temperature</label>
                        <input value={recordDraft.vitals.temperature} onChange={(e) => setRecordDraft(p => ({ ...p, vitals: { ...p.vitals, temperature: e.target.value } }))} className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20" placeholder="98.6 F" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Weight</label>
                        <input value={recordDraft.vitals.weight} onChange={(e) => setRecordDraft(p => ({ ...p, vitals: { ...p.vitals, weight: e.target.value } }))} className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20" placeholder="75 kg" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Treatment Details <span className="text-destructive">*</span></label>
                    <textarea value={recordDraft.treatment} onChange={(e) => setRecordDraft(p => ({ ...p, treatment: e.target.value }))} rows={4} className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20" placeholder="Treatment plan..." />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Prescription <span className="text-destructive">*</span></label>
                    <textarea value={recordDraft.prescription} onChange={(e) => setRecordDraft(p => ({ ...p, prescription: e.target.value }))} rows={3} className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20" placeholder="Medication, dosage, frequency..." />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Additional Notes</label>
                    <textarea value={recordDraft.notes} onChange={(e) => setRecordDraft(p => ({ ...p, notes: e.target.value }))} rows={3} className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20" placeholder="Follow-up instructions..." />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedAppointment.status !== 'completed' && selectedAppointment.status !== 'cancelled' && (
                <div className="flex gap-3 border-t border-border pt-4">
                  {selectedAppointment.status === 'scheduled' && (
                    <>
                      <button onClick={() => updateStatus(selectedAppointment.id, 'in-progress')} className="flex-1 cursor-pointer rounded-lg bg-warning px-4 py-2 text-sm font-medium text-warning-foreground transition-colors hover:bg-warning/90">Start Appointment</button>
                      <button onClick={() => updateStatus(selectedAppointment.id, 'cancelled')} className="cursor-pointer rounded-lg border border-destructive px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10">Cancel</button>
                    </>
                  )}
                  {selectedAppointment.status === 'in-progress' && (
                    <>
                      <button onClick={() => saveDraft(false)} disabled={isSaving} className="flex-1 cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50">
                        {isSaving ? 'Saving…' : 'Save Draft'}
                      </button>
                      <button onClick={() => saveDraft(true)} disabled={isSaving} className="flex-1 cursor-pointer rounded-lg bg-success px-4 py-2 text-sm font-medium text-success-foreground transition-colors hover:bg-success/90 disabled:opacity-50">
                        Finalize &amp; Complete
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <button onClick={() => setSelectedAppointment(null)} className="mt-4 w-full cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
