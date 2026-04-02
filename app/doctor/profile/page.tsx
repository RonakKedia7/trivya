"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authService, doctorsService } from "@/lib/api";
import { Doctor } from "@/lib/types";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import {
  PASSWORD_POLICY_TEXT,
  isStrongPassword,
} from "@/lib/utils/passwordPolicy";
import { clearLastLoginPassword, getLastLoginPassword } from "@/lib/api/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DoctorProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Find doctor by email in the store
    doctorsService.getAll({ limit: 100 }).then((res) => {
      if (res.success) {
        const doctor =
          res.data.find((d) => d.email === user.email) ?? res.data[0];
        if (doctor) setProfile(doctor);
      }
      setIsLoading(false);
    });
  }, [user]);

  useEffect(() => {
    if (!user?.mustChangePassword) return;
    const rememberedPassword = getLastLoginPassword();
    if (rememberedPassword) {
      setPasswordForm((prev) => ({
        ...prev,
        currentPassword: rememberedPassword,
      }));
    }
  }, [user?.mustChangePassword]);

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    const res = await doctorsService.update(profile.id, {
      name: profile.name,
      phone: profile.phone,
      specialization: profile.specialization,
      experience: profile.experience,
      consultationFee: profile.consultationFee,
      qualification: profile.qualification,
      bio: profile.bio,
    });

    if (res.success) {
      setProfile(res.data);
      setIsEditing(false);
      setMessage({ type: "success", text: "Profile saved successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } else {
      setMessage({
        type: "error",
        text: res.error || "Failed to save profile",
      });
    }
    setIsSaving(false);
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordError("All password fields are required");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation must match");
      return;
    }
    if (!isStrongPassword(passwordForm.newPassword)) {
      setPasswordError(PASSWORD_POLICY_TEXT);
      return;
    }

    setIsChangingPassword(true);
    const res = await authService.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
    setIsChangingPassword(false);

    if (!res.success) {
      setPasswordError(res.error || "Failed to update password");
      return;
    }

    clearLastLoginPassword();
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setMessage({ type: "success", text: "Password updated successfully" });
    router.push("/doctor");
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Doctor profile not found.</p>
      </div>
    );
  }

  const inputCls =
    "mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground disabled:cursor-not-allowed disabled:bg-secondary/50 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20";

  return (
    <div>
      {user?.mustChangePassword && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-100/50 px-4 py-3 text-sm font-medium text-amber-900 dark:border-amber-600/40 dark:bg-amber-900/20 dark:text-amber-200">
          You must update your password before continuing.
        </div>
      )}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">
            View and update your profile information
          </p>
        </div>
        {message.text && (
          <div
            className={`flex items-center gap-2 text-sm ${message.type === "success" ? "text-success" : "text-destructive"}`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {message.text}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-chart-2/10 text-3xl font-bold text-chart-2">
              {profile.name.charAt(0)}
            </div>
            <h2 className="mt-4 text-xl font-bold text-foreground">
              {profile.name}
            </h2>
            <p className="text-muted-foreground">{profile.specialization}</p>
            <span className="mt-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {profile.department}
            </span>

            <div className="mt-6 space-y-3 text-left">
              {[
                { label: "Experience", value: `${profile.experience} years` },
                {
                  label: "Consultation Fee",
                  value: `$${profile.consultationFee}`,
                },
                { label: "Qualification", value: profile.qualification },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-lg bg-secondary/50 px-4 py-3"
                >
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-medium text-foreground">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                Profile Information
              </h3>
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
                    onClick={() => {
                      setIsEditing(false);
                      setMessage({ type: "", text: "" });
                    }}
                    className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    disabled={!isEditing}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={profile.phone || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    disabled={!isEditing}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={profile.specialization}
                    onChange={(e) =>
                      setProfile({ ...profile, specialization: e.target.value })
                    }
                    disabled={!isEditing}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Experience (years)
                  </label>
                  <input
                    type="number"
                    value={profile.experience}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        experience: parseInt(e.target.value) || 0,
                      })
                    }
                    disabled={!isEditing}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Consultation Fee ($)
                  </label>
                  <input
                    type="number"
                    value={profile.consultationFee}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        consultationFee: parseInt(e.target.value) || 0,
                      })
                    }
                    disabled={!isEditing}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">
                  Qualification
                </label>
                <input
                  type="text"
                  value={profile.qualification}
                  onChange={(e) =>
                    setProfile({ ...profile, qualification: e.target.value })
                  }
                  disabled={!isEditing}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">
                  Bio
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  disabled={!isEditing}
                  rows={4}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="mt-8 border-t border-border pt-6">
              <h3 className="text-lg font-semibold text-foreground">
                Change Password
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {PASSWORD_POLICY_TEXT}
              </p>
              {passwordError && (
                <div className="mt-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {passwordError}
                </div>
              )}
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    className={inputCls}
                    placeholder={
                      user?.mustChangePassword
                        ? "Auto-filled from this login session"
                        : ""
                    }
                  />
                  {user?.mustChangePassword && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Auto-filled from your temporary login to reduce friction.
                    </p>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      className={inputCls}
                    />
                  </div>
                </div>
                <button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {isChangingPassword && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
