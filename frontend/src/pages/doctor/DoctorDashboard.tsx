import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Appointment } from '../../types';
import {
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  Settings,
  ShieldCheck,
  ChevronRight,
  ClipboardList,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientCount, setPatientCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [apptsRes, patientsRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/doctors/my-patients'),
      ]);

      if (apptsRes.data?.success) setAppointments(apptsRes.data.data);
      if (patientsRes.data?.success) setPatientCount(patientsRes.data.data.length);
    } catch (error) {
      console.error('Error fetching doctor dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    const loadToast = toast.loading(`Marking appointment as ${newStatus.toLowerCase()}...`);
    try {
      await api.put(`/appointments/${id}/status`, { status: newStatus });
      toast.dismiss(loadToast);
      toast.success(`Appointment status updated to ${newStatus}.`);
      fetchData();
    } catch (error) {
      toast.dismiss(loadToast);
      toast.error('Failed to update status.');
      console.error('Error updating appointment status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 border-3 border-brandBlue border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-textSecondary font-semibold text-xs">Building clinician dashboard...</p>
      </div>
    );
  }

  const pendingCount = appointments.filter((a) => a.status === 'PENDING').length;
  const approvedCount = appointments.filter((a) => a.status === 'APPROVED').length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;

  const upcomingAppointments = appointments
    .filter((a) => ['PENDING', 'APPROVED'].includes(a.status))
    .slice(0, 5);

  return (
    <div className="space-y-8 selection:bg-brandBlue/35 selection:text-white transition-colors duration-200">
      {/* Clinician Welcome Banner */}
      <section className="bg-white dark:bg-darkSidebar border border-gray-200 dark:border-darkBorder rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brandBlue/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="space-y-3 relative z-10">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-brandBlue uppercase tracking-wider bg-brandBlue/10 px-2.5 py-1 rounded-full border border-brandBlue/10">
            <ShieldCheck size={12} /> Verified Clinician Workspace
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Welcome, Dr. {user?.name}
          </h1>
          <p className="text-xs md:text-sm text-gray-600 dark:text-textSecondary max-w-xl font-semibold leading-relaxed">
            Manage your patient vital diagnostic logs, upcoming online sessions, and clinical care directives.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 relative z-10 shrink-0">
          <Link
            to="/doctor/appointments"
            className="px-4 py-2.5 bg-brandBlue hover:bg-brandBlue/90 text-white text-xs font-bold rounded-xl transition duration-150 shadow-md shadow-brandBlue/10 hover:scale-[1.01]"
          >
            📅 Appointments Care
          </Link>
          <Link
            to="/doctor/patients"
            className="px-4 py-2.5 bg-white hover:bg-gray-50 dark:bg-darkCard dark:hover:bg-darkCard/80 border border-gray-200 dark:border-darkBorder text-gray-950 dark:text-white text-xs font-bold rounded-xl transition duration-150 animate-pulse"
          >
            👥 Patient Records Logs
          </Link>
        </div>
      </section>

      {/* Clinical metrics grids */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-textSecondary font-sans">Clinician Session Stats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Patients Count */}
          <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:border-brandBlue/20 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-brandBlue/10 text-brandBlue flex items-center justify-center">
              <Users size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider">Total Patients</p>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">{patientCount}</p>
              <p className="text-[10px] text-gray-500 dark:text-textSecondary/75 mt-0.5 font-semibold">Active profiles</p>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:border-brandBlue/20 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-warningYellow flex items-center justify-center">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider">Pending Care</p>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">{pendingCount}</p>
              <p className="text-[10px] text-gray-500 dark:text-textSecondary/75 mt-0.5 font-semibold">Awaiting reply</p>
            </div>
          </div>

          {/* Confirmed / Scheduled */}
          <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:border-brandBlue/20 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-successGreen flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider">Scheduled Slots</p>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">{approvedCount}</p>
              <p className="text-[10px] text-gray-500 dark:text-textSecondary/75 mt-0.5 font-semibold">Confirmed bookings</p>
            </div>
          </div>

          {/* Completed Checkups */}
          <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:border-brandBlue/20 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-slate-500/10 text-textSecondary flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider">Completed Logs</p>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">{completedCount}</p>
              <p className="text-[10px] text-gray-500 dark:text-textSecondary/75 mt-0.5 font-semibold">Total history diagnostics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Upcoming Schedule table */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-textSecondary">Consultation Schedule Overview</h3>
            <Link to="/doctor/appointments" className="text-xs font-bold text-brandBlue hover:underline">
              Manage Queue &rarr;
            </Link>
          </div>

          <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl shadow-xl overflow-hidden">
            {upcomingAppointments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-darkSidebar/50 border-b border-gray-200 dark:border-darkBorder text-gray-500 dark:text-textSecondary uppercase text-[9px] font-bold tracking-wider">
                      <th className="px-6 py-4">Patient Profile</th>
                      <th className="px-6 py-4">Scheduled Date</th>
                      <th className="px-6 py-4">Visit Purpose</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 dark:divide-darkBorder text-xs font-semibold">
                    {upcomingAppointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-slate-50 dark:hover:bg-darkSidebar/10 transition duration-150">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-darkSidebar text-gray-900 dark:text-white border border-gray-200 dark:border-darkBorder font-bold flex items-center justify-center text-[10px]">
                              {appt.patient?.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-gray-950 dark:text-white font-bold">{appt.patient?.name}</p>
                              <p className="text-[9px] text-gray-500 dark:text-textSecondary/75 mt-0.5">{appt.patient?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-textSecondary">
                          📅 {new Date(appt.dateTime).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-textSecondary max-w-[140px] truncate">
                          {appt.reason || 'Not declared.'}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2 shrink-0">
                          {appt.status === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => handleStatusChange(appt.id, 'APPROVED')}
                                className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/20 text-successGreen border border-emerald-500/20 rounded-lg text-[9px] font-bold transition cursor-pointer"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleStatusChange(appt.id, 'CANCELLED')}
                                className="px-2.5 py-1 bg-red-500/15 hover:bg-red-500/20 text-red-650 dark:text-red-400 border border-red-500/20 rounded-lg text-[9px] font-bold transition cursor-pointer"
                              >
                                Decline
                              </button>
                            </>
                          ) : (
                            <Link
                              to="/doctor/appointments"
                              className="px-2.5 py-1 bg-brandBlue/10 hover:bg-brandBlue/15 text-brandBlue border border-brandBlue/20 rounded-lg text-[9px] font-bold inline-block"
                            >
                              Edit Notes
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-16 text-center text-gray-500 dark:text-textSecondary">
                <p className="font-bold text-sm">No upcoming sessions confirmed.</p>
                <p className="text-xs text-gray-405 dark:text-textSecondary/70 mt-1">Confirmed patient appointments will appear here.</p>
              </div>
            )}
          </div>
        </section>

        {/* Right: Quick actions widget panel */}
        <section className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-textSecondary">Clinician Shortcuts</h3>
          <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="bg-slate-50 dark:bg-darkSidebar p-4 rounded-xl border border-gray-200 dark:border-darkBorder text-xs font-semibold text-gray-600 dark:text-textSecondary space-y-2">
              <p className="text-[9px] text-gray-400 dark:text-textSecondary/65 uppercase tracking-wider">Clinician Profile Summary</p>
              <p className="text-gray-900 dark:text-white font-extrabold text-sm truncate">
                {user?.doctorProfile?.specialization || 'Not configured'}
              </p>
              <p className="text-[10px] text-gray-550 dark:text-textSecondary">
                License ID: <span className="text-gray-905 dark:text-white font-bold">{user?.doctorProfile?.licenseNumber || 'Verified'}</span>
              </p>
              <p className="text-[10px] text-gray-550 dark:text-textSecondary">
                Consult Fee: <span className="text-successGreen font-bold">${user?.doctorProfile?.consultationFee || 0}</span>
              </p>
            </div>

            <div className="space-y-2">
              <Link
                to="/doctor/recommendations"
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-darkSidebar border border-gray-200 dark:border-darkBorder hover:border-brandBlue/20 rounded-xl text-xs font-bold text-gray-600 dark:text-textSecondary hover:text-gray-900 dark:hover:text-white transition group"
              >
                <span className="flex items-center gap-2">
                  <ClipboardList size={14} className="text-brandBlue" />
                  Write Recommendations
                </span>
                <ChevronRight size={14} className="text-gray-400 dark:text-textSecondary/40 group-hover:text-gray-900 group-hover:dark:text-white group-hover:translate-x-0.5 transition" />
              </Link>
              <Link
                to="/doctor/patients"
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-darkSidebar border border-gray-200 dark:border-darkBorder hover:border-brandBlue/20 rounded-xl text-xs font-bold text-gray-600 dark:text-textSecondary hover:text-gray-900 dark:hover:text-white transition group"
              >
                <span className="flex items-center gap-2">
                  <Users size={14} className="text-brandBlue" />
                  Evaluate Patient Vitals
                </span>
                <ChevronRight size={14} className="text-gray-400 dark:text-textSecondary/40 group-hover:text-gray-900 group-hover:dark:text-white group-hover:translate-x-0.5 transition" />
              </Link>
              <Link
                to="/doctor/profile"
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-darkSidebar border border-gray-200 dark:border-darkBorder hover:border-brandBlue/20 rounded-xl text-xs font-bold text-gray-600 dark:text-textSecondary hover:text-gray-900 dark:hover:text-white transition group"
              >
                <span className="flex items-center gap-2">
                  <Settings size={14} className="text-brandBlue" />
                  Configure My Profile
                </span>
                <ChevronRight size={14} className="text-gray-400 dark:text-textSecondary/40 group-hover:text-gray-900 group-hover:dark:text-white group-hover:translate-x-0.5 transition" />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default DoctorDashboard;
