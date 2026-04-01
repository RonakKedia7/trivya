'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { authService } from '@/lib/api';
import { PASSWORD_POLICY_TEXT, isStrongPassword } from '@/lib/utils/passwordPolicy';

export default function AdminProfilePage() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('New password and confirmation must match');
      return;
    }
    if (!isStrongPassword(form.newPassword)) {
      setError(PASSWORD_POLICY_TEXT);
      return;
    }

    setIsSaving(true);
    const res = await authService.changePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });
    setIsSaving(false);

    if (!res.success) {
      setError(res.error || 'Failed to update password');
      return;
    }

    setSuccess('Password updated successfully');
    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const inputCls =
    'mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20';

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">Admin Profile</h1>
      <p className="mt-1 text-muted-foreground">Manage your account security settings.</p>

      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Change Password</h2>
        <p className="mt-1 text-sm text-muted-foreground">{PASSWORD_POLICY_TEXT}</p>

        {error && <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
        {success && <div className="mt-4 rounded-lg bg-primary/10 p-3 text-sm text-primary">{success}</div>}

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">Current Password</label>
            <input
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              className={inputCls}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground">New Password</label>
              <input
                type="password"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Confirm New Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSaving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
