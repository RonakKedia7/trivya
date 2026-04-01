// ─────────────────────────────────────────────────────────────────────────────
// lib/api/appointments.service.ts  — Mock Appointments Service
// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTION SWAP — replace each method body with apiFetch calls to:
//   GET    /api/v1/appointments                      → list (admin)
//   POST   /api/v1/appointments                      → create (patient)
//   GET    /api/v1/appointments/:id                  → single
//   PATCH  /api/v1/appointments/:id/status           → update status (doctor)
//   DELETE /api/v1/appointments/:id                  → cancel (patient / admin)
//   GET    /api/v1/appointments/mine                 → current user's list
//   GET    /api/v1/appointments/stats                → dashboard stats
// ─────────────────────────────────────────────────────────────────────────────

import { simulateDelay } from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  CreateAppointmentRequest,
  UpdateAppointmentStatusRequest,
  AppointmentFilters,
  AdminDashboardStats,
  DoctorDashboardStats,
  PatientDashboardStats,
} from './types';
import { Appointment, User } from '@/lib/types';
import { mockAppointments, mockDoctors } from '@/lib/mock-data';

const STORAGE_KEY = 'hms_appointments';

function loadAppointments(): Appointment[] {
  if (typeof window === 'undefined') return [...mockAppointments];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored) as Appointment[];
  // Seed on first load
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockAppointments));
  return [...mockAppointments];
}

function saveAppointments(list: Appointment[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

function applyFilters(list: Appointment[], filters: AppointmentFilters): Appointment[] {
  let result = list;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (a) =>
        a.patientName.toLowerCase().includes(q) ||
        a.doctorName.toLowerCase().includes(q),
    );
  }
  if (filters.status) result = result.filter((a) => a.status === filters.status);
  if (filters.department) result = result.filter((a) => a.department === filters.department);
  if (filters.date) result = result.filter((a) => a.date === filters.date);
  if (filters.doctorId) result = result.filter((a) => a.doctorId === filters.doctorId);
  if (filters.patientId) result = result.filter((a) => a.patientId === filters.patientId);
  return result;
}

