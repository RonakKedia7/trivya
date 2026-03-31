'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockDoctors } from '@/lib/mock-data';
import { Appointment, AppointmentStatus, MedicalRecord } from '@/lib/types';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAppointments, setAppointments, getMedicalRecords, upsertMedicalRecord, upsertAppointment } from '@/lib/storage';

export default function DoctorAppointmentsPage() {
  const { user } = useAuth();
  const currentDoctor = mockDoctors.find(d => d.email === user?.email) || mockDoctors[0];
  
  const [appointments, setAppointmentsState] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [recordDraft, setRecordDraft] = useState<{
    diagnosis: string;
    treatment: string;
    prescription: string;
    notes: string;
  }>({ diagnosis: '', treatment: '', prescription: '', notes: '' });
  const [formError, setFormError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const all = getAppointments();
    const mine = all.filter((a) => a.doctorId === currentDoctor.id);
    setAppointmentsState(mine);
  }, [currentDoctor.id]);

  const filteredAppointments = appointments.filter(apt => {
    const matchesStatus = !statusFilter || apt.status === statusFilter;
    const matchesDate = !dateFilter || apt.date === dateFilter;
    return matchesStatus && matchesDate;
  });

  const selectedRecord = useMemo(() => {
    if (!selectedAppointment) return null;
    const records = getMedicalRecords();
    return records.find((r) => r.appointmentId === selectedAppointment.id) ?? null;
  }, [selectedAppointment]);

  useEffect(() => {
    if (!selectedAppointment) return;
    const existing = selectedRecord;
    setRecordDraft({
      diagnosis: existing?.diagnosis ?? selectedAppointment.reason,
      treatment: existing?.treatment ?? '',
      prescription: existing?.prescription ?? '',
      notes: existing?.notes ?? '',
    });
    setFormError('');
  }, [selectedAppointment, selectedRecord]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-chart-1/10 text-chart-1';
      case 'completed':
        return 'bg-success/10 text-success';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive';
      case 'in-progress':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    const nextAll = getAppointments().map((apt) =>
      apt.id === id ? { ...apt, status } : apt,
    );
    setAppointments(nextAll);
    const mine = nextAll.filter((a) => a.doctorId === currentDoctor.id);
    setAppointmentsState(mine);
    if (selectedAppointment?.id === id) {
      setSelectedAppointment({ ...selectedAppointment, status });
    }
  };

  const saveDraft = async (finalize: boolean) => {
    if (!selectedAppointment) return;
    setIsSaving(true);
    setFormError('');

    const diagnosis = recordDraft.diagnosis.trim() || selectedAppointment.reason;
    const treatment = recordDraft.treatment.trim();
    const prescription = recordDraft.prescription.trim();
    const notes = recordDraft.notes.trim();

    if (finalize) {
      if (!treatment) {
        setFormError('Treatment details are required to complete the appointment.');
        setIsSaving(false);
        return;
      }
      if (!prescription) {
        setFormError('Prescription information is required to complete the appointment.');
        setIsSaving(false);
        return;
      }
    }

    const record: MedicalRecord = {
      id: selectedRecord?.id ?? `rec-${Date.now()}`,
      appointmentId: selectedAppointment.id,
      patientId: selectedAppointment.patientId,
      patientName: selectedAppointment.patientName,
      doctorId: selectedAppointment.doctorId,
      doctorName: selectedAppointment.doctorName,
      visitDate: selectedAppointment.date,
      diagnosis,
      treatment: treatment || selectedRecord?.treatment || '',
      prescription: prescription || undefined,
      notes: notes || undefined,
      finalized: finalize ? true : selectedRecord?.finalized,
      updatedAt: new Date().toISOString(),
      vitals: selectedRecord?.vitals,
    };

    upsertMedicalRecord(record);

    if (finalize) {
      const updatedAppointment: Appointment = {
        ...selectedAppointment,
        status: 'completed',
        notes: notes || selectedAppointment.notes,
      };
      upsertAppointment(updatedAppointment);
      updateAppointmentStatus(selectedAppointment.id, 'completed');
    }

    setIsSaving(false);
  };

  const handleStartFromRow = (apt: Appointment) => {
    if (apt.status !== 'scheduled') return;
    updateAppointmentStatus(apt.id, 'in-progress');
    setSelectedAppointment({ ...apt, status: 'in-progress' });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">My Appointments</h1>
        <p className="text-muted-foreground">Manage and update your appointments</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <Select
          value={statusFilter || 'all'}
          onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}
        >
          <SelectTrigger className="sm:w-[220px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <DatePicker
          value={dateFilter}
          onChange={setDateFilter}
          placeholder="Filter by date"
          className="sm:w-[220px]"
        />
        {(statusFilter || dateFilter) && (
          <button
            onClick={() => { setStatusFilter(''); setDateFilter(''); }}
            className="h-10 cursor-pointer rounded-lg border border-border px-4 text-sm text-muted-foreground transition-colors hover:bg-secondary sm:w-[220px]"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Appointments List */}
      <div className="rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-secondary/30">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chart-2/10 text-sm font-medium text-chart-2">
                        {apt.patientName.charAt(0)}
                      </div>
                      <span className="font-medium text-foreground">{apt.patientName}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                    {apt.date} at {apt.time}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <span className="line-clamp-1">{apt.reason}</span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedAppointment(apt)}
                        className="cursor-pointer text-sm text-primary hover:underline"
                      >
                        View
                      </button>
                      {apt.status === 'scheduled' && (
                        <>
                          <button
                            onClick={() => handleStartFromRow(apt)}
                            className="cursor-pointer text-sm text-warning hover:underline"
                          >
                            Start
                          </button>
                        </>
                      )}
                      {apt.status === 'in-progress' && (
                        <button
                          onClick={() => setSelectedAppointment(apt)}
                          className="cursor-pointer text-sm text-success hover:underline"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredAppointments.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No appointments found.</p>
          </div>
        )}
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Appointment Details</h2>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="cursor-pointer rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-chart-2/10 text-xl font-medium text-chart-2">
                  {selectedAppointment.patientName.charAt(0)}
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{selectedAppointment.patientName}</p>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(selectedAppointment.status)}`}>
                    {selectedAppointment.status}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">{selectedAppointment.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium text-foreground">{selectedAppointment.time}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Reason</p>
                <p className="font-medium text-foreground">{selectedAppointment.reason}</p>
              </div>

              <div className="rounded-xl border border-border bg-background p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Visit Notes</p>
                  {selectedRecord?.finalized ? (
                    <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                      Finalized
                    </span>
                  ) : (
                    <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                      Draft
                    </span>
                  )}
                </div>

                {formError && (
                  <div className="mb-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {formError}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-foreground">Diagnosis / Summary</label>
                    <input
                      value={recordDraft.diagnosis}
                      onChange={(e) =>
                        setRecordDraft((p) => ({ ...p, diagnosis: e.target.value }))
                      }
                      className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-4 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                      placeholder="Short summary (e.g., Mild hypertension)"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-foreground">
                      Treatment Details<span className="text-destructive"> *</span>
                    </label>
                    <textarea
                      value={recordDraft.treatment}
                      onChange={(e) =>
                        setRecordDraft((p) => ({ ...p, treatment: e.target.value }))
                      }
                      rows={4}
                      className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                      placeholder="Treatment plan, procedures performed, recommendations..."
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-foreground">
                      Prescription<span className="text-destructive"> *</span>
                    </label>
                    <textarea
                      value={recordDraft.prescription}
                      onChange={(e) =>
                        setRecordDraft((p) => ({ ...p, prescription: e.target.value }))
                      }
                      rows={3}
                      className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                      placeholder="Medication, dosage, frequency..."
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-foreground">Additional Notes</label>
                    <textarea
                      value={recordDraft.notes}
                      onChange={(e) =>
                        setRecordDraft((p) => ({ ...p, notes: e.target.value }))
                      }
                      rows={3}
                      className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                      placeholder="Follow-up instructions, warnings, patient concerns..."
                    />
                  </div>
                </div>
              </div>

              {/* Status Update Buttons */}
              {selectedAppointment.status !== 'completed' && selectedAppointment.status !== 'cancelled' && (
                <div className="flex gap-3 border-t border-border pt-4">
                  {selectedAppointment.status === 'scheduled' && (
                    <>
                      <button
                        onClick={() => updateAppointmentStatus(selectedAppointment.id, 'in-progress')}
                        className="flex-1 cursor-pointer rounded-lg bg-warning px-4 py-2 text-sm font-medium text-warning-foreground transition-colors hover:bg-warning/90"
                      >
                        Start Appointment
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(selectedAppointment.id, 'cancelled')}
                        className="cursor-pointer rounded-lg border border-destructive px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {selectedAppointment.status === 'in-progress' && (
                    <>
                      <button
                        onClick={() => void saveDraft(false)}
                        disabled={isSaving}
                        className="flex-1 cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSaving ? 'Saving...' : 'Save Draft'}
                      </button>
                      <button
                        onClick={() => void saveDraft(true)}
                        disabled={isSaving}
                        className="flex-1 cursor-pointer rounded-lg bg-success px-4 py-2 text-sm font-medium text-success-foreground transition-colors hover:bg-success/90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Finalize & Complete
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedAppointment(null)}
              className="mt-4 w-full cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
