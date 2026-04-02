import type {
  ApiResponse,
  PaginatedResponse,
  CreateAppointmentRequest,
  UpdateAppointmentStatusRequest,
  AppointmentFilters,
  AdminDashboardStats,
  DoctorDashboardStats,
  PatientDashboardStats,
} from "./types";
import type { User, Appointment } from "@/lib/types";
import { apiFetch } from "./client";

export const appointmentsService = {
  async getAll(
    filters: AppointmentFilters = {},
  ): Promise<PaginatedResponse<Appointment>> {
    const qs = new URLSearchParams();
    if (filters.status) qs.set("status", filters.status);
    if (filters.department) qs.set("department", filters.department);
    if (filters.date) qs.set("date", filters.date);
    if (filters.doctorId) qs.set("doctorId", filters.doctorId);
    if (filters.patientId) qs.set("patientId", filters.patientId);
    if (filters.search) qs.set("search", filters.search);
    if (filters.page) qs.set("page", String(filters.page));
    if (filters.limit) qs.set("limit", String(filters.limit));
    return apiFetch<PaginatedResponse<Appointment>>(
      `/appointments?${qs.toString()}`,
      { method: "GET" },
    );
  },

  async getMine(
    user: User,
    filters: AppointmentFilters = {},
  ): Promise<PaginatedResponse<Appointment>> {
    const qs = new URLSearchParams();
    if (filters.status) qs.set("status", filters.status);
    if (filters.date) qs.set("date", filters.date);
    if (filters.page) qs.set("page", String(filters.page));
    if (filters.limit) qs.set("limit", String(filters.limit));
    return apiFetch<PaginatedResponse<Appointment>>(
      `/appointments/mine?${qs.toString()}`,
      { method: "GET" },
    );
  },

  async getById(id: string): Promise<ApiResponse<Appointment>> {
    return apiFetch<ApiResponse<Appointment>>(
      `/appointments/${encodeURIComponent(id)}`,
      { method: "GET" },
    );
  },

  async create(
    user: User,
    req: CreateAppointmentRequest,
  ): Promise<ApiResponse<Appointment>> {
    return apiFetch<ApiResponse<Appointment>>("/appointments", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  async updateStatus(
    id: string,
    req: UpdateAppointmentStatusRequest,
  ): Promise<ApiResponse<Appointment>> {
    return apiFetch<ApiResponse<Appointment>>(
      `/appointments/${encodeURIComponent(id)}/status`,
      { method: "PATCH", body: JSON.stringify(req) },
    );
  },

  async cancel(id: string): Promise<ApiResponse<Appointment>> {
    return apiFetch<ApiResponse<Appointment>>(
      `/appointments/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
  },

  async getAdminStats(): Promise<ApiResponse<AdminDashboardStats>> {
    return apiFetch<ApiResponse<AdminDashboardStats>>(
      "/appointments/stats/admin",
      { method: "GET" },
    );
  },

  async getDoctorStats(
    doctorId: string,
  ): Promise<ApiResponse<DoctorDashboardStats>> {
    const qs = new URLSearchParams();
    qs.set("doctorId", doctorId);
    return apiFetch<ApiResponse<DoctorDashboardStats>>(
      `/appointments/stats/doctor?${qs.toString()}`,
      { method: "GET" },
    );
  },

  async getPatientStats(
    patientId: string,
  ): Promise<ApiResponse<PatientDashboardStats>> {
    const qs = new URLSearchParams();
    qs.set("patientId", patientId);
    return apiFetch<ApiResponse<PatientDashboardStats>>(
      `/appointments/stats/patient?${qs.toString()}`,
      { method: "GET" },
    );
  },
};
