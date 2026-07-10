/**
 * Centralized API Routes Configuration for PulseCare Application.
 * All paths are defined without leading slashes to ensure correct relative 
 * resolution against the configured VITE_API_URL baseURL (which ends in /api).
 */
export const API_ROUTES = {
  auth: {
    me: 'auth/me',
    login: 'auth/login',
    register: 'auth/register',
  },
  patients: {
    dashboard: 'patients/dashboard',
    metrics: 'patients/metrics',
    metricsById: (id: string) => `patients/metrics/${id}`,
    profile: 'patients/profile',
    recommendations: 'patients/recommendations',
    appointments: 'patients/appointments',
    appointmentsById: (id: string) => `patients/appointments/${id}`,
  },
  doctors: {
    dashboard: 'doctors/dashboard',
    patients: 'doctors/patients',
    recommendations: 'doctors/recommendations',
    recommendationsById: (id: string) => `doctors/recommendations/${id}`,
    profile: 'doctors/profile',
    appointments: 'doctors/appointments',
    appointmentsById: (id: string) => `doctors/appointments/${id}`,
  },
  admin: {
    dashboard: 'admin/dashboard',
    users: 'admin/users',
    usersById: (id: string) => `admin/users/${id}`,
    appointments: 'admin/appointments',
    appointmentsById: (id: string) => `admin/appointments/${id}`,
  }
};

export default API_ROUTES;
