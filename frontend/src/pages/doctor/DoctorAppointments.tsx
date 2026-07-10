import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Appointment } from '../../types';
import { Clock, Calendar, CheckCircle2, FileText, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const DoctorAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');
  const [submittingNotes, setSubmittingNotes] = useState(false);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      if (response.data?.success) {
        setAppointments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    const loadToast = toast.loading(`Marking appointment as ${newStatus.toLowerCase()}...`);
    try {
      await api.put(`/appointments/${id}/status`, { status: newStatus });
      toast.dismiss(loadToast);
      toast.success(`Appointment status updated to ${newStatus}.`);
      fetchAppointments();
    } catch (error: any) {
      toast.dismiss(loadToast);
      toast.error('Failed to update status.');
      console.error('Error updating status:', error);
    }
  };

  const handleEditNotes = (appt: Appointment) => {
    setEditingId(appt.id);
    setNotesValue(appt.notes || '');
  };

  const handleSaveNotes = async (id: string) => {
    setSubmittingNotes(true);
    const loadToast = toast.loading('Saving diagnostic notes...');
    try {
      await api.put(`/appointments/${id}/notes`, { notes: notesValue });
      toast.dismiss(loadToast);
      toast.success('Diagnostic notes recorded successfully.');
      setEditingId(null);
      fetchAppointments();
    } catch (error: any) {
      toast.dismiss(loadToast);
      toast.error('Failed to save notes.');
      console.error('Error saving diagnostic notes:', error);
    } finally {
      setSubmittingNotes(false);
    }
  };

  return (
    <div className="space-y-6 selection:bg-brandBlue/35 selection:text-white transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Clinical Appointments Queue</h1>
          <p className="text-[11px] text-gray-500 dark:text-textSecondary font-semibold mt-0.5">
            Accept pending consults, verify schedules, and document diagnostics notes.
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchAppointments();
          }}
          className="p-2 rounded-xl bg-white hover:bg-gray-50 dark:bg-darkCard border border-gray-200 dark:border-darkBorder hover:text-brandBlue dark:hover:text-brandBlue transition cursor-pointer"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <div className="w-10 h-10 border-3 border-brandBlue border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-textSecondary font-semibold text-xs">Loading queue list...</p>
        </div>
      ) : appointments.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder shadow-xl rounded-2xl p-6 space-y-4 hover:border-brandBlue/15 transition-all duration-200"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brandBlue/10 text-brandBlue border border-brandBlue/20 font-bold flex items-center justify-center text-xs">
                    {appt.patient?.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Patient: {appt.patient?.name}</h3>
                    <p className="text-[10px] text-gray-500 dark:text-textSecondary font-semibold mt-0.5">{appt.patient?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                      appt.status === 'PENDING'
                        ? 'bg-amber-500/10 text-warningYellow border-amber-500/20'
                        : appt.status === 'APPROVED'
                        ? 'bg-emerald-500/10 text-successGreen border-emerald-500/20'
                        : appt.status === 'COMPLETED'
                        ? 'bg-slate-500/10 text-textSecondary border-slate-500/20'
                        : 'bg-red-500/10 text-dangerRed border-red-500/20'
                    }`}
                  >
                    {appt.status}
                  </span>
                </div>
              </div>

              {/* Visit Purpose box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-gray-600 dark:text-textSecondary bg-slate-50 dark:bg-darkSidebar border border-gray-200 dark:border-darkBorder p-4 rounded-xl">
                <div className="space-y-1">
                  <p className="text-[9px] text-gray-400 dark:text-textSecondary/75 uppercase tracking-wider">Stated Symptoms</p>
                  <p className="text-gray-900 dark:text-white font-bold">{appt.reason || 'No description provided.'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] text-gray-400 dark:text-textSecondary/75 uppercase tracking-wider">Scheduled Date/Time</p>
                  <p className="text-gray-900 dark:text-white font-bold flex items-center gap-1.5">
                    <Clock size={12} className="text-brandBlue" />
                    {new Date(appt.dateTime).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Action and Notes section */}
              <div className="pt-2">
                {editingId === appt.id ? (
                  <div className="space-y-3 bg-slate-50 dark:bg-darkSidebar/50 p-4 rounded-xl border border-gray-200 dark:border-darkBorder">
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase">Record Clinical Diagnosis</label>
                    <textarea
                      rows={3}
                      value={notesValue}
                      onChange={(e) => setNotesValue(e.target.value)}
                      placeholder="Write patient diagnostics summary, medication directions, or health checks..."
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-650 dark:focus:ring-brandBlue resize-none font-semibold"
                    ></textarea>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3.5 py-1.5 bg-white border border-gray-250 hover:bg-gray-100 dark:bg-darkCard dark:border-darkBorder text-gray-700 dark:text-white rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveNotes(appt.id)}
                        disabled={submittingNotes}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-brandBlue dark:hover:bg-brandBlue/90 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        {submittingNotes && <Loader2 size={12} className="animate-spin" />}
                        <span>Save Notes & Complete</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    {/* Diagnostic output if completed */}
                    {appt.notes ? (
                      <div className="bg-blue-50/50 dark:bg-brandBlue/5 border border-blue-200 dark:border-brandBlue/10 p-4 rounded-xl text-xs space-y-1 w-full">
                        <p className="font-bold text-blue-600 dark:text-brandBlue flex items-center gap-1.5">
                          <CheckCircle2 size={13} />
                          <span>Diagnosis Summary:</span>
                        </p>
                        <p className="text-gray-650 dark:text-textSecondary font-semibold leading-relaxed whitespace-pre-wrap">
                          {appt.notes}
                        </p>
                      </div>
                    ) : (
                      <div className="text-[10px] text-gray-400 dark:text-textSecondary/60 font-bold uppercase italic">
                        No clinical notes recorded.
                      </div>
                    )}

                    {/* State workflow button controllers */}
                    <div className="flex gap-2 self-end shrink-0">
                      {appt.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(appt.id, 'APPROVED')}
                            className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/20 text-successGreen border border-emerald-500/20 rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            Accept Consult
                          </button>
                          <button
                            onClick={() => handleStatusChange(appt.id, 'CANCELLED')}
                            className="px-3 py-1.5 bg-red-500/15 hover:bg-red-500/20 text-red-650 dark:text-red-405 border border-red-500/20 rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {appt.status === 'APPROVED' && (
                        <button
                          onClick={() => handleEditNotes(appt)}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-brandBlue dark:hover:bg-brandBlue/90 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 hover:scale-[1.01] cursor-pointer"
                        >
                          <FileText size={12} />
                          <span>Record Diagnosis Notes</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl p-16 text-center text-gray-500 dark:text-textSecondary max-w-xl mx-auto shadow-xl">
          <Calendar size={32} className="text-gray-400 dark:text-textSecondary/40 mx-auto mb-3" />
          <p className="font-bold text-sm">Appointments queue is empty.</p>
          <p className="text-xs text-gray-400 dark:text-textSecondary/70 mt-1">Once patients book online sessions with you, they will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
