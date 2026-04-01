'use client';

import { useEffect, useState } from 'react';
import { departments } from '@/lib/mock-data';
import { Appointment } from '@/lib/types';
import { appointmentsService } from '@/lib/api';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Re-fetch whenever filters change
  useEffect(() => {
    setIsLoading(true);
    appointmentsService
      .getAll({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        department: departmentFilter || undefined,
        date: dateFilter || undefined,
        limit: 100,
      })
      .then((res) => {
        if (res.success) setAppointments(res.data);
        setIsLoading(false);
      });
  }, [searchQuery, statusFilter, departmentFilter, dateFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':   return 'bg-chart-1/10 text-chart-1';
      case 'completed':   return 'bg-success/10 text-success';
      case 'cancelled':   return 'bg-destructive/10 text-destructive';
      case 'in-progress': return 'bg-warning/10 text-warning';
      default:            return 'bg-muted text-muted-foreground';
    }
  };

  const scheduled  = appointments.filter(a => a.status === 'scheduled').length;
  const completed  = appointments.filter(a => a.status === 'completed').length;
  const cancelled  = appointments.filter(a => a.status === 'cancelled').length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Appointments Management</h1>
        <p className="text-muted-foreground">View and manage all hospital appointments</p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="text"
          placeholder="Search patient or doctor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 rounded-lg border border-input bg-background px-4 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
        <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
          <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
          </SelectContent>
        </Select>
        <Select value={departmentFilter || 'all'} onValueChange={(v) => setDepartmentFilter(v === 'all' ? '' : v)}>
          <SelectTrigger><SelectValue placeholder="All Departments" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
          </SelectContent>
        </Select>
        <DatePicker value={dateFilter} onChange={setDateFilter} placeholder="Filter by date" className="w-full" />
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-foreground">{appointments.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Scheduled</p>
          <p className="text-2xl font-bold text-chart-1">{scheduled}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold text-success">{completed}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Cancelled</p>
          <p className="text-2xl font-bold text-destructive">{cancelled}</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Date &amp; Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-secondary/30">
                    <td className="whitespace-nowrap px-6 py-4 font-mono text-sm text-muted-foreground">{apt.id.slice(0, 8)}</td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-foreground">{apt.patientName}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">{apt.doctorName}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">{apt.department}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">{apt.date} at {apt.time}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <button onClick={() => setSelectedAppointment(apt)} className="cursor-pointer text-sm text-primary hover:underline">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {appointments.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No appointments found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Appointment Details</h2>
              <button onClick={() => setSelectedAppointment(null)} className="cursor-pointer rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(selectedAppointment.status)}`}>
                  {selectedAppointment.status}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><p className="text-sm text-muted-foreground">Patient</p><p className="font-medium text-foreground">{selectedAppointment.patientName}</p></div>
                <div><p className="text-sm text-muted-foreground">Doctor</p><p className="font-medium text-foreground">{selectedAppointment.doctorName}</p></div>
                <div><p className="text-sm text-muted-foreground">Department</p><p className="font-medium text-foreground">{selectedAppointment.department}</p></div>
                <div><p className="text-sm text-muted-foreground">Date &amp; Time</p><p className="font-medium text-foreground">{selectedAppointment.date} at {selectedAppointment.time}</p></div>
              </div>
              <div><p className="text-sm text-muted-foreground">Reason</p><p className="font-medium text-foreground">{selectedAppointment.reason}</p></div>
              {selectedAppointment.notes && (
                <div><p className="text-sm text-muted-foreground">Notes</p><p className="text-foreground">{selectedAppointment.notes}</p></div>
              )}
            </div>
            <button onClick={() => setSelectedAppointment(null)} className="mt-6 w-full cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