export const appointmentsService = {
  /**
   * GET /appointments  (admin)
   */
  async getAll(filters: AppointmentFilters = {}): Promise<PaginatedResponse<Appointment>> {
    await simulateDelay(350);

    const all = loadAppointments();
    const filtered = applyFilters(all, filters);
    // Sort newest first
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;
    const total = filtered.length;

    return {
      success: true,
      data: filtered.slice((page - 1) * limit, page * limit),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  /**
   * GET /appointments/mine  — returns appointments for the current user
   * (doctor → their appointments; patient → their appointments)
   */
  async getMine(user: User, filters: AppointmentFilters = {}): Promise<PaginatedResponse<Appointment>> {
    await simulateDelay(300);

    const all = loadAppointments();
    let mine: Appointment[];

    if (user.role === 'doctor') {
      // Find the doctor record to match by doctorId
      const doctorRecord = mockDoctors.find((d) => d.email === user.email);
      const doctorId = doctorRecord?.id ?? user.id;
      mine = all.filter((a) => a.doctorId === doctorId);
    } else {
      mine = all.filter((a) => a.patientId === user.id);
    }

    const filtered = applyFilters(mine, filters);
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 100;
    const total = filtered.length;

    return {
      success: true,
      data: filtered.slice((page - 1) * limit, page * limit),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  /**
   * GET /appointments/:id
   */
  async getById(id: string): Promise<ApiResponse<Appointment>> {
    await simulateDelay(200);

    const apt = loadAppointments().find((a) => a.id === id);
    if (!apt) {
      return { success: false, data: null as unknown as Appointment, error: 'Appointment not found' };
    }
    return { success: true, data: apt };
  },

  /**
   * POST /appointments  (patient only)
   * Validates: doctor exists, date is in the future, time slot format.
   */
  async create(
    user: User,
    req: CreateAppointmentRequest,
  ): Promise<ApiResponse<Appointment>> {
    await simulateDelay(500);

    const doctor = mockDoctors.find((d) => d.id === req.doctorId);
    if (!doctor) {
      return {
        success: false,
        data: null as unknown as Appointment,
        error: 'Doctor not found',
      };
    }

    // Conflict check: same doctor + date + time
    const all = loadAppointments();
    const conflict = all.find(
      (a) =>
        a.doctorId === req.doctorId &&
        a.date === req.date &&
        a.time === req.time &&
        a.status !== 'cancelled',
    );

    if (conflict) {
      return {
        success: false,
        data: null as unknown as Appointment,
        error: 'This time slot is already booked. Please choose a different slot.',
      };
    }

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: user.id,
      patientName: user.name,
      doctorId: req.doctorId,
      doctorName: doctor.name,
      department: doctor.department,
      date: req.date,
      time: req.time,
      status: 'scheduled',
      reason: req.reason || 'General Consultation',
      createdAt: new Date().toISOString().split('T')[0],
    };

    saveAppointments([newApt, ...all]);
    return { success: true, data: newApt, message: 'Appointment booked successfully' };
  },

  /**
   * PATCH /appointments/:id/status  (doctor or admin)
   * Allowed transitions:
   *   scheduled → in-progress → completed
   *   scheduled → cancelled
   *   in-progress → cancelled
   */
  async updateStatus(
    id: string,
    req: UpdateAppointmentStatusRequest,
  ): Promise<ApiResponse<Appointment>> {
    await simulateDelay(400);

    const all = loadAppointments();
    const idx = all.findIndex((a) => a.id === id);
    if (idx === -1) {
      return { success: false, data: null as unknown as Appointment, error: 'Appointment not found' };
    }

    const current = all[idx];
    const allowedTransitions: Record<string, string[]> = {
      scheduled: ['in-progress', 'cancelled'],
      'in-progress': ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };

    if (!allowedTransitions[current.status]?.includes(req.status)) {
      return {
        success: false,
        data: current,
        error: `Cannot transition from '${current.status}' to '${req.status}'`,
      };
    }

    const updated: Appointment = {
      ...current,
      status: req.status,
      notes: req.notes ?? current.notes,
    };

    const next = all.map((a) => (a.id === id ? updated : a));
    saveAppointments(next);

    return { success: true, data: updated, message: 'Status updated' };
  },

  /**
   * DELETE /appointments/:id  — soft cancel (patient or admin)
   */
  async cancel(id: string): Promise<ApiResponse<Appointment>> {
    return this.updateStatus(id, { status: 'cancelled' });
  },

  // ── Dashboard Stats ─────────────────────────────────────────────────────────

  /**
   * GET /appointments/stats/admin
   */
  async getAdminStats(todayDate: string): Promise<ApiResponse<AdminDashboardStats>> {
    await simulateDelay(300);

    const all = loadAppointments();
    const { mockDoctors: docs, mockPatients: pats } = await import('@/lib/mock-data');

    const byDept: Record<string, number> = {};
    docs.forEach((d) => {
      byDept[d.department] = (byDept[d.department] ?? 0) + 1;
    });

    const recent = [...all]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((a) => ({
        id: a.id,
        patientName: a.patientName,
        doctorName: a.doctorName,
        department: a.department,
        date: a.date,
        time: a.time,
        status: a.status,
        createdAt: a.createdAt,
      }));

    const stats: AdminDashboardStats = {
      totalDoctors: docs.length,
      totalPatients: pats.length,
      totalAppointments: all.length,
      todayAppointments: all.filter((a) => a.date === todayDate).length,
      pendingAppointments: all.filter((a) => a.status === 'scheduled').length,
      completedAppointments: all.filter((a) => a.status === 'completed').length,
      cancelledAppointments: all.filter((a) => a.status === 'cancelled').length,
      recentAppointments: recent,
      doctorsByDepartment: byDept,
    };

    return { success: true, data: stats };
  },

  /**
   * GET /appointments/stats/doctor
   */
  async getDoctorStats(doctorId: string, todayDate: string): Promise<ApiResponse<DoctorDashboardStats>> {
    await simulateDelay(300);

    const all = loadAppointments().filter((a) => a.doctorId === doctorId);

    return {
      success: true,
      data: {
        todayAppointments: all.filter((a) => a.date === todayDate).length,
        upcomingAppointments: all.filter(
          (a) => a.date >= todayDate && a.status === 'scheduled',
        ).length,
        completedAppointments: all.filter((a) => a.status === 'completed').length,
        totalPatients: new Set(all.map((a) => a.patientId)).size,
      },
    };
  },

  /**
   * GET /appointments/stats/patient
   */
  async getPatientStats(patientId: string): Promise<ApiResponse<PatientDashboardStats>> {
    await simulateDelay(250);

    const all = loadAppointments().filter((a) => a.patientId === patientId);
    const upcoming = all.filter((a) => a.status === 'scheduled');
    upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      success: true,
      data: {
        upcomingAppointments: upcoming.length,
        totalVisits: all.filter((a) => a.status === 'completed').length,
        totalRecords: 0, // will be hydrated by medicalRecordsService
        nextAppointment: upcoming[0]
          ? { date: upcoming[0].date, time: upcoming[0].time }
          : null,
      },
    };
  },
};
