import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { User, HealthMetric } from '../../types';
import { Search, ShieldAlert, FileText, Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const DoctorPatients: React.FC = () => {
  const [patients, setPatients] = useState<User[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
  const [patientMetrics, setPatientMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [submittingRec, setSubmittingRec] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const fetchPatients = async () => {
    try {
      const response = await api.get('/doctors/my-patients');
      if (response.data?.success) {
        setPatients(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching doctor patients list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSelectPatient = async (patient: User) => {
    setSelectedPatient(patient);
    setLoadingMetrics(true);
    try {
      const response = await api.get(`/patients/metrics?patientId=${patient.id}`);
      if (response.data?.success) {
        setPatientMetrics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching patient metrics:', error);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const onSubmitRecommendation = async (data: any) => {
    if (!selectedPatient) return;
    setSubmittingRec(true);
    const loadToast = toast.loading('Sending prescription recommendation...');
    try {
      const payload = {
        patientId: selectedPatient.id,
        title: data.title,
        description: data.description,
      };
      const response = await api.post('/recommendations', payload);
      if (response.data?.success) {
        toast.dismiss(loadToast);
        toast.success(`Recommendation submitted successfully to ${selectedPatient.name}.`);
        reset();
      }
    } catch (error: any) {
      toast.dismiss(loadToast);
      toast.error(error.response?.data?.message || 'Failed to submit recommendation.');
    } finally {
      setSubmittingRec(false);
    }
  };

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 selection:bg-brandBlue/35 selection:text-white transition-colors duration-200">
      {/* Left Column: Directory */}
      <section className="lg:col-span-1 space-y-4">
        <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder shadow-xl rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Patient Logs Directory</h2>
            <p className="text-[11px] text-gray-500 dark:text-textSecondary font-semibold mt-0.5">Select a patient profile to review metrics history.</p>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-405 dark:text-textSecondary pointer-events-none">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search patients by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-650 dark:focus:ring-brandBlue placeholder-gray-400 dark:placeholder-gray-550"
            />
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="w-6 h-6 border-2 border-brandBlue border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : filteredPatients.length > 0 ? (
            <div className="divide-y divide-gray-150 dark:divide-darkBorder max-h-[440px] overflow-y-auto pr-1">
              {filteredPatients.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPatient(p)}
                  className={`w-full text-left p-3 rounded-xl transition flex items-center gap-3.5 mt-1 border cursor-pointer ${
                    selectedPatient?.id === p.id
                      ? 'bg-brandBlue/10 border-brandBlue/20 text-brandBlue dark:text-white font-bold'
                      : 'border-transparent hover:bg-gray-100 dark:hover:bg-darkSidebar/50 text-gray-600 dark:text-textSecondary hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-darkSidebar border border-gray-200 dark:border-darkBorder text-gray-905 dark:text-white font-extrabold flex items-center justify-center text-xs select-none">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-550 dark:text-textSecondary/65 truncate font-semibold mt-0.5">{p.email}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-textSecondary text-xs">
              No patients associated.
            </div>
          )}
        </div>
      </section>

      {/* Right Columns: Logs evaluation & Recommendations entry */}
      <section className="lg:col-span-2 space-y-6">
        {selectedPatient ? (
          <div className="space-y-6">
            
            {/* Patient Biometrics Card */}
            <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder shadow-xl rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-brandBlue/10 text-brandBlue border border-brandBlue/20 font-bold flex items-center justify-center text-sm">
                  {selectedPatient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">{selectedPatient.name}</h3>
                  <p className="text-[10px] text-gray-500 dark:text-textSecondary font-semibold mt-0.5">Biometrics and warning details</p>
                </div>
              </div>

              {/* Bio Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-darkSidebar border border-gray-200 dark:border-darkBorder p-4 rounded-xl text-xs font-semibold text-gray-600 dark:text-textSecondary">
                <div>
                  <p className="text-[9px] text-gray-400 dark:text-textSecondary/60 uppercase mb-0.5">Blood Type</p>
                  <p className="text-gray-900 dark:text-white font-bold">{selectedPatient.patientProfile?.bloodType || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 dark:text-textSecondary/60 uppercase mb-0.5">Date of Birth</p>
                  <p className="text-gray-900 dark:text-white font-bold">{selectedPatient.patientProfile?.dateOfBirth || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 dark:text-textSecondary/60 uppercase mb-0.5">Height</p>
                  <p className="text-gray-900 dark:text-white font-bold">
                    {selectedPatient.patientProfile?.height ? `${selectedPatient.patientProfile.height} cm` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 dark:text-textSecondary/60 uppercase mb-0.5">Weight</p>
                  <p className="text-gray-900 dark:text-white font-bold">
                    {selectedPatient.patientProfile?.weight ? `${selectedPatient.patientProfile.weight} kg` : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Warnings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="bg-red-500/10 border border-red-500/15 p-4 rounded-xl space-y-1">
                  <p className="font-bold text-red-650 dark:text-red-400 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <ShieldAlert size={12} /> Allergies Warning
                  </p>
                  <p className="text-gray-700 dark:text-textSecondary font-semibold leading-relaxed">
                    {selectedPatient.patientProfile?.allergies || 'No allergies declared.'}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-darkSidebar border border-gray-200 dark:border-darkBorder p-4 rounded-xl space-y-1">
                  <p className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[10px]">
                    📋 Diagnoses & History
                  </p>
                  <p className="text-gray-700 dark:text-textSecondary font-semibold leading-relaxed">
                    {selectedPatient.patientProfile?.medicalHistory || 'No historical records declared.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Vitals Logs check */}
            <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder shadow-xl rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-darkBorder flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Patient Vitals History</h4>
                <span className="text-[9px] font-bold bg-slate-50 dark:bg-darkSidebar border border-gray-200 dark:border-darkBorder text-gray-600 dark:text-textSecondary px-2.5 py-0.5 rounded-full">
                  Recent Readings
                </span>
              </div>

              {loadingMetrics ? (
                <div className="p-8 text-center">
                  <div className="w-6 h-6 border-2 border-brandBlue border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : patientMetrics.length > 0 ? (
                <div className="max-h-[220px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-darkSidebar/30 border-b border-gray-200 dark:border-darkBorder text-gray-500 dark:text-textSecondary uppercase text-[9px] font-bold tracking-wider sticky top-0 backdrop-blur-md">
                        <th className="px-6 py-2.5">Date</th>
                        <th className="px-6 py-2.5">Metric</th>
                        <th className="px-6 py-2.5">Reading</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 dark:divide-darkBorder text-gray-600 dark:text-textSecondary font-bold">
                      {patientMetrics.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-darkSidebar/10 transition">
                          <td className="px-6 py-2 text-gray-500 dark:text-textSecondary/70 font-medium">
                            {new Date(m.recordedAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-2">
                            <span className="bg-slate-100 dark:bg-darkSidebar text-gray-900 dark:text-white border border-gray-200 dark:border-darkBorder px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold uppercase">
                              {m.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-2 text-gray-950 dark:text-white font-extrabold">
                            {m.value} <span className="text-gray-500 dark:text-textSecondary font-semibold text-[10px]">{m.unit}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-textSecondary text-xs">
                  No vital records reported by this patient.
                </div>
              )}
            </div>

            {/* Quick recommendation form */}
            <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder shadow-xl rounded-2xl p-6 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Write Recommendation directive</h4>
                <p className="text-[11px] text-gray-500 dark:text-textSecondary font-semibold mt-0.5">Submit diet plan guidelines, exercises, or medicine directives.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmitRecommendation)} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider mb-1">
                    Recommendation Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hypertension management plan, Cardio guidelines"
                    {...register('title', { required: 'Title is required' })}
                    className={`w-full px-3.5 py-2.5 bg-white dark:bg-[#222222] border rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-600 dark:focus:ring-brandBlue ${
                      errors.title ? 'border-red-500/40' : 'border-gray-300 dark:border-white/10'
                    }`}
                  />
                  {errors.title && <span className="text-[9px] text-red-550 dark:text-red-400 font-bold mt-1 block">{errors.title.message}</span>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider mb-1">
                    Detailed Guidelines
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Write treatment plan guidelines. Support line breaks..."
                    {...register('description', { required: 'Guidelines are required' })}
                    className={`w-full px-3.5 py-2.5 bg-white dark:bg-[#222222] border rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-600 dark:focus:ring-brandBlue resize-none font-semibold ${
                      errors.description ? 'border-red-500/40' : 'border-gray-300 dark:border-white/10'
                    }`}
                  ></textarea>
                  {errors.description && (
                    <span className="text-[9px] text-red-550 dark:text-red-400 font-bold mt-1 block">{errors.description.message}</span>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingRec}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-brandBlue dark:hover:bg-brandBlue/90 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 hover:scale-[1.01] cursor-pointer"
                  >
                    {submittingRec ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Sending plan...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={13} />
                        <span>Submit Recommendation</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

          </div>
        ) : (
          <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl p-16 text-center text-gray-500 dark:text-textSecondary max-w-lg mx-auto shadow-xl">
            <FileText size={32} className="text-gray-400 dark:text-textSecondary/40 mx-auto mb-3" />
            <p className="font-bold text-sm">Select Patient</p>
            <p className="text-xs text-gray-450 dark:text-textSecondary/70 mt-1">
              Select any patient from the directory on the left to evaluate biometric logs and write prescriptions.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default DoctorPatients;
