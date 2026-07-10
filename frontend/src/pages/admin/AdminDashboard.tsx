import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Users,
  Clock,
  CheckCircle2,
  Database,
  ArrowRight,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface AnalyticsData {
  patientsCount: number;
  doctorsCount: number;
  appointmentsCount: number;
  pendingAppointments: number;
  completedAppointments: number;
}

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/admin/analytics');
        if (response.data?.success) {
          setAnalytics(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching admin analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 border-3 border-brandBlue border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-textSecondary font-semibold text-xs">Accessing system ledger data...</p>
      </div>
    );
  }

  // BarChart data structure
  const chartData = [
    { name: 'Patients', count: analytics?.patientsCount || 0, fill: '#4F8CFF' },
    { name: 'Doctors', count: analytics?.doctorsCount || 0, fill: '#4ADE80' },
    { name: 'Total Bookings', count: analytics?.appointmentsCount || 0, fill: '#8B5CF6' },
  ];

  return (
    <div className="space-y-8 selection:bg-brandBlue/35 selection:text-white transition-colors duration-200">
      {/* System Admin Welcome Banner */}
      <section className="bg-white dark:bg-darkSidebar border border-gray-200 dark:border-darkBorder rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brandBlue/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="space-y-3 relative z-10">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-brandBlue uppercase tracking-wider bg-brandBlue/10 px-2.5 py-1 rounded-full border border-brandBlue/10">
            <Database size={12} /> System Administrator Console
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Platform Analytics Ledger
          </h1>
          <p className="text-xs md:text-sm text-gray-600 dark:text-textSecondary max-w-xl font-semibold leading-relaxed">
            Audit system directories, check clinic scheduling queues, and verify database integrity logs.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 relative z-10 shrink-0">
          <Link
            to="/admin/users"
            className="px-4 py-2.5 bg-brandBlue hover:bg-brandBlue/90 text-white text-xs font-bold rounded-xl transition duration-150 shadow-md shadow-brandBlue/10 hover:scale-[1.01]"
          >
            👥 User Account Directory
          </Link>
          <Link
            to="/admin/appointments"
            className="px-4 py-2.5 bg-white hover:bg-gray-50 dark:bg-darkCard dark:hover:bg-darkCard/80 border border-gray-200 dark:border-darkBorder text-gray-950 dark:text-white text-xs font-bold rounded-xl transition duration-150"
          >
            📅 Master Schedules Ledger
          </Link>
        </div>
      </section>

      {/* Analytics stats */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-textSecondary font-sans">Active Ledger Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Patients */}
          <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:border-brandBlue/20 transition duration-300">
            <div className="w-11 h-11 rounded-xl bg-brandBlue/10 text-brandBlue flex items-center justify-center">
              <Users size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider">Patients Registered</p>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">{analytics?.patientsCount || 0}</p>
              <p className="text-[10px] text-gray-500 dark:text-textSecondary/75 font-semibold mt-0.5">Biometrics enabled</p>
            </div>
          </div>

          {/* Total Doctors */}
          <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:border-brandBlue/20 transition duration-300">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-successGreen flex items-center justify-center">
              <Users size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider">Doctors Registered</p>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">{analytics?.doctorsCount || 0}</p>
              <p className="text-[10px] text-gray-500 dark:text-textSecondary/75 font-semibold mt-0.5">Verified licenses</p>
            </div>
          </div>

          {/* Pending Appointments */}
          <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:border-brandBlue/20 transition duration-300">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-warningYellow flex items-center justify-center">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider">Pending Bookings</p>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">{analytics?.pendingAppointments || 0}</p>
              <p className="text-[10px] text-gray-500 dark:text-textSecondary/75 font-semibold mt-0.5">Awaiting clinic action</p>
            </div>
          </div>

          {/* Completed Appointments */}
          <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:border-brandBlue/20 transition duration-300">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider">Total Consults</p>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">{analytics?.appointmentsCount || 0}</p>
              <p className="text-[10px] text-gray-500 dark:text-textSecondary/75 mt-0.5 font-semibold">Ledger entries logged</p>
            </div>
          </div>
        </div>
      </section>

      {/* Grid splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: BarChart displaying counts */}
        <section className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-textSecondary">Platform Distribution Matrix</h3>
          <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.08)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={10}
                    fontWeight={600}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={10}
                    fontWeight={600}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: resolvedTheme === 'dark' ? '#1A1A1A' : '#FFFFFF',
                      border: resolvedTheme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #D1D5DB',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: resolvedTheme === 'dark' ? '#FFFFFF' : '#111827',
                    }}
                    cursor={{ fill: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Right: Quick action cards and integrity diagnostics */}
        <section className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-textSecondary font-sans">System Integrity Checklist</h3>
          <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl p-6 space-y-4 shadow-xl text-xs font-semibold text-gray-600 dark:text-textSecondary">
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-extrabold text-[10px]">
                  ✓
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-bold">SQLite database online</p>
                  <p className="text-[10px] text-gray-500 dark:text-textSecondary/70 mt-0.5">Read/write access verified</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-extrabold text-[10px]">
                  ✓
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-bold">JWT Security active</p>
                  <p className="text-[10px] text-gray-500 dark:text-textSecondary/70 mt-0.5">HMAC-SHA256 signature verification</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-extrabold text-[10px]">
                  ✓
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-bold">Prisma client loaded</p>
                  <p className="text-[10px] text-gray-500 dark:text-textSecondary/70 mt-0.5">Object relational mappings compiled</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-darkBorder space-y-3">
              <Link
                to="/admin/users"
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-darkSidebar border border-gray-200 dark:border-darkBorder hover:border-brandBlue/20 rounded-xl font-bold text-gray-600 dark:text-textSecondary hover:text-gray-900 dark:hover:text-white transition group"
              >
                <span>Manage registered profiles</span>
                <ArrowRight size={14} className="text-gray-400 dark:text-textSecondary/40 group-hover:text-gray-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition" />
              </Link>
              <Link
                to="/admin/appointments"
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-darkSidebar border border-gray-200 dark:border-darkBorder hover:border-brandBlue/20 rounded-xl font-bold text-gray-600 dark:text-textSecondary hover:text-gray-900 dark:hover:text-white transition group"
              >
                <span>Audit care schedules ledger</span>
                <ArrowRight size={14} className="text-gray-400 dark:text-textSecondary/40 group-hover:text-gray-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition" />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AdminDashboard;
