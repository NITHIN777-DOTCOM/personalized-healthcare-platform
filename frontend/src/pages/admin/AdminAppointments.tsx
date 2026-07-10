import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Appointment } from '../../types';
import { Calendar, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      if (response.data?.success) {
        setAppointments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching admin appointments master logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment administratively?')) return;
    const loadToast = toast.loading('Cancelling consultation...');
    try {
      await api.put(`/appointments/${id}/status`, { status: 'CANCELLED' });
      toast.dismiss(loadToast);
      toast.success('Appointment cancelled successfully.');
      fetchAppointments();
    } catch (error) {
      toast.dismiss(loadToast);
      toast.error('Failed to cancel appointment.');
      console.error('Error cancelling appointment administratively:', error);
    }
  };

  return (
    <div className="space-y-6 selection:bg-brandBlue/35 selection:text-white transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Master Appointments Ledger</h1>
          <p className="text-[11px] text-gray-500 dark:text-textSecondary font-semibold mt-0.5">
            Audit status configurations, doctor consults, and symptoms requested across the platform.
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchAppointments();
          }}
          className="p-2 rounded-xl bg-white hover:bg-gray-50 dark:bg-darkCard border border-gray-200 dark:border-darkBorder text-gray-600 dark:text-white hover:text-brandBlue transition cursor-pointer"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <div className="w-10 h-10 border-3 border-brandBlue border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-textSecondary font-semibold text-xs">Auditing care schedule...</p>
        </div>
      ) : appointments.length > 0 ? (
        <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder shadow-xl rounded-2xl overflow-hidden">
          <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-darkSidebar/50 border-b border-gray-200 dark:border-darkBorder text-gray-500 dark:text-textSecondary uppercase text-[9px] font-bold tracking-wider sticky top-0 backdrop-blur-md">
                  <th className="px-6 py-3.5">Patient Details</th>
                  <th className="px-6 py-3.5">Assigned Doctor</th>
                  <th className="px-6 py-3.5">Schedule Date</th>
                  <th className="px-6 py-3.5">Visit Purpose</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 dark:divide-darkBorder text-gray-600 dark:text-textSecondary font-semibold">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50 dark:hover:bg-darkSidebar/10 transition duration-150">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-950 dark:text-white font-bold">{appt.patient?.name}</p>
                        <p className="text-[9px] text-gray-500 dark:text-textSecondary/75 mt-0.5">{appt.patient?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-950 dark:text-white font-bold">Dr. {appt.doctor?.name}</p>
                        <p className="text-[9px] text-gray-500 dark:text-textSecondary/75 mt-0.5">{appt.doctor?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-textSecondary">
                      📅 {new Date(appt.dateTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-textSecondary max-w-[160px] truncate">
                      {appt.reason || 'None specified.'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          appt.status === 'PENDING'
                            ? 'bg-amber-500/10 text-warningYellow border-amber-500/25'
                            : appt.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-successGreen border-emerald-500/25'
                            : appt.status === 'COMPLETED'
                            ? 'bg-slate-500/10 text-textSecondary border-slate-500/25'
                            : 'bg-red-500/10 text-dangerRed border-red-500/25'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {['PENDING', 'APPROVED'].includes(appt.status) ? (
                        <button
                          onClick={() => handleCancel(appt.id)}
                          className="px-2.5 py-1 bg-gray-50 dark:bg-darkSidebar border border-gray-250 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-650 dark:text-red-400 rounded-lg text-[10px] font-bold transition cursor-pointer"
                        >
                          Decline
                        </button>
                      ) : (
                        <span className="text-[9px] text-gray-500 dark:text-textSecondary/55 italic">Locked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl p-16 text-center text-gray-500 dark:text-textSecondary max-w-xl mx-auto shadow-xl">
          <Calendar size={32} className="text-gray-400 dark:text-textSecondary/40 mx-auto mb-3" />
          <p className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">Appointments database is empty.</p>
          <p className="text-xs text-gray-400 dark:text-textSecondary/70 mt-1">Platform consult logs will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
