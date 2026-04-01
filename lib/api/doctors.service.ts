// ─────────────────────────────────────────────────────────────────────────────
// lib/api/doctors.service.ts  — Mock Doctors Service
// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTION SWAP — replace each method body with:
//   GET    /api/v1/doctors                      → list with filters
//   POST   /api/v1/doctors                      → create (admin only)
//   GET    /api/v1/doctors/:id                  → single doctor
//   PUT    /api/v1/doctors/:id                  → update (admin / self)
//   DELETE /api/v1/doctors/:id                  → delete (admin only)
//   GET    /api/v1/doctors/:id/availability     → get schedule
//   PUT    /api/v1/doctors/:id/availability     → update schedule
//   GET    /api/v1/doctors/:id/appointments     → doctor's appointments
// ─────────────────────────────────────────────────────────────────────────────

import { simulateDelay } from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  CreateDoctorRequest,
  UpdateDoctorRequest,
  UpdateAvailabilityRequest,
  DoctorFilters,
} from './types';
import { Doctor } from '@/lib/types';
import { mockDoctors } from '@/lib/mock-data';

// In-memory mutable store (seed from mock data on first access)
let _doctors: Doctor[] = [...mockDoctors];

// Storage key for persistence across page reloads
const STORAGE_KEY = 'hms_doctors';

function loadDoctors(): Doctor[] {
  if (typeof window === 'undefined') return _doctors;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    _doctors = JSON.parse(stored);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_doctors));
  }
  return _doctors;
}

function saveDoctors(doctors: Doctor[]) {
  _doctors = doctors;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doctors));
  }
}

export const doctorsService = {
  /**
   * GET /doctors
   * Supports search, department filter, pagination.
   */
  async getAll(filters: DoctorFilters = {}): Promise<PaginatedResponse<Doctor>> {
    await simulateDelay(350);

    const all = loadDoctors();
    let result = all;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.email.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q),
      );
    }
    if (filters.department) {
      result = result.filter((d) => d.department === filters.department);
    }
    if (filters.specialization) {
      result = result.filter((d) => d.specialization === filters.specialization);
    }

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;
    const total = result.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = result.slice((page - 1) * limit, page * limit);

    return {
      success: true,
      data: paginated,
      pagination: { total, page, limit, totalPages },
    };
  },

  /**
   * GET /doctors/:id
   */
  async getById(id: string): Promise<ApiResponse<Doctor>> {
    await simulateDelay(250);

    const doctor = loadDoctors().find((d) => d.id === id);
    if (!doctor) {
      return { success: false, data: null as unknown as Doctor, error: 'Doctor not found' };
    }
    return { success: true, data: doctor };
  },

  /**
   * POST /doctors  (admin only)
   * Production: also creates a User document + hashes pw.
   */
  async create(req: CreateDoctorRequest): Promise<ApiResponse<Doctor>> {
    await simulateDelay(500);

    const all = loadDoctors();
    if (all.some((d) => d.email === req.email)) {
      return {
        success: false,
        data: null as unknown as Doctor,
        error: 'A doctor with this email already exists',
      };
    }

    const doctor: Doctor = {
      id: `doc-${Date.now()}`,
      role: 'doctor',
      name: req.name,
      email: req.email,
      phone: req.phone,
      specialization: req.specialization,
      department: req.department,
      qualification: req.qualification,
      experience: req.experience,
      consultationFee: req.consultationFee,
      bio: req.bio,
      availability: mockDoctors[0].availability, // defaults to standard schedule
      createdAt: new Date().toISOString().split('T')[0],
    };

    saveDoctors([...all, doctor]);
    return { success: true, data: doctor, message: 'Doctor created successfully' };
  },

  /**
   * PUT /doctors/:id  (admin or the doctor themselves)
   */
  async update(id: string, req: UpdateDoctorRequest): Promise<ApiResponse<Doctor>> {
    await simulateDelay(400);

    const all = loadDoctors();
    const idx = all.findIndex((d) => d.id === id);
    if (idx === -1) {
      return { success: false, data: null as unknown as Doctor, error: 'Doctor not found' };
    }

    const updated: Doctor = { ...all[idx], ...req };
    const next = all.map((d) => (d.id === id ? updated : d));
    saveDoctors(next);

    return { success: true, data: updated, message: 'Doctor updated successfully' };
  },

  /**
   * DELETE /doctors/:id  (admin only)
   */
  async delete(id: string): Promise<ApiResponse<null>> {
    await simulateDelay(400);

    const all = loadDoctors();
    const exists = all.some((d) => d.id === id);
    if (!exists) {
      return { success: false, data: null, error: 'Doctor not found' };
    }

    saveDoctors(all.filter((d) => d.id !== id));
    return { success: true, data: null, message: 'Doctor deleted successfully' };
  },

  /**
   * GET /doctors/:id/availability
   */
  async getAvailability(id: string): Promise<ApiResponse<Doctor['availability']>> {
    await simulateDelay(200);

    const doctor = loadDoctors().find((d) => d.id === id);
    if (!doctor) {
      return { success: false, data: [], error: 'Doctor not found' };
    }
    return { success: true, data: doctor.availability };
  },

  /**
   * PUT /doctors/:id/availability  (doctor only)
   */
  async updateAvailability(
    id: string,
    req: UpdateAvailabilityRequest,
  ): Promise<ApiResponse<Doctor['availability']>> {
    await simulateDelay(400);

    const all = loadDoctors();
    const idx = all.findIndex((d) => d.id === id);
    if (idx === -1) {
      return { success: false, data: [], error: 'Doctor not found' };
    }

    const updated: Doctor = { ...all[idx], availability: req.schedule };
    saveDoctors(all.map((d) => (d.id === id ? updated : d)));

    return {
      success: true,
      data: req.schedule,
      message: 'Availability updated successfully',
    };
  },
};
