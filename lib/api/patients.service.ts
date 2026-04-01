import type { ApiResponse, PaginatedResponse, UpdatePatientProfileRequest } from './types';
import { apiFetch } from './client';

export const patientsService = {
  async getAll(options: { search?: string; page?: number; limit?: number } = {}): Promise<PaginatedResponse<any>> {
    const qs = new URLSearchParams();
    if (options.search) qs.set('search', options.search);
    if (options.page) qs.set('page', String(options.page));
    if (options.limit) qs.set('limit', String(options.limit));
    return apiFetch<PaginatedResponse<any>>(`/patients?${qs.toString()}`, { method: 'GET' });
  },

  async getById(id: string): Promise<ApiResponse<any>> {
    return apiFetch<ApiResponse<any>>(`/patients/${encodeURIComponent(id)}`, { method: 'GET' });
  },

  async updateProfile(id: string, req: UpdatePatientProfileRequest): Promise<ApiResponse<any>> {
    return apiFetch<ApiResponse<any>>(`/patients/${encodeURIComponent(id)}/profile`, { method: 'PUT', body: JSON.stringify(req) });
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    return apiFetch<ApiResponse<null>>(`/patients/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  async getAppointments(id: string): Promise<ApiResponse<any[]>> {
    return apiFetch<ApiResponse<any[]>>(`/patients/${encodeURIComponent(id)}/appointments`, { method: 'GET' });
  },

  async getMedicalRecords(id: string): Promise<ApiResponse<any[]>> {
    return apiFetch<ApiResponse<any[]>>(`/patients/${encodeURIComponent(id)}/medical-records`, { method: 'GET' });
  },
};
