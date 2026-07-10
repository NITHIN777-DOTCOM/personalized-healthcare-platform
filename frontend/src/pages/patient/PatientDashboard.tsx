import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { HealthMetric, Appointment, Recommendation } from '../../types';
import {
  Heart,
  TrendingUp,
  Activity,
  Sparkles,
  ArrowRight,
  Moon,
  Clock,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, apptsRes, recsRes] = await Promise.all([
          api.get('/patients/metrics'),
          api.get('/appointments'),
          api.get('/recommendations'),
        ]);

        if (metricsRes.data?.success) setMetrics(metricsRes.data.data);
        if (apptsRes.data?.success) {
          setAppointments(
            apptsRes.data.data
              .filter((a: Appointment) => a.status !== 'CANCELLED')
              .slice(0, 3)
          );
        }
        if (recsRes.data?.success) setRecommendations(recsRes.data.data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching patient dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 border-3 border-brandBlue border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-textSecondary font-semibold text-xs">Assembling your medical portal...</p>
      </div>
    );
  }

  const getLatestMetric = (type: string) => {
    return metrics.find((m) => m.type === type);
  };

  const bp = getLatestMetric('BLOOD_PRESSURE');
  const hr = getLatestMetric('HEART_RATE');
  const steps = getLatestMetric('STEPS');
  const sleep = getLatestMetric('SLEEP');

  const chartData = metrics
    .filter((m) => m.type === 'STEPS')
    .slice(0, 6)
    .reverse()
    .map((m) => ({
      date: new Date(m.recordedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      steps: parseInt(m.value) || 0,
    }));

  return (
    <div className="space-y-8 selection:bg-brandBlue/35 selection:text-white transition-colors duration-205">
      
      {/* Welcome Banner */}
      <section className="bg-white dark:bg-darkSidebar border border-gray-200 dark:border-darkBorder rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brandBlue/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="space-y-3 relative z-10">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brandBlue uppercase tracking-wider bg-brandBlue/10 px-2.5 py-1 rounded-full border border-brandBlue/10">
            <Sparkles size={10} /> Active Patient Health Profile
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Welcome Back, {user?.name}
          </h1>
          <p className="text-xs md:text-sm text-gray-600 dark:text-textSecondary max-w-xl font-semibold leading-relaxed">
            PulseCare integrates your biometric vitals logs, scheduled consultations, and doctor advices into a secure wellness environment.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 relative z-10 shrink-0">
          <Link
            to="/patient/metrics"
            className="px-4 py-2.5 bg-brandBlue hover:bg-brandBlue/90 text-white text-xs font-bold rounded-xl transition duration-150 shadow-md shadow-brandBlue/10 hover:scale-[1.01]"
          >
            📈 Log Daily Vitals
          </Link>
          <Link
            to="/patient/appointments"
            className="px-4 py-2.5 bg-white hover:bg-gray-50 dark:bg-darkCard dark:hover:bg-darkCard/80 border border-gray-200 dark:border-darkBorder text-gray-950 dark:text-white text-xs font-bold rounded-xl transition duration-150"
          >
            📅 Book Consultation
          </Link>
        </div>
      </section>

      {/* Vital readings grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-textSecondary">Latest Biometric Status</h2>
          <Link to="/patient/metrics" className="text-xs font-bold text-brandBlue hover:underline flex items-center gap-1">
            Browse Log History <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* BP Card */}
          <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder p-5 rounded-2xl shadow-sm space-y-4 hover:border-brandBlue/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
                <Heart size={18} />
              </div>
              <span className="text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider">BP Vital</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{bp?.value || '--'}</p>
              <p className="text-[10px] text-gray-500 dark:text-textSecondary font-semibold mt-1">
                {bp ? `Recorded ${new Date(bp.recordedAt).toLocaleDateString()}` : 'No BP logged'}
              </p>
            </div>
          </div>

          {/* HR Card */}
          <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder p-5 rounded-2xl shadow-sm space-y-4 hover:border-brandBlue/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Activity size={18} />
              </div>
              <span className="text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider">Pulse Vital</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {hr ? `${hr.value}` : '--'} <span className="text-xs text-gray-500 dark:text-textSecondary font-bold">{hr?.unit}</span>
              </p>
              <p className="text-[10px] text-gray-500 dark:text-textSecondary font-semibold mt-1">
                {hr ? `Recorded ${new Date(hr.recordedAt).toLocaleDateString()}` : 'No pulse logged'}
              </p>
            </div>
          </div>

          {/* Steps Card */}
          <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder p-5 rounded-2xl shadow-sm space-y-4 hover:border-brandBlue/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-brandBlue/10 text-brandBlue flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
              <span className="text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider">Daily Steps</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {steps ? `${parseInt(steps.value).toLocaleString()}` : '--'}{' '}
                <span className="text-xs text-gray-500 dark:text-textSecondary font-bold">{steps?.unit}</span>
              </p>
              <p className="text-[10px] text-gray-500 dark:text-textSecondary font-semibold mt-1">
                {steps ? `Recorded ${new Date(steps.recordedAt).toLocaleDateString()}` : 'No steps logged'}
              </p>
            </div>
          </div>

          {/* Sleep Card */}
          <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder p-5 rounded-2xl shadow-sm space-y-4 hover:border-brandBlue/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Moon size={18} />
              </div>
              <span className="text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider">Sleep Hours</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {sleep ? `${sleep.value}` : '--'} <span className="text-xs text-gray-500 dark:text-textSecondary font-bold">{sleep?.unit}</span>
              </p>
              <p className="text-[10px] text-gray-500 dark:text-textSecondary font-semibold mt-1">
                {sleep ? `Recorded ${new Date(sleep.recordedAt).toLocaleDateString()}` : 'No sleep logged'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main dashboard splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Vitals Chart Trends & Recommendations */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Steps AreaChart */}
          <section className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl p-6 space-y-4 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Endurance & Steps Trend</h3>
              <p className="text-[11px] text-gray-500 dark:text-textSecondary font-semibold mt-0.5">Physical mobility logs over the last 6 entries.</p>
            </div>
            
            <div className="h-64 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F8CFF" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#4F8CFF" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.08)" vertical={false} />
                    <XAxis
                      dataKey="date"
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
                      cursor={{ stroke: 'rgba(128,128,128,0.15)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="steps"
                      stroke="#4F8CFF"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSteps)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 dark:text-textSecondary text-xs">
                  Insufficient data to render endurance trends.
                </div>
              )}
            </div>
          </section>

          {/* Doctor Recommendations */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-textSecondary">Primary Clinician Directives</h3>
            <div className="grid grid-cols-1 gap-4">
              {recommendations.length > 0 ? (
                recommendations.map((rec) => (
                  <div key={rec.id} className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl p-6 space-y-3 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brandBlue/5 rounded-full blur-xl pointer-events-none"></div>
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">{rec.title}</h4>
                      <span className="text-[10px] text-gray-500 dark:text-textSecondary font-semibold bg-slate-100 dark:bg-darkSidebar border border-gray-200 dark:border-darkBorder px-2.5 py-0.5 rounded-lg">
                        {new Date(rec.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-textSecondary font-medium leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-darkSidebar/50 border border-gray-200 dark:border-darkBorder/40 p-3.5 rounded-xl">
                      {rec.description}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-textSecondary font-bold">
                      Prescribed by:{' '}
                      <span className="text-brandBlue">
                        {rec.doctor?.name} ({rec.doctor?.doctorProfile?.specialization || 'Clinical Specialist'})
                      </span>
                    </p>
                  </div>
                ))
              ) : (
                <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl p-8 text-center text-gray-500 dark:text-textSecondary text-xs">
                  No medical directives recorded.
                </div>
              )}
            </div>
          </section>

        </div>

        {/* Right: Upcoming Consultations & Medication Mock checklist */}
        <div className="space-y-8">
          
          {/* Care consultations */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-textSecondary">Active Care Schedules</h3>
            <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl p-5 space-y-4 divide-y divide-gray-150 dark:divide-darkBorder shadow-sm">
              {appointments.length > 0 ? (
                appointments.map((appt, i) => (
                  <div key={appt.id} className={`space-y-2.5 ${i > 0 ? 'pt-4 border-t border-gray-100 dark:border-darkBorder' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white">{appt.doctor?.name || 'Assigned Clinician'}</h4>
                        <p className="text-[10px] text-gray-500 dark:text-textSecondary font-semibold mt-0.5">
                          {appt.doctor?.doctorProfile?.specialization || 'General Care'}
                        </p>
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                          appt.status === 'PENDING'
                            ? 'bg-amber-500/10 text-warningYellow border-amber-500/15'
                            : appt.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-successGreen border-emerald-500/15'
                            : 'bg-slate-500/10 text-textSecondary border-slate-500/15'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 dark:text-textSecondary bg-slate-50 dark:bg-darkSidebar border border-gray-200 dark:border-darkBorder px-3 py-2 rounded-xl">
                      <Clock size={12} className="text-brandBlue" />
                      <span>{new Date(appt.dateTime).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 dark:text-textSecondary text-xs py-4">
                  No upcoming care consultations.
                </div>
              )}
            </div>
          </section>

          {/* Quick Logs shortcut and wellness checklist */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-textSecondary">Daily Wellness Checklist</h3>
            <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl p-6 space-y-4 shadow-sm">
              
              <div className="space-y-3.5">
                <div className="flex items-center gap-3 text-xs font-semibold text-gray-550 dark:text-textSecondary">
                  <div className="w-5 h-5 rounded bg-brandBlue/10 text-brandBlue flex items-center justify-center font-bold text-[10px]">
                    ✓
                  </div>
                  <span className="line-through text-gray-400 dark:text-textSecondary/50">Morning hydration check</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold text-gray-550 dark:text-textSecondary">
                  <div className="w-5 h-5 rounded bg-brandBlue/10 text-brandBlue flex items-center justify-center font-bold text-[10px]">
                    ✓
                  </div>
                  <span className="line-through text-gray-400 dark:text-textSecondary/50">Log Blood Pressure value</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold text-gray-900 dark:text-white">
                  <div className="w-5 h-5 rounded border border-gray-300 dark:border-darkBorder flex items-center justify-center font-bold text-[10px]"></div>
                  <span>Take afternoon supplements</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold text-gray-900 dark:text-white">
                  <div className="w-5 h-5 rounded border border-gray-300 dark:border-darkBorder flex items-center justify-center font-bold text-[10px]"></div>
                  <span>Complete daily steps target</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-darkSidebar p-4 rounded-xl border border-gray-200 dark:border-darkBorder text-[10px] text-gray-650 dark:text-textSecondary font-bold space-y-1">
                <p className="text-gray-900 dark:text-white text-xs">💡 Proactive Care Tip</p>
                <p className="font-semibold leading-relaxed">
                  Regular step activities and early sleep schedules directly reduce systolic blood pressure. Log your status everyday!
                </p>
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
};

export default PatientDashboard;
