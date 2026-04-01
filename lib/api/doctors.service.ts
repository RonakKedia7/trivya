import type { ApiResponse, PaginatedResponse, CreateDoctorRequest, UpdateDoctorRequest, UpdateAvailabilityRequest, DoctorFilters } from './types';
import { apiFetch } from './client';

export const doctorsService = {
  async getAll(filters: DoctorFilters = {}): Promise<PaginatedResponse<any>> {
    const qs = new URLSearchParams();
    if (filters.search) qs.set('search', filters.search);
    if (filters.department) qs.set('department', filters.department);
    if (filters.specialization) qs.set('specialization', filters.specialization);
    if (filters.page) qs.set('page', String(filters.page));
    if (filters.limit) qs.set('limit', String(filters.limit));
    return apiFetch<PaginatedResponse<any>>(`/doctors?${qs.toString()}`, { method: 'GET' });
  },

  async getById(id: string): Promise<ApiResponse<any>> {
    return apiFetch<ApiResponse<any>>(`/doctors/${encodeURIComponent(id)}`, { method: 'GET' });
  },

  async create(req: CreateDoctorRequest): Promise<ApiResponse<any>> {
    return apiFetch<ApiResponse<any>>('/doctors', { method: 'POST', body: JSON.stringify(req) });
  },

  async update(id: string, req: UpdateDoctorRequest): Promise<ApiResponse<any>> {
    return apiFetch<ApiResponse<any>>(`/doctors/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(req) });
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    return apiFetch<ApiResponse<null>>(`/doctors/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  async getAvailability(id: string): Promise<ApiResponse<any>> {
    return apiFetch<ApiResponse<any>>(`/doctors/${encodeURIComponent(id)}/availability`, { method: 'GET' });
  },

  async updateAvailability(id: string, req: UpdateAvailabilityRequest): Promise<ApiResponse<any>> {
    return apiFetch<ApiResponse<any>>(`/doctors/${encodeURIComponent(id)}/availability`, { method: 'PUT', body: JSON.stringify(req) });
  },
};
