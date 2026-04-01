// ─────────────────────────────────────────────────────────────────────────────
// lib/api/index.ts  — Public barrel export for all services
// ─────────────────────────────────────────────────────────────────────────────
// Usage:
//   import { authService, doctorsService, appointmentsService } from '@/lib/api'
//
// When you swap to real endpoints, update ONLY the service files, not this
// barrel or any page/hook file.
// ─────────────────────────────────────────────────────────────────────────────

export { authService } from './auth.service';
export { doctorsService } from './doctors.service';
export { patientsService } from './patients.service';
export { appointmentsService } from './appointments.service';
export { medicalRecordsService } from './medical-records.service';

// Re-export shared types
export type * from './types';
export { apiFetch, API_BASE } from './client';
