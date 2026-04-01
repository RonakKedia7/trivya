'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Doctor } from '@/lib/types';
import { doctorsService, appointmentsService } from '@/lib/api';
import type { CreateDoctorRequest } from '@/lib/api';
import { departments } from '@/lib/mock-data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [newDoctor, setNewDoctor] = useState<CreateDoctorRequest>({
    name: '', email: '', phone: '', password: 'doctor123',
    specialization: '', department: '', qualification: '',
    experience: 0, consultationFee: 0, bio: '',
  });

  // ── Load doctors on mount and whenever filters change ──────────────────────
  useEffect(() => {
    setIsLoading(true);
    doctorsService
      .getAll({ search: searchQuery || undefined, department: selectedDepartment || undefined })
      .then((res) => {
        if (res.success) setDoctors(res.data);
        setIsLoading(false);
      });
  }, [searchQuery, selectedDepartment]);

  // ── CRUD handlers ──────────────────────────────────────────────────────────

  const handleAddDoctor = async () => {
    setIsSaving(true);
    setError('');
    const res = await doctorsService.create(newDoctor);
    if (res.success) {
      setDoctors((prev) => [...prev, res.data]);
      setShowAddModal(false);
      setNewDoctor({
        name: '', email: '', phone: '', password: 'doctor123',
        specialization: '', department: '', qualification: '',
        experience: 0, consultationFee: 0, bio: '',
      });
    } else {
      setError(res.error ?? 'Failed to create doctor');
    }
    setIsSaving(false);
  };

  const handleUpdateDoctor = async () => {
    if (!editingDoctor) return;
    setIsSaving(true);
    setError('');
    const res = await doctorsService.update(editingDoctor.id, {
      name: editingDoctor.name,
      phone: editingDoctor.phone,
      specialization: editingDoctor.specialization,
      department: editingDoctor.department,
      qualification: editingDoctor.qualification,
      experience: editingDoctor.experience,
      consultationFee: editingDoctor.consultationFee,
      bio: editingDoctor.bio,
    });
    if (res.success) {
      setDoctors((prev) => prev.map((d) => (d.id === editingDoctor.id ? res.data : d)));
      setEditingDoctor(null);
    } else {
      setError(res.error ?? 'Failed to update doctor');
    }
    setIsSaving(false);
  };

  const handleDeleteDoctor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return;
    const res = await doctorsService.delete(id);
    if (res.success) {
      setDoctors((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const inputCls = 'mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20';

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Doctors Management</h1>
          <p className="text-muted-foreground">Manage all doctors in the hospital</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Doctor
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search doctors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-background px-4 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <Select value={selectedDepartment || 'all'} onValueChange={(v) => setSelectedDepartment(v === 'all' ? '' : v)}>
          <SelectTrigger className="sm:w-[240px]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {/* Doctors Grid */}
      {!isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-medium text-primary">
                    {doctor.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{doctor.name}</h3>
                    <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingDoctor(doctor)}
                    className="cursor-pointer rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteDoctor(doctor.id)}
                    className="cursor-pointer rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {doctor.department}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {doctor.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {doctor.experience} years experience
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ${doctor.consultationFee} per visit
                </div>
              </div>
              <Link
                href={`/admin/doctors/${doctor.id}`}
                className="mt-4 block cursor-pointer rounded-lg border border-border bg-background px-4 py-2 text-center text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}

      {!isLoading && doctors.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No doctors found matching your criteria.</p>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Add New Doctor</h2>
              <button onClick={() => setShowAddModal(false)} className="cursor-pointer rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {error && <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
            <div className="space-y-4">
              {[
                { label: 'Full Name', field: 'name', type: 'text' },
                { label: 'Email', field: 'email', type: 'email' },
                { label: 'Phone', field: 'phone', type: 'tel' },
                { label: 'Qualification', field: 'qualification', type: 'text', placeholder: 'e.g., MD, FACC' },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-foreground">{label}</label>
                  <input
                    type={type}
                    value={(newDoctor as any)[field] || ''}
                    onChange={(e) => setNewDoctor({ ...newDoctor, [field]: e.target.value })}
                    className={inputCls}
                    placeholder={placeholder}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-foreground">Department</label>
                <Select
                  value={newDoctor.department || 'none'}
                  onValueChange={(v) => setNewDoctor({ ...newDoctor, department: v === 'none' ? '' : v, specialization: v === 'none' ? '' : v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select department</SelectItem>
                    {departments.map((dept) => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground">Experience (years)</label>
                  <input type="number" value={newDoctor.experience} onChange={(e) => setNewDoctor({ ...newDoctor, experience: parseInt(e.target.value) || 0 })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Consultation Fee ($)</label>
                  <input type="number" value={newDoctor.consultationFee} onChange={(e) => setNewDoctor({ ...newDoctor, consultationFee: parseInt(e.target.value) || 0 })} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Bio</label>
                <textarea value={newDoctor.bio} onChange={(e) => setNewDoctor({ ...newDoctor, bio: e.target.value })} rows={3} className={inputCls} />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowAddModal(false)} className="flex-1 cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
                  Cancel
                </button>
                <button onClick={handleAddDoctor} disabled={isSaving} className="flex-1 cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
                  {isSaving ? 'Saving…' : 'Add Doctor'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {editingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Edit Doctor</h2>
              <button onClick={() => setEditingDoctor(null)} className="cursor-pointer rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {error && <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">Full Name</label>
                <input type="text" value={editingDoctor.name} onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Email</label>
                <input type="email" value={editingDoctor.email} disabled className={`${inputCls} opacity-60`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Department</label>
                <Select
                  value={editingDoctor.department}
                  onValueChange={(v) => setEditingDoctor({ ...editingDoctor, department: v, specialization: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Qualification</label>
                <input type="text" value={editingDoctor.qualification} onChange={(e) => setEditingDoctor({ ...editingDoctor, qualification: e.target.value })} className={inputCls} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground">Experience (years)</label>
                  <input type="number" value={editingDoctor.experience} onChange={(e) => setEditingDoctor({ ...editingDoctor, experience: parseInt(e.target.value) || 0 })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Consultation Fee ($)</label>
                  <input type="number" value={editingDoctor.consultationFee} onChange={(e) => setEditingDoctor({ ...editingDoctor, consultationFee: parseInt(e.target.value) || 0 })} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Bio</label>
                <textarea value={editingDoctor.bio} onChange={(e) => setEditingDoctor({ ...editingDoctor, bio: e.target.value })} rows={3} className={inputCls} />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setEditingDoctor(null)} className="flex-1 cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
                  Cancel
                </button>
                <button onClick={handleUpdateDoctor} disabled={isSaving} className="flex-1 cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
                  {isSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
