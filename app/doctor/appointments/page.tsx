'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockAppointments, mockDoctors } from '@/lib/mock-data';
import { Appointment, AppointmentStatus } from '@/lib/types';

export default function DoctorAppointmentsPage() {
  const { user } = useAuth();
  const currentDoctor = mockDoctors.find(d => d.email === user?.email) || mockDoctors[0];
  
  const [appointments, setAppointments] = useState<Appointment[]>(
    mockAppointments.filter(a => a.doctorId === currentDoctor.id)
  );
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const filteredAppointments = appointments.filter(apt => {
    const matchesStatus = !statusFilter || apt.status === statusFilter;
    const matchesDate = !dateFilter || apt.date === dateFilter;
    return matchesStatus && matchesDate;
  });

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
    setAppointments(appointments.map(apt => 
      apt.id === id ? { ...apt, status } : apt
    ));
    if (selectedAppointment?.id === id) {
      setSelectedAppointment({ ...selectedAppointment, status });
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
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="cursor-pointer rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
        >
          <option value="">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="cursor-pointer rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
        {(statusFilter || dateFilter) && (
          <button
            onClick={() => { setStatusFilter(''); setDateFilter(''); }}
            className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary"
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
                            onClick={() => updateAppointmentStatus(apt.id, 'in-progress')}
                            className="cursor-pointer text-sm text-warning hover:underline"
                          >
                            Start
                          </button>
                        </>
                      )}
                      {apt.status === 'in-progress' && (
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'completed')}
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
          <div className="w-full max-w-lg rounded-xl bg-card p-6">
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

              {selectedAppointment.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-foreground">{selectedAppointment.notes}</p>
                </div>
              )}

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
                    <button
                      onClick={() => updateAppointmentStatus(selectedAppointment.id, 'completed')}
                      className="flex-1 cursor-pointer rounded-lg bg-success px-4 py-2 text-sm font-medium text-success-foreground transition-colors hover:bg-success/90"
                    >
                      Mark as Completed
                    </button>
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
