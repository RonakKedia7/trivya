export { authService } from "./auth.service";
export { doctorsService } from "./doctors.service";
export { patientsService } from "./patients.service";
export { appointmentsService } from "./appointments.service";
export { medicalRecordsService } from "./medical-records.service";

// Re-export shared types
export type * from "./types";
export { apiFetch, API_BASE } from "./client";
