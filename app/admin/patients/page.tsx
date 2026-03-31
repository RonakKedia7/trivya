'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { mockPatients } from '@/lib/mock-data';
import { Appointment } from '@/lib/types';
import { getAppointments } from '@/lib/storage';

export default function AdminPatientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    setAppointments(getAppointments());
  }, []);

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone?.includes(searchQuery)
  );

  const appointmentCountByPatientId = useMemo(() => {
    const map: Record<string, number> = {};
    for (const apt of appointments) {
      map[apt.patientId] = (map[apt.patientId] ?? 0) + 1;
    }
    return map;
  }, [appointments]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Patients Management</h1>
        <p className="text-muted-foreground">View and manage all registered patients</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search patients by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
      </div>

      {/* Patients Table */}
      <div className="rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Date of Birth</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Blood Group</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Appointments</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-secondary/30">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-2/10 text-sm font-medium text-chart-2">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{patient.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{patient.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-foreground">{patient.email}</p>
                    <p className="text-sm text-muted-foreground">{patient.phone}</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                    {patient.dateOfBirth}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                      {patient.bloodGroup}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                    {(appointmentCountByPatientId[patient.id] ?? 0)} appointments
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Link
                      href={`/admin/patients/${patient.id}`}
                      className="cursor-pointer text-sm text-primary hover:underline"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPatients.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No patients found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
