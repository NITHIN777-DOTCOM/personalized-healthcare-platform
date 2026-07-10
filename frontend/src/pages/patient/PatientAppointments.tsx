import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { User, Appointment } from '../../types';
import { Calendar, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const PatientAppointments: React.FC = () => {
  const [doctors, setDoctors] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      doctorId: '',
      dateTime: '',
      reason: '',
    },
  });

  const fetchData = async () => {
    try {
      const [doctorsRes, apptsRes] = await Promise.all([
        api.get('/doctors/list'),
        api.get('/appointments'),
      ]);

      if (doctorsRes.data?.success) setDoctors(doctorsRes.data.data);
      if (apptsRes.data?.success) setAppointments(apptsRes.data.data);
    } catch (error) {
      console.error('Error fetching appointments details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data: any) => {
    setBooking(true);
    setErrorMsg(null);
    const loadToast = toast.loading('Submitting consultation request...');
    try {
      const response = await api.post('/appointments', data);
      if (response.data?.success) {
        toast.dismiss(loadToast);
        toast.success('Consultation requested successfully.');
        reset();
        fetchData();
      }
    } catch (err: any) {
      toast.dismiss(loadToast);
      const msg = err.response?.data?.message || 'Booking appointment failed.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this care consultation?')) return;
    const loadToast = toast.loading('Cancelling consultation...');
    try {
      await api.put(`/appointments/${id}/status`, { status: 'CANCELLED' });
      toast.dismiss(loadToast);
      toast.success('Consultation cancelled.');
      fetchData();
    } catch (error) {
      toast.dismiss(loadToast);
      toast.error('Failed to cancel consultation.');
      console.error('Error cancelling appointment:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 selection:bg-brandBlue/35 selection:text-white transition-colors duration-200">
      {/* Left Column: Book appointment */}
      <section className="lg:col-span-1 space-y-4">
        <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder shadow-xl rounded-2xl p-6 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brandBlue/5 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Book Consultation</h2>
            <p className="text-[11px] text-gray-500 dark:text-textSecondary font-semibold mt-0.5">Select a specialist and schedule a session.</p>
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 p-3 rounded-xl text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative z-10">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider mb-1">Select Clinician</label>
              <select
                {...register('doctorId', { required: 'Doctor selection is required' })}
                className={`w-full px-3.5 py-2.5 bg-white dark:bg-[#222222] border rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-650 dark:focus:ring-brandBlue bg-white cursor-pointer ${
                  errors.doctorId ? 'border-red-500/40' : 'border-gray-300 dark:border-white/10'
                }`}
              >
                <option value="" className="text-gray-900 dark:text-white bg-white dark:bg-zinc-800">-- Choose Specialist --</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id} className="text-gray-900 dark:text-white bg-white dark:bg-zinc-800">
                    Dr. {doc.name} ({doc.doctorProfile?.specialization || 'General Medicine'}) - $
                    {doc.doctorProfile?.consultationFee || 0}
                  </option>
                ))}
              </select>
              {errors.doctorId && (
                <span className="text-[9px] text-red-550 dark:text-red-400 font-bold mt-1 block">{errors.doctorId.message}</span>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider mb-1">Date & Time</label>
              <input
                type="datetime-local"
                {...register('dateTime', { required: 'Appointment date/time is required' })}
                className={`w-full px-3.5 py-2.5 bg-white dark:bg-[#222222] border rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-650 dark:focus:ring-brandBlue ${
                  errors.dateTime ? 'border-red-500/40' : 'border-gray-300 dark:border-white/10'
                }`}
              />
              {errors.dateTime && (
                <span className="text-[9px] text-red-550 dark:text-red-400 font-bold mt-1 block">{errors.dateTime.message}</span>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider mb-1">Symptoms / Reason</label>
              <textarea
                rows={3}
                placeholder="State symptoms or consultation purpose..."
                {...register('reason')}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-650 dark:focus:ring-brandBlue resize-none font-semibold"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={booking}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-brandBlue dark:hover:bg-brandBlue/90 text-white rounded-xl text-xs font-bold shadow-md shadow-brandBlue/10 cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.01]"
            >
              {booking ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Requesting session...</span>
                </>
              ) : (
                <>
                  <Calendar size={13} />
                  <span>Request Appointment</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Right Column: Appointments list */}
      <section className="lg:col-span-2 space-y-4">
        <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder shadow-xl rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-darkBorder flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Scheduled Consultations</h2>
              <p className="text-[11px] text-gray-500 dark:text-textSecondary font-semibold mt-0.5">Monitor pending requests and completed checkups.</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-darkSidebar text-gray-650 dark:text-textSecondary rounded-xl border border-gray-200 dark:border-darkBorder shadow-sm">
              Total: {appointments.length}
            </span>
          </div>

          {loading ? (
            <div className="p-16 text-center">
              <div className="w-8 h-8 border-3 border-brandBlue border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-gray-500 dark:text-textSecondary mt-3 font-semibold">Retrieving schedule...</p>
            </div>
          ) : appointments.length > 0 ? (
            <div className="divide-y divide-gray-150 dark:divide-darkBorder max-h-[520px] overflow-y-auto">
              {appointments.map((appt) => (
                <div key={appt.id} className="p-6 space-y-4 hover:bg-slate-50 dark:hover:bg-darkSidebar/10 transition duration-150">
                  
                  {/* Doctor Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brandBlue/10 text-brandBlue border border-brandBlue/20 font-bold flex items-center justify-center text-xs">
                        {appt.doctor?.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Dr. {appt.doctor?.name}</h3>
                        <p className="text-[10px] text-gray-500 dark:text-textSecondary font-semibold mt-0.5">
                          {appt.doctor?.doctorProfile?.specialization || 'General Specialist'} • License:{' '}
                          {appt.doctor?.doctorProfile?.licenseNumber || 'Verified'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
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

                  {/* Scheduled slots detail boxes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-gray-600 dark:text-textSecondary bg-slate-50 dark:bg-darkSidebar border border-gray-200 dark:border-darkBorder p-4 rounded-xl">
                    <div className="space-y-1">
                      <p className="text-[9px] text-gray-400 dark:text-textSecondary/75 uppercase tracking-wider">Scheduled Date/Time</p>
                      <p className="text-gray-900 dark:text-white font-bold flex items-center gap-1.5">
                        <Clock size={12} className="text-brandBlue" />
                        {new Date(appt.dateTime).toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] text-gray-400 dark:text-textSecondary/75 uppercase tracking-wider">Reason Stated</p>
                      <p className="text-gray-900 dark:text-white font-bold truncate">{appt.reason || 'No description provided.'}</p>
                    </div>
                  </div>

                  {/* Diagnostic notes if completed */}
                  {appt.notes && (
                    <div className="bg-blue-50/50 dark:bg-brandBlue/5 border border-blue-200 dark:border-brandBlue/10 p-4 rounded-xl text-xs space-y-1">
                      <p className="font-bold text-blue-600 dark:text-brandBlue flex items-center gap-1.5">
                        <CheckCircle2 size={13} />
                        <span>Clinician Care Diagnosis & Notes:</span>
                      </p>
                      <p className="text-gray-650 dark:text-textSecondary font-semibold leading-relaxed whitespace-pre-wrap mt-1">
                        {appt.notes}
                      </p>
                    </div>
                  )}

                  {/* Cancel Button */}
                  {['PENDING', 'APPROVED'].includes(appt.status) && (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleCancel(appt.id)}
                        className="px-3.5 py-1.5 bg-gray-50 border border-gray-250 hover:bg-gray-100 dark:bg-darkSidebar dark:border-red-500/20 text-gray-700 dark:text-red-400 rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        Cancel Consultation
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center text-gray-500 dark:text-textSecondary">
              <p className="font-bold text-sm">No care consultations scheduled.</p>
              <p className="text-xs text-gray-400 dark:text-textSecondary/70 mt-1">Book your first session using the scheduler console on the left.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PatientAppointments;
