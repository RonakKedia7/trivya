'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockDoctors } from '@/lib/mock-data';
import { Doctor } from '@/lib/types';

export default function DoctorProfilePage() {
  const { user } = useAuth();
  const currentDoctor = mockDoctors.find(d => d.email === user?.email) || mockDoctors[0];
  
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<Doctor>(currentDoctor);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In a real app, this would save to the backend
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">View and update your profile information</p>
        </div>
        {saved && (
          <span className="rounded-lg bg-success/10 px-4 py-2 text-sm font-medium text-success">
            Profile saved successfully!
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-chart-2/10 text-3xl font-bold text-chart-2">
              {profile.name.charAt(0)}
            </div>
            <h2 className="mt-4 text-xl font-bold text-foreground">{profile.name}</h2>
            <p className="text-muted-foreground">{profile.specialization}</p>
            <span className="mt-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {profile.department}
            </span>

            <div className="mt-6 space-y-3 text-left">
              <div className="flex items-center gap-3 rounded-lg bg-secondary/50 px-4 py-3">
                <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs text-muted-foreground">Experience</p>
                  <p className="font-medium text-foreground">{profile.experience} years</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-secondary/50 px-4 py-3">
                <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs text-muted-foreground">Consultation Fee</p>
                  <p className="font-medium text-foreground">${profile.consultationFee}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-secondary/50 px-4 py-3">
                <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <div>
                  <p className="text-xs text-muted-foreground">Qualification</p>
                  <p className="font-medium text-foreground">{profile.qualification}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Profile Information</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    disabled={!isEditing}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground disabled:cursor-not-allowed disabled:bg-secondary/50 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="mt-1 w-full cursor-not-allowed rounded-lg border border-input bg-secondary/50 px-4 py-2 text-muted-foreground"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground">Phone</label>
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    disabled={!isEditing}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground disabled:cursor-not-allowed disabled:bg-secondary/50 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Specialization</label>
                  <input
                    type="text"
                    value={profile.specialization}
                    onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                    disabled={!isEditing}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground disabled:cursor-not-allowed disabled:bg-secondary/50 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground">Experience (years)</label>
                  <input
                    type="number"
                    value={profile.experience}
                    onChange={(e) => setProfile({ ...profile, experience: parseInt(e.target.value) || 0 })}
                    disabled={!isEditing}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground disabled:cursor-not-allowed disabled:bg-secondary/50 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Consultation Fee ($)</label>
                  <input
                    type="number"
                    value={profile.consultationFee}
                    onChange={(e) => setProfile({ ...profile, consultationFee: parseInt(e.target.value) || 0 })}
                    disabled={!isEditing}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground disabled:cursor-not-allowed disabled:bg-secondary/50 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Qualification</label>
                <input
                  type="text"
                  value={profile.qualification}
                  onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
                  disabled={!isEditing}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground disabled:cursor-not-allowed disabled:bg-secondary/50 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground disabled:cursor-not-allowed disabled:bg-secondary/50 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
