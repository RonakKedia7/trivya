// ─────────────────────────────────────────────────────────────────────────────
// lib/api/patients.service.ts  — Mock Patients Service
// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTION SWAP — replace each method body with apiFetch calls to:
//   GET    /api/v1/patients                     → list (admin only)
//   GET    /api/v1/patients/:id                 → single (admin / self)
//   PUT    /api/v1/patients/:id/profile         → update profile (self)
//   DELETE /api/v1/patients/:id                 → delete (admin only)
//   GET    /api/v1/patients/:id/medical-records → patient's medical records
//   GET    /api/v1/patients/:id/appointments    → patient's appointments
// ─────────────────────────────────────────────────────────────────────────────

import { simulateDelay } from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  UpdatePatientProfileRequest,
} from './types';
import { Patient } from '@/lib/types';
import { mockPatients } from '@/lib/mock-data';

const STORAGE_KEY = 'hms_patients';
let _patients: Patient[] = [...mockPatients];

function loadPatients(): Patient[] {
  if (typeof window === 'undefined') return _patients;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    _patients = JSON.parse(stored);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_patients));
  }
  return _patients;
}

function savePatients(patients: Patient[]) {
  _patients = patients;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  }
}

export const patientsService = {
  /**
   * GET /patients  (admin only)
   */
  async getAll(options: { search?: string; page?: number; limit?: number } = {}): Promise<PaginatedResponse<Patient>> {
    await simulateDelay(350);

    const all = loadPatients();
    let result = all;

    if (options.search) {
      const q = options.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q),
      );
    }

    const page = options.page ?? 1;
    const limit = options.limit ?? 50;
    const total = result.length;
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      success: true,
      data: result.slice((page - 1) * limit, page * limit),
      pagination: { total, page, limit, totalPages },
    };
  },

  /**
   * GET /patients/:id
   */
  async getById(id: string): Promise<ApiResponse<Patient>> {
    await simulateDelay(250);

    const patient = loadPatients().find((p) => p.id === id);
    if (!patient) {
      return { success: false, data: null as unknown as Patient, error: 'Patient not found' };
    }
    return { success: true, data: patient };
  },

  /**
   * PUT /patients/:id/profile  (self or admin)
   */
  async updateProfile(
    id: string,
    req: UpdatePatientProfileRequest,
  ): Promise<ApiResponse<Patient>> {
    await simulateDelay(400);

    const all = loadPatients();
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) {
      return { success: false, data: null as unknown as Patient, error: 'Patient not found' };
    }

    const updated: Patient = { ...all[idx], ...req };
    savePatients(all.map((p) => (p.id === id ? updated : p)));

    // Keep localStorage user in sync
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hms_user');
      if (stored) {
        const storedUser = JSON.parse(stored);
        if (storedUser.id === id) {
          localStorage.setItem('hms_user', JSON.stringify(updated));
        }
      }
    }

    return { success: true, data: updated, message: 'Profile updated successfully' };
  },

  /**
   * DELETE /patients/:id  (admin only)
   */
  async delete(id: string): Promise<ApiResponse<null>> {
    await simulateDelay(400);

    const all = loadPatients();
    if (!all.some((p) => p.id === id)) {
      return { success: false, data: null, error: 'Patient not found' };
    }

    savePatients(all.filter((p) => p.id !== id));
    return { success: true, data: null, message: 'Patient deleted successfully' };
  },

  /**
   * GET /patients/:id/appointments
   */
  async getAppointments(id: string): Promise<ApiResponse<any[]>> {
    await simulateDelay(300);
    const stored = typeof window !== 'undefined' ? localStorage.getItem('hms_appointments') : null;
    const all = stored ? JSON.parse(stored) : [];
    return { success: true, data: all.filter((a: any) => a.patientId === id) };
  },

  /**
   * GET /patients/:id/medical-records
   */
  async getMedicalRecords(id: string): Promise<ApiResponse<any[]>> {
    await simulateDelay(300);
    const stored = typeof window !== 'undefined' ? localStorage.getItem('hms_medical_records') : null;
    const all = stored ? JSON.parse(stored) : [];
    return { success: true, data: all.filter((r: any) => r.patientId === id) };
  },
};
