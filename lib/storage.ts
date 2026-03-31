"use client"

import { Appointment, MedicalRecord } from "@/lib/types"
import { mockAppointments, mockMedicalRecords } from "@/lib/mock-data"

const KEYS = {
  appointments: "hms_appointments",
  medicalRecords: "hms_medical_records",
} as const

function ensureSeeded() {
  if (typeof window === "undefined") return

  if (!localStorage.getItem(KEYS.appointments)) {
    localStorage.setItem(KEYS.appointments, JSON.stringify(mockAppointments))
  }
  if (!localStorage.getItem(KEYS.medicalRecords)) {
    localStorage.setItem(KEYS.medicalRecords, JSON.stringify(mockMedicalRecords))
  }
}

function safeParseJSON<T>(value: string | null): T | null {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export function getAppointments(): Appointment[] {
  if (typeof window === "undefined") return mockAppointments
  ensureSeeded()
  const stored = safeParseJSON<Appointment[]>(localStorage.getItem(KEYS.appointments))
  return stored ?? mockAppointments
}

export function setAppointments(next: Appointment[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(KEYS.appointments, JSON.stringify(next))
}

export function upsertAppointment(next: Appointment) {
  const all = getAppointments()
  const idx = all.findIndex((a) => a.id === next.id)
  const updated = idx >= 0 ? all.map((a) => (a.id === next.id ? next : a)) : [next, ...all]
  setAppointments(updated)
}

export function getMedicalRecords(): MedicalRecord[] {
  if (typeof window === "undefined") return mockMedicalRecords
  ensureSeeded()
  const stored = safeParseJSON<MedicalRecord[]>(
    localStorage.getItem(KEYS.medicalRecords),
  )
  return stored ?? mockMedicalRecords
}

export function setMedicalRecords(next: MedicalRecord[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(KEYS.medicalRecords, JSON.stringify(next))
}

export function upsertMedicalRecord(next: MedicalRecord) {
  const all = getMedicalRecords()
  const idx = all.findIndex((r) => r.appointmentId === next.appointmentId)
  const updated =
    idx >= 0 ? all.map((r) => (r.appointmentId === next.appointmentId ? next : r)) : [next, ...all]
  setMedicalRecords(updated)
}

