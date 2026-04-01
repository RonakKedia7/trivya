export type UserRole = 'admin' | 'doctor' | 'patient';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export interface Doctor extends User {
  role: 'doctor';
  specialization: string;
  department: string;
  qualification: string;
  experience: number;
  bio: string;
  consultationFee: number;
  availability: WeeklySchedule;
}

export interface Patient extends User {
  role: 'patient';
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup: string;
  address: string;
  emergencyContact: string;
  medicalHistory?: string;
  allergies?: string;
}

export interface Admin extends User {
  role: 'admin';
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface DaySchedule {
  day: string;
  isWorking: boolean;
  slots: TimeSlot[];
}

export type WeeklySchedule = DaySchedule[];

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'in-progress';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  /** ISO date string (yyyy-MM-dd) of the visit */
  visitDate: string;
  /** Short summary shown in record list */
  diagnosis: string;
  /** Treatment plan / details */
  treatment: string;
  prescription?: string;
  notes?: string;
  finalized?: boolean;
  updatedAt?: string;
  vitals?: {
    bloodPressure: string;
    temperature: string;
    heartRate: string;
    weight: string;
  };
}

export interface DashboardStats {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  todayAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
}
