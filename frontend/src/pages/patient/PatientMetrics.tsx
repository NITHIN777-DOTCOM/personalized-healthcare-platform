import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { HealthMetric } from '../../types';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const PatientMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      type: 'BLOOD_PRESSURE',
      value: '',
      unit: 'mmHg',
    },
  });

  const selectedType = watch('type');

  useEffect(() => {
    switch (selectedType) {
      case 'BLOOD_PRESSURE':
        setValue('unit', 'mmHg');
        break;
      case 'HEART_RATE':
        setValue('unit', 'bpm');
        break;
      case 'BLOOD_SUGAR':
        setValue('unit', 'mg/dL');
        break;
      case 'WEIGHT':
        setValue('unit', 'kg');
        break;
      case 'STEPS':
        setValue('unit', 'steps');
        break;
      case 'SLEEP':
        setValue('unit', 'hours');
        break;
    }
  }, [selectedType, setValue]);

  const fetchMetrics = async () => {
    try {
      const response = await api.get('/patients/metrics');
      if (response.data?.success) {
        setMetrics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    setErrorMsg(null);
    const loadToast = toast.loading('Recording log entry...');
    try {
      const response = await api.post('/patients/metrics', data);
      if (response.data?.success) {
        toast.dismiss(loadToast);
        toast.success(`Successfully logged ${data.type.replace('_', ' ')}: ${data.value} ${data.unit}`);
        reset({ type: data.type, value: '', unit: data.unit });
        fetchMetrics();
      }
    } catch (err: any) {
      toast.dismiss(loadToast);
      const msg = err.response?.data?.message || 'Failed to record vitals.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, type: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this vital entry?')) return;
    const loadToast = toast.loading('Deleting log entry...');
    try {
      await api.delete(`/patients/metrics/${id}`);
      toast.dismiss(loadToast);
      toast.success(`Deleted ${type.replace('_', ' ')} entry.`);
      setMetrics(metrics.filter((m) => m.id !== id));
    } catch (error) {
      toast.dismiss(loadToast);
      toast.error('Failed to delete log entry.');
      console.error('Error deleting vital:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 selection:bg-brandBlue/35 selection:text-white transition-colors duration-200">
      {/* Left Column: Form to log vitals */}
      <section className="lg:col-span-1 space-y-4">
        <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder shadow-xl rounded-2xl p-6 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brandBlue/5 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Log Bio-Vitals</h2>
            <p className="text-[11px] text-gray-500 dark:text-textSecondary font-semibold mt-0.5">Maintain consistent logging to track health trends.</p>
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative z-10">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider mb-1">Metric Category</label>
              <select
                {...register('type')}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-650 dark:focus:ring-brandBlue cursor-pointer"
              >
                <option value="BLOOD_PRESSURE" className="text-gray-900 dark:text-white bg-white dark:bg-zinc-800">Blood Pressure</option>
                <option value="HEART_RATE" className="text-gray-900 dark:text-white bg-white dark:bg-zinc-800">Heart Rate</option>
                <option value="BLOOD_SUGAR" className="text-gray-900 dark:text-white bg-white dark:bg-zinc-800">Blood Sugar</option>
                <option value="WEIGHT" className="text-gray-900 dark:text-white bg-white dark:bg-zinc-800">Weight</option>
                <option value="STEPS" className="text-gray-900 dark:text-white bg-white dark:bg-zinc-800">Steps Count</option>
                <option value="SLEEP" className="text-gray-900 dark:text-white bg-white dark:bg-zinc-800">Sleep Duration</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider mb-1">Value</label>
                <input
                  type="text"
                  placeholder={selectedType === 'BLOOD_PRESSURE' ? 'e.g. 120/80' : 'e.g. 72'}
                  {...register('value', { required: 'Value is required' })}
                  className={`w-full px-3.5 py-2.5 bg-white dark:bg-[#222222] border rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-600 dark:focus:ring-brandBlue ${
                    errors.value ? 'border-red-500/40' : 'border-gray-300 dark:border-white/10'
                  }`}
                />
                {errors.value && <span className="text-[9px] text-red-550 dark:text-red-400 font-bold mt-1 block">{errors.value.message}</span>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider mb-1">Unit</label>
                <input
                  type="text"
                  readOnly
                  {...register('unit')}
                  className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-white/10 rounded-xl text-xs font-bold text-gray-500 dark:text-textSecondary outline-none select-none cursor-not-allowed text-center"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-brandBlue dark:hover:bg-brandBlue/90 text-white rounded-xl text-xs font-bold shadow-md shadow-brandBlue/10 cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.01]"
            >
              {submitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Logging entry...</span>
                </>
              ) : (
                <>
                  <Plus size={13} />
                  <span>Record Vital Log</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Right Column: Historical logs */}
      <section className="lg:col-span-2 space-y-4">
        <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder shadow-xl rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-darkBorder flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Biometric Logs History</h2>
              <p className="text-[11px] text-gray-500 dark:text-textSecondary font-semibold mt-0.5">Audit log records synced with your profile.</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-darkSidebar text-gray-600 dark:text-textSecondary rounded-xl border border-gray-200 dark:border-darkBorder shadow-sm">
              Total Logs: {metrics.length}
            </span>
          </div>

          {loading ? (
            <div className="p-16 text-center">
              <div className="w-8 h-8 border-3 border-brandBlue border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-gray-500 dark:text-textSecondary mt-3 font-semibold">Retrieving logs...</p>
            </div>
          ) : metrics.length > 0 ? (
            <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-darkSidebar/50 text-gray-500 dark:text-textSecondary uppercase text-[9px] font-bold tracking-wider border-b border-gray-200 dark:border-darkBorder sticky top-0 backdrop-blur-md">
                    <th className="px-6 py-3.5">Logged Date</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Value</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 dark:divide-darkBorder text-xs font-semibold">
                  {metrics.map((metric) => (
                    <tr key={metric.id} className="hover:bg-slate-50 dark:hover:bg-darkSidebar/20 transition duration-150">
                      <td className="px-6 py-4 text-gray-500 dark:text-textSecondary font-medium">
                        {new Date(metric.recordedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-darkSidebar border border-gray-200 dark:border-darkBorder text-gray-900 dark:text-white uppercase tracking-wide">
                          {metric.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-gray-900 dark:text-white text-sm">
                        {metric.value} <span className="text-gray-500 dark:text-textSecondary font-semibold text-xs ml-0.5">{metric.unit}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(metric.id, metric.type)}
                          className="text-red-650 dark:text-red-400 hover:text-red-750 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-550/10 p-1.5 rounded-lg border border-transparent hover:border-red-200 dark:hover:border-red-500/20 transition cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center text-gray-500 dark:text-textSecondary">
              <p className="font-bold text-sm">No biometric logs found.</p>
              <p className="text-xs text-gray-400 dark:text-textSecondary/70 mt-1">Submit records using the log console on the left.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PatientMetrics;
