import type { ApiResponse, CreateMedicalRecordRequest, UpdateMedicalRecordRequest } from './types';
import { apiFetch } from './client';

export const medicalRecordsService = {
  async getByPatient(patientId: string): Promise<ApiResponse<any[]>> {
    return apiFetch<ApiResponse<any[]>>(`/medical-records/patient/${encodeURIComponent(patientId)}`, { method: 'GET' });
  },

  async getById(id: string): Promise<ApiResponse<any>> {
    return apiFetch<ApiResponse<any>>(`/medical-records/${encodeURIComponent(id)}`, { method: 'GET' });
  },

  async create(req: CreateMedicalRecordRequest, _doctorContext: any): Promise<ApiResponse<any>> {
    // Context is derived server-side from JWT + appointment ownership.
    return apiFetch<ApiResponse<any>>('/medical-records', { method: 'POST', body: JSON.stringify(req) });
  },

  async update(id: string, req: UpdateMedicalRecordRequest): Promise<ApiResponse<any>> {
    return apiFetch<ApiResponse<any>>(`/medical-records/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(req) });
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    return apiFetch<ApiResponse<null>>(`/medical-records/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  async getAll(options: { page?: number; limit?: number } = {}): Promise<ApiResponse<any[]>> {
    const qs = new URLSearchParams();
    if (options.page) qs.set('page', String(options.page));
    if (options.limit) qs.set('limit', String(options.limit));
    return apiFetch<ApiResponse<any[]>>(`/medical-records?${qs.toString()}`, { method: 'GET' });
  },

  async getByAppointment(appointmentId: string): Promise<ApiResponse<any | null>> {
    return apiFetch<ApiResponse<any | null>>(`/medical-records/appointment/${encodeURIComponent(appointmentId)}`, { method: 'GET' });
  },

  async getByDoctor(doctorId: string): Promise<ApiResponse<any[]>> {
    return apiFetch<ApiResponse<any[]>>(`/medical-records/doctor/${encodeURIComponent(doctorId)}`, { method: 'GET' });
  },
};
