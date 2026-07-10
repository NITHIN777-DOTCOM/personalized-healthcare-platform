import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Award, Loader2, Save, BadgeCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const DoctorProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      specialization: '',
      licenseNumber: '',
      consultationFee: '',
      bio: '',
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/doctors/profile');
        if (response.data?.success) {
          const profile = response.data.data;
          setValue('specialization', profile.specialization || '');
          setValue('licenseNumber', profile.licenseNumber || '');
          setValue('consultationFee', profile.consultationFee !== null ? String(profile.consultationFee) : '');
          setValue('bio', profile.bio || '');
        }
      } catch (error) {
        console.error('Error fetching doctor profile details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [setValue]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    setErrorMsg(null);
    const loadToast = toast.loading('Saving credential updates...');
    try {
      const response = await api.put('/doctors/profile', {
        ...data,
        consultationFee: data.consultationFee ? parseFloat(data.consultationFee) : null,
      });
      if (response.data?.success) {
        toast.dismiss(loadToast);
        toast.success('Clinical profile credentials updated.');
        if (user) {
          updateUser({
            ...user,
            doctorProfile: response.data.data,
          });
        }
      }
    } catch (err: any) {
      toast.dismiss(loadToast);
      const msg = err.response?.data?.message || 'Failed to save professional profile.';
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
        <p className="text-gray-500 dark:text-textSecondary font-semibold text-xs">Retrieving professional credentials...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 selection:bg-brandBlue/35 selection:text-white transition-colors duration-200">
      <div>
        <h1 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Clinical Profile Settings</h1>
        <p className="text-[11px] text-gray-500 dark:text-textSecondary font-semibold mt-0.5">
          Configure clinical parameters, consultation fee schedules, and licenses for the public directory.
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
          
          {/* Account Identity Readonly details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-5 border-b border-gray-200 dark:border-darkBorder">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider mb-1.5">
                Registered Doctor Name
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
                Registered Contact Email
              </label>
              <input
                type="text"
                readOnly
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-darkSidebar border border-gray-200 dark:border-darkBorder rounded-xl text-xs font-bold text-gray-500 dark:text-textSecondary outline-none select-none cursor-not-allowed"
              />
            </div>
          </div>

          {/* Form Credentials fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider mb-1.5">
                Medical Specialization *
              </label>
              <input
                type="text"
                placeholder="e.g. Cardiology, Pediatrics"
                {...register('specialization', { required: 'Specialization is required' })}
                className={`w-full px-3.5 py-2.5 bg-white dark:bg-[#222222] border rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-555 focus:outline-none focus:ring-1 focus:ring-blue-650 dark:focus:ring-brandBlue ${
                  errors.specialization ? 'border-red-500/40' : 'border-gray-300 dark:border-white/10'
                }`}
              />
              {errors.specialization && (
                <span className="text-[9px] text-red-550 dark:text-red-400 font-bold block mt-1">{errors.specialization.message}</span>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider mb-1.5">
                License ID Number *
              </label>
              <input
                type="text"
                placeholder="e.g. LIC-995511"
                {...register('licenseNumber', { required: 'License number is required' })}
                className={`w-full px-3.5 py-2.5 bg-white dark:bg-[#222222] border rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-555 focus:outline-none focus:ring-1 focus:ring-blue-650 dark:focus:ring-brandBlue ${
                  errors.licenseNumber ? 'border-red-500/40' : 'border-gray-300 dark:border-white/10'
                }`}
              />
              {errors.licenseNumber && (
                <span className="text-[9px] text-red-550 dark:text-red-400 font-bold block mt-1">{errors.licenseNumber.message}</span>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider mb-1.5">
                Consultation Fee ($)
              </label>
              <input
                type="number"
                placeholder="e.g. 150"
                {...register('consultationFee')}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-555 focus:outline-none focus:ring-1 focus:ring-blue-650 dark:focus:ring-brandBlue"
              />
            </div>
          </div>

          {/* Professional Bio */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider flex items-center gap-1.5">
              <Award size={14} className="text-brandBlue" />
              <span>Professional Biography</span>
            </label>
            <textarea
              rows={4}
              placeholder="State your medical background, clinical experiences, and consulting values..."
              {...register('bio')}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-650 dark:focus:ring-brandBlue resize-none font-semibold text-gray-650 dark:text-textSecondary"
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="flex justify-between items-center pt-5 border-t border-gray-200 dark:border-darkBorder">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-textSecondary font-bold bg-slate-50 dark:bg-darkSidebar border border-gray-200 dark:border-darkBorder px-3 py-1.5 rounded-xl">
              <BadgeCheck size={14} className="text-emerald-500 dark:text-emerald-400" />
              <span>Public Directory Visible</span>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-brandBlue dark:hover:bg-brandBlue/90 active:bg-blue-800 dark:active:bg-brandBlue text-white rounded-xl text-xs font-bold shadow-md shadow-brandBlue/10 transition flex items-center gap-1.5 hover:scale-[1.01] cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Saving details...</span>
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

export default DoctorProfile;
