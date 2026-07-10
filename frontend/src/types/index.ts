export interface User {
  id: string;
  name: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
  patientProfile?: PatientProfile | null;
  doctorProfile?: DoctorProfile | null;
}

export interface PatientProfile {
  id: string;
  userId: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  bloodType?: string | null;
  height?: number | null;
  weight?: number | null;
  allergies?: string | null;
  medicalHistory?: string | null;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  specialization: string;
  licenseNumber: string;
  consultationFee: number;
  bio?: string | null;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  dateTime: string;
  status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';
  reason?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: string;
    name: string;
    email: string;
    patientProfile?: PatientProfile | null;
  };
  doctor?: {
    id: string;
    name: string;
    email: string;
    doctorProfile?: DoctorProfile | null;
  };
}

export interface HealthMetric {
  id: string;
  patientId: string;
  type: 'BLOOD_PRESSURE' | 'HEART_RATE' | 'BLOOD_SUGAR' | 'WEIGHT' | 'STEPS' | 'SLEEP';
  value: string;
  unit: string;
  recordedAt: string;
}

export interface Recommendation {
  id: string;
  doctorId: string;
  patientId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  doctor?: {
    id: string;
    name: string;
    email: string;
    doctorProfile?: DoctorProfile | null;
  };
  patient?: {
    id: string;
    name: string;
    email: string;
    patientProfile?: PatientProfile | null;
  };
}

export interface AdminStats {
  users: {
    patients: number;
    doctors: number;
    admins: number;
    total: number;
  };
  appointments: {
    total: number;
    pending: number;
    completed: number;
  };
  metrics: {
    totalRecorded: number;
  };
  recommendations: {
    totalCreated: number;
  };
  recentAppointments: (Appointment & {
    patient: { name: string; email: string };
    doctor: { name: string; email: string };
  })[];
}
