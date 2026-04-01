// ─────────────────────────────────────────────────────────────────────────────
// lib/api/medical-records.service.ts  — Mock Medical Records Service
// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTION SWAP — replace each method body with apiFetch calls to:
//   GET    /api/v1/medical-records                          → list (admin)
//   POST   /api/v1/medical-records                          → create (doctor)
//   GET    /api/v1/medical-records/:id                      → single
//   PUT    /api/v1/medical-records/:id                      → update (doctor)
//   GET    /api/v1/medical-records/patient/:patientId       → by patient
//   GET    /api/v1/medical-records/appointment/:appointmentId → by appointment
// ─────────────────────────────────────────────────────────────────────────────

import { simulateDelay } from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  CreateMedicalRecordRequest,
  UpdateMedicalRecordRequest,
} from './types';
import { MedicalRecord } from '@/lib/types';
import { mockMedicalRecords } from '@/lib/mock-data';

const STORAGE_KEY = 'hms_medical_records';

function loadRecords(): MedicalRecord[] {
  if (typeof window === 'undefined') return [...mockMedicalRecords];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored) as MedicalRecord[];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockMedicalRecords));
  return [...mockMedicalRecords];
}

function saveRecords(records: MedicalRecord[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }
}

export const medicalRecordsService = {
  /**
   * GET /medical-records  (admin)
   */
  async getAll(options: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<MedicalRecord>> {
    await simulateDelay(300);

    const all = loadRecords();
    all.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());

    const page = options.page ?? 1;
    const limit = options.limit ?? 50;

    return {
      success: true,
      data: all.slice((page - 1) * limit, page * limit),
      pagination: {
        total: all.length,
        page,
        limit,
        totalPages: Math.ceil(all.length / limit) || 1,
      },
    };
  },

  /**
   * GET /medical-records/:id
   */
  async getById(id: string): Promise<ApiResponse<MedicalRecord>> {
    await simulateDelay(200);

    const record = loadRecords().find((r) => r.id === id);
    if (!record) {
      return { success: false, data: null as unknown as MedicalRecord, error: 'Record not found' };
    }
    return { success: true, data: record };
  },

  /**
   * GET /medical-records/patient/:patientId
   */
  async getByPatient(patientId: string): Promise<ApiResponse<MedicalRecord[]>> {
    await simulateDelay(250);

    const all = loadRecords().filter((r) => r.patientId === patientId);
    all.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());

    return { success: true, data: all };
  },

  /**
   * GET /medical-records/doctor/:doctorId
   */
  async getByDoctor(doctorId: string): Promise<ApiResponse<MedicalRecord[]>> {
    await simulateDelay(250);

    const all = loadRecords().filter((r) => r.doctorId === doctorId);
    all.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());

    return { success: true, data: all };
  },

  /**
   * GET /medical-records/appointment/:appointmentId
   */
  async getByAppointment(appointmentId: string): Promise<ApiResponse<MedicalRecord | null>> {
    await simulateDelay(200);

    const record = loadRecords().find((r) => r.appointmentId === appointmentId) ?? null;
    return { success: true, data: record };
  },

  /**
   * POST /medical-records  (doctor)
   * Production: also checks that appointmentId belongs to the requesting doctor.
   */
  async create(
    req: CreateMedicalRecordRequest,
    doctorContext: { id: string; name: string; patientId: string; patientName: string; date: string },
  ): Promise<ApiResponse<MedicalRecord>> {
    await simulateDelay(500);

    const all = loadRecords();

    // Prevent duplicate record for the same appointment
    const existing = all.find((r) => r.appointmentId === req.appointmentId);
    if (existing && req.finalized) {
      return {
        success: false,
        data: existing,
        error: 'A finalized record already exists for this appointment',
      };
    }

    const record: MedicalRecord = {
      id: existing?.id ?? `rec-${Date.now()}`,
      appointmentId: req.appointmentId,
      patientId: doctorContext.patientId,
      patientName: doctorContext.patientName,
      doctorId: doctorContext.id,
      doctorName: doctorContext.name,
      visitDate: doctorContext.date,
      diagnosis: req.diagnosis,
      treatment: req.treatment,
      prescription: req.prescription,
      notes: req.notes,
      finalized: req.finalized,
      updatedAt: new Date().toISOString(),
      vitals: req.vitals,
    };

    if (existing) {
      saveRecords(all.map((r) => (r.appointmentId === req.appointmentId ? record : r)));
    } else {
      saveRecords([record, ...all]);
    }

    return { success: true, data: record, message: req.finalized ? 'Record finalized' : 'Draft saved' };
  },

  /**
   * PUT /medical-records/:id  (doctor)
   */
  async update(
    id: string,
    req: UpdateMedicalRecordRequest,
  ): Promise<ApiResponse<MedicalRecord>> {
    await simulateDelay(400);

    const all = loadRecords();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) {
      return { success: false, data: null as unknown as MedicalRecord, error: 'Record not found' };
    }

    const current = all[idx];
    if (current.finalized && !req.finalized) {
      // Cannot un-finalize; production would also prevent this at DB level.
      return { success: false, data: current, error: 'Cannot edit a finalized record' };
    }

    const updated: MedicalRecord = {
      ...current,
      ...req,
      updatedAt: new Date().toISOString(),
    };

    saveRecords(all.map((r) => (r.id === id ? updated : r)));
    return { success: true, data: updated, message: 'Record updated' };
  },
};
