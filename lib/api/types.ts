// ─────────────────────────────────────────────────────────────────────────────
// lib/api/types.ts  — API layer types (responses, errors, pagination, filters)
// Replace this file's usage with real HTTP responses when moving to MongoDB.
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'doctor' | 'patient';
  phone?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'doctor' | 'patient';
    phone?: string;
    avatar?: string;
    createdAt: string;
  };
  token: string;         // JWT – will be real in production
  refreshToken: string;  // refresh – will be real in production
}

// ── Doctors ───────────────────────────────────────────────────────────────────

export interface CreateDoctorRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;       // hashed server-side in production
  specialization: string;
  department: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  bio: string;
}

export interface UpdateDoctorRequest {
  name?: string;
  phone?: string;
  specialization?: string;
  department?: string;
  qualification?: string;
  experience?: number;
  consultationFee?: number;
  bio?: string;
}

export interface DoctorFilters {
  search?: string;
  department?: string;
  specialization?: string;
  page?: number;
  limit?: number;
}

// ── Patients ──────────────────────────────────────────────────────────────────

export interface CreatePatientRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup: string;
  address: string;
  emergencyContact: string;
  medicalHistory?: string;
  allergies?: string;
}

export interface UpdatePatientProfileRequest {
  name?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string;
  allergies?: string;
}

// ── Appointments ──────────────────────────────────────────────────────────────

export interface CreateAppointmentRequest {
  doctorId: string;
  date: string;          // yyyy-MM-dd
  time: string;          // HH:mm (24h) or hh:mm AM/PM
  reason: string;
}

export interface UpdateAppointmentStatusRequest {
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
}

export interface AppointmentFilters {
  status?: string;
  department?: string;
  date?: string;
  doctorId?: string;
  patientId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ── Medical Records ───────────────────────────────────────────────────────────

export interface CreateMedicalRecordRequest {
  appointmentId: string;
  diagnosis: string;
  treatment: string;
  prescription?: string;
  notes?: string;
  finalized: boolean;
  vitals?: {
    bloodPressure: string;
    temperature: string;
    heartRate: string;
    weight: string;
  };
}

export interface UpdateMedicalRecordRequest {
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  notes?: string;
  finalized?: boolean;
  vitals?: {
    bloodPressure: string;
    temperature: string;
    heartRate: string;
    weight: string;
  };
}

// ── Availability ──────────────────────────────────────────────────────────────

export interface UpdateAvailabilityRequest {
  schedule: Array<{
    day: string;
    isWorking: boolean;
    slots: Array<{
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }>;
  }>;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface AdminDashboardStats {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  todayAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  recentAppointments: Array<{
    id: string;
    patientName: string;
    doctorName: string;
    department: string;
    date: string;
    time: string;
    status: string;
    createdAt: string;
  }>;
  doctorsByDepartment: Record<string, number>;
}

export interface DoctorDashboardStats {
  todayAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  totalPatients: number;
}

export interface PatientDashboardStats {
  upcomingAppointments: number;
  totalVisits: number;
  totalRecords: number;
  nextAppointment: { date: string; time: string } | null;
}
