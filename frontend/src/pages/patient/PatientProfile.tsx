import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ClipboardList, ShieldAlert, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export const PatientProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
  } = useForm({
    defaultValues: {
      dateOfBirth: '',
      gender: '',
      bloodType: '',
      height: '',
      weight: '',
      allergies: '',
      medicalHistory: '',
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/patients/profile');
        if (response.data?.success) {
          const profile = response.data.data;
          setValue('dateOfBirth', profile.dateOfBirth || '');
          setValue('gender', profile.gender || '');
          setValue('bloodType', profile.bloodType || '');
          setValue('height', profile.height !== null ? String(profile.height) : '');
          setValue('weight', profile.weight !== null ? String(profile.weight) : '');
          setValue('allergies', profile.allergies || '');
          setValue('medicalHistory', profile.medicalHistory || '');
        }
      } catch (error) {
        console.error('Error fetching patient profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [setValue]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    setErrorMsg(null);
    const loadToast = toast.loading('Saving biometric changes...');
    try {
      const response = await api.put('/patients/profile', data);
      if (response.data?.success) {
        toast.dismiss(loadToast);
        toast.success('Biometric profile updated successfully.');
        if (user) {
          updateUser({
            ...user,
            patientProfile: response.data.data,
          });
        }
      }
    } catch (err: any) {
      toast.dismiss(loadToast);
      const msg = err.response?.data?.message || 'Failed to update profile details.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <div className="w-10 h-10 border-3 border-brandBlue border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-textSecondary font-semibold text-xs">Gathering profile records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 selection:bg-brandBlue/35 selection:text-white transition-colors duration-200">
      <div>
        <h1 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Health Biometrics Configuration</h1>
        <p className="text-[11px] text-gray-500 dark:text-textSecondary font-semibold mt-0.5">
          Maintain accurate medical measurements to get highly personalized care recommendations.
        </p>
      </div>

      <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder shadow-xl rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brandBlue/5 rounded-full blur-3xl pointer-events-none"></div>
        
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 p-4 rounded-xl text-xs font-semibold mb-6">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
          {/* Readonly Account Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-5 border-b border-gray-200 dark:border-darkBorder">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider mb-1.5">
                Account Registered Name
              </label>
              <input
                type="text"
                readOnly
                value={user?.name || ''}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-darkSidebar border border-gray-200 dark:border-darkBorder rounded-xl text-xs font-bold text-gray-500 dark:text-textSecondary outline-none select-none cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider mb-1.5">
                Registered Email Address
              </label>
              <input
                type="text"
                readOnly
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-darkSidebar border border-gray-200 dark:border-darkBorder rounded-xl text-xs font-bold text-gray-500 dark:text-textSecondary outline-none select-none cursor-not-allowed"
              />
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider mb-1.5">Date of Birth</label>
              <input
                type="date"
                {...register('dateOfBirth')}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-650 dark:focus:ring-brandBlue"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider mb-1.5">Gender</label>
              <select
                {...register('gender')}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-650 dark:focus:ring-brandBlue cursor-pointer"
              >
                <option value="" className="text-gray-905 dark:text-white bg-white dark:bg-zinc-800">Select Gender</option>
                <option value="MALE" className="text-gray-905 dark:text-white bg-white dark:bg-zinc-800">Male</option>
                <option value="FEMALE" className="text-gray-905 dark:text-white bg-white dark:bg-zinc-800">Female</option>
                <option value="OTHER" className="text-gray-905 dark:text-white bg-white dark:bg-zinc-800">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider mb-1.5">Blood Group</label>
              <select
                {...register('bloodType')}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-650 dark:focus:ring-brandBlue cursor-pointer"
              >
                <option value="" className="text-gray-905 dark:text-white bg-white dark:bg-zinc-800">Select Type</option>
                <option value="A+" className="text-gray-905 dark:text-white bg-white dark:bg-zinc-800">A+</option>
                <option value="A-" className="text-gray-905 dark:text-white bg-white dark:bg-zinc-800">A-</option>
                <option value="B+" className="text-gray-905 dark:text-white bg-white dark:bg-zinc-800">B+</option>
                <option value="B-" className="text-gray-905 dark:text-white bg-white dark:bg-zinc-800">B-</option>
                <option value="AB+" className="text-gray-905 dark:text-white bg-white dark:bg-zinc-800">AB+</option>
                <option value="AB-" className="text-gray-905 dark:text-white bg-white dark:bg-zinc-800">AB-</option>
                <option value="O+" className="text-gray-905 dark:text-white bg-white dark:bg-zinc-800">O+</option>
                <option value="O-" className="text-gray-905 dark:text-white bg-white dark:bg-zinc-800">O-</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider mb-1.5">Height (cm)</label>
              <input
                type="number"
                placeholder="e.g. 175"
                {...register('height')}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-650 dark:focus:ring-brandBlue"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider mb-1.5">Weight (kg)</label>
              <input
                type="number"
                placeholder="e.g. 70"
                {...register('weight')}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-650 dark:focus:ring-brandBlue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-red-650 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert size={14} />
                <span>Allergies / Critical Warnings</span>
              </label>
              <textarea
                rows={3}
                placeholder="List food, environmental, or pharmaceutical allergies (e.g. Penicillin, nuts)..."
                {...register('allergies')}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-650 dark:focus:ring-brandBlue resize-none font-semibold"
              ></textarea>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardList size={14} className="text-brandBlue" />
                <span>Medical History Summary</span>
              </label>
              <textarea
                rows={3}
                placeholder="Provide details of past operations, chronic diagnoses, or genetic conditions..."
                {...register('medicalHistory')}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-650 dark:focus:ring-brandBlue resize-none font-semibold text-gray-650 dark:text-textSecondary"
              ></textarea>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-5 border-t border-gray-200 dark:border-darkBorder">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-brandBlue dark:hover:bg-brandBlue/90 active:bg-blue-800 dark:active:bg-brandBlue text-white rounded-xl text-xs font-bold shadow-md shadow-brandBlue/10 transition flex items-center gap-1.5 hover:scale-[1.01] cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={13} />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientProfile;
