import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, ArrowLeft, Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';

export const Register: React.FC = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'PATIENT',
      patientProfile: {
        dateOfBirth: '',
        gender: '',
        bloodType: '',
        height: '',
        weight: '',
        allergies: '',
        medicalHistory: '',
      },
      doctorProfile: {
        specialization: '',
        licenseNumber: '',
        consultationFee: '',
        bio: '',
      },
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setErrorMessage(null);
    const loadToast = toast.loading('Registering user credentials...');
    try {
      const payload: any = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      };

      if (data.role === 'PATIENT') {
        payload.patientProfile = data.patientProfile;
      } else if (data.role === 'DOCTOR') {
        payload.doctorProfile = {
          ...data.doctorProfile,
          consultationFee: data.doctorProfile.consultationFee ? parseFloat(data.doctorProfile.consultationFee) : null,
        };
      }

      await registerUser(payload);
      
      const profileResponse = await import('../services/api').then(m => m.default.get('/auth/me'));
      const user = profileResponse.data?.data;
      
      toast.dismiss(loadToast);
      if (user) {
        toast.success(`Account created successfully! Welcome, ${user.name}.`);
        if (user.role === 'DOCTOR') navigate('/doctor');
        else if (user.role === 'ADMIN') navigate('/admin');
        else navigate('/patient');
      }
    } catch (err: any) {
      toast.dismiss(loadToast);
      const msg = err.message || 'Registration failed. Please review your details.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkBg text-gray-900 dark:text-white flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden selection:bg-brandBlue/35 selection:text-white transition-colors duration-200">
      {/* Decorative neon nodes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brandBlue/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-xl w-full bg-white dark:bg-darkCard rounded-2xl border border-gray-200 dark:border-darkBorder p-8 sm:p-10 space-y-6 relative z-10 shadow-2xl transition-all duration-200">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-12 h-12 bg-brandBlue/10 text-brandBlue border border-brandBlue/20 rounded-xl flex items-center justify-center text-lg font-bold mx-auto mb-4 shadow-lg shadow-brandBlue/5 select-none">
            ➕
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Create PulseCare Profile</h2>
          <p className="mt-2 text-xs text-gray-500 dark:text-textSecondary font-semibold">
            Join the digital health and wellness network
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 p-3.5 rounded-xl text-xs font-semibold flex gap-2.5 items-start">
            <span className="text-sm leading-none mt-0.5">⚠️</span>
            <div>
              <p className="font-bold">Registration Failure</p>
              <p className="text-[11px] text-red-700/80 dark:text-red-400/80 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          
          {/* Main Account Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-textSecondary">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 dark:text-textSecondary pointer-events-none">
                  <User size={14} />
                </span>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  {...register('name', { required: 'Name is required' })}
                  className={`w-full pl-9 pr-3 py-2 bg-white dark:bg-[#222222] border rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-600 dark:focus:ring-brandBlue transition-all ${
                    errors.name
                      ? 'border-red-500/40 focus:ring-red-500/40'
                      : 'border-gray-300 dark:border-white/10 focus:border-blue-600 dark:focus:border-brandBlue'
                  }`}
                />
              </div>
              {errors.name && <span className="text-[9px] text-red-550 dark:text-red-400 font-bold block">{errors.name.message}</span>}
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-textSecondary">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 dark:text-textSecondary pointer-events-none">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  placeholder="e.g. john@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className={`w-full pl-9 pr-3 py-2 bg-white dark:bg-[#222222] border rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-600 dark:focus:ring-brandBlue transition-all ${
                    errors.email
                      ? 'border-red-500/40 focus:ring-red-500/40'
                      : 'border-gray-300 dark:border-white/10 focus:border-blue-600 dark:focus:border-brandBlue'
                  }`}
                />
              </div>
              {errors.email && <span className="text-[9px] text-red-550 dark:text-red-400 font-bold block">{errors.email.message}</span>}
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-textSecondary">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 dark:text-textSecondary pointer-events-none">
                  <Lock size={14} />
                </span>
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                  })}
                  className={`w-full pl-9 pr-3 py-2 bg-white dark:bg-[#222222] border rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-600 dark:focus:ring-brandBlue transition-all ${
                    errors.password
                      ? 'border-red-550/40 focus:ring-red-500/40'
                      : 'border-gray-300 dark:border-white/10 focus:border-blue-600 dark:focus:border-brandBlue'
                  }`}
                />
              </div>
              {errors.password && <span className="text-[9px] text-red-550 dark:text-red-400 font-bold block">{errors.password.message}</span>}
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-textSecondary">Account Type</label>
              <select
                {...register('role')}
                onChange={(e) => setSelectedRole(e.target.value as 'PATIENT' | 'DOCTOR')}
                className="w-full px-3 py-2 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-650 dark:focus:ring-brandBlue transition-all cursor-pointer"
              >
                <option value="PATIENT" className="text-gray-900 dark:text-white bg-white dark:bg-zinc-800">Patient Account</option>
                <option value="DOCTOR" className="text-gray-900 dark:text-white bg-white dark:bg-zinc-800">Clinician / Doctor Account</option>
              </select>
            </div>
          </div>

          {/* Dynamic Biometrics/Credentials Sections */}
          <div className="pt-4 border-t border-gray-200 dark:border-darkBorder">
            {selectedRole === 'PATIENT' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Patient Biometrics (Optional)</h3>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 dark:text-textSecondary uppercase mb-1">Date of Birth</label>
                    <input
                      type="date"
                      {...register('patientProfile.dateOfBirth')}
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 dark:focus:ring-brandBlue"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 dark:text-textSecondary uppercase mb-1">Gender</label>
                    <select
                      {...register('patientProfile.gender')}
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 dark:focus:ring-brandBlue cursor-pointer"
                    >
                      <option value="" className="text-gray-905 dark:text-white bg-white dark:bg-zinc-800">Select</option>
                      <option value="MALE" className="text-gray-905 dark:text-white bg-white dark:bg-zinc-800">Male</option>
                      <option value="FEMALE" className="text-gray-905 dark:text-white bg-white dark:bg-zinc-800">Female</option>
                      <option value="OTHER" className="text-gray-905 dark:text-white bg-white dark:bg-zinc-800">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 dark:text-textSecondary uppercase mb-1">Blood Type</label>
                    <select
                      {...register('patientProfile.bloodType')}
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 dark:focus:ring-brandBlue cursor-pointer"
                    >
                      <option value="" className="text-gray-905 dark:text-white bg-white dark:bg-zinc-800">Select</option>
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
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 dark:text-textSecondary uppercase mb-1">Height (cm)</label>
                    <input
                      type="number"
                      placeholder="e.g. 175"
                      {...register('patientProfile.height')}
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 dark:focus:ring-brandBlue"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 dark:text-textSecondary uppercase mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      placeholder="e.g. 70"
                      {...register('patientProfile.weight')}
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 dark:focus:ring-brandBlue"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 dark:text-textSecondary uppercase mb-1">Allergies</label>
                    <textarea
                      rows={2}
                      placeholder="Peanuts, latex, penicillin..."
                      {...register('patientProfile.allergies')}
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 dark:focus:ring-brandBlue resize-none"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 dark:text-textSecondary uppercase mb-1">Medical History Summary</label>
                    <textarea
                      rows={2}
                      placeholder="Hypertension, asthma history..."
                      {...register('patientProfile.medicalHistory')}
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 dark:focus:ring-brandBlue resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {selectedRole === 'DOCTOR' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Required Clinician Credentials</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-gray-500 dark:text-textSecondary uppercase">Specialization *</label>
                    <input
                      type="text"
                      placeholder="e.g. Cardiology"
                      {...register('doctorProfile.specialization', {
                        required: selectedRole === 'DOCTOR' ? 'Specialization is required' : false,
                      })}
                      className={`w-full px-3 py-2 bg-white dark:bg-[#222222] border rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 dark:focus:ring-brandBlue ${
                        errors.doctorProfile?.specialization
                          ? 'border-red-500/40'
                          : 'border-gray-300 dark:border-white/10'
                      }`}
                    />
                    {errors.doctorProfile?.specialization && (
                      <span className="text-[9px] text-red-550 dark:text-red-400 font-bold block">
                        {errors.doctorProfile.specialization.message}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-gray-500 dark:text-textSecondary uppercase">License Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. LIC-998877"
                      {...register('doctorProfile.licenseNumber', {
                        required: selectedRole === 'DOCTOR' ? 'License number is required' : false,
                      })}
                      className={`w-full px-3 py-2 bg-white dark:bg-[#222222] border rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 dark:focus:ring-brandBlue ${
                        errors.doctorProfile?.licenseNumber
                          ? 'border-red-550/40'
                          : 'border-gray-300 dark:border-white/10'
                      }`}
                    />
                    {errors.doctorProfile?.licenseNumber && (
                      <span className="text-[9px] text-red-550 dark:text-red-400 font-bold block">
                        {errors.doctorProfile.licenseNumber.message}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-gray-500 dark:text-textSecondary uppercase">Consultation Fee ($)</label>
                    <input
                      type="number"
                      placeholder="e.g. 150"
                      {...register('doctorProfile.consultationFee')}
                      className="w-full px-3 py-2 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 dark:focus:ring-brandBlue"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-gray-500 dark:text-textSecondary uppercase">Professional Bio</label>
                    <textarea
                      rows={2}
                      placeholder="Brief details about your clinical practice..."
                      {...register('doctorProfile.bio')}
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 dark:focus:ring-brandBlue resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-brandBlue dark:hover:bg-brandBlue/90 rounded-xl transition duration-150 shadow-lg shadow-brandBlue/10 hover:shadow-xl focus:outline-none flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${
              loading ? 'opacity-80 cursor-not-allowed scale-100' : ''
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Creating Secure Account...</span>
              </>
            ) : (
              'Create Secure Account'
            )}
          </button>
        </form>

        {/* Footnote links */}
        <div className="text-center border-t border-gray-200 dark:border-darkBorder pt-6">
          <p className="text-xs text-gray-500 dark:text-textSecondary font-semibold">
            Already have a PulseCare account?{' '}
            <Link to="/login" className="font-extrabold text-blue-600 dark:text-brandBlue hover:underline transition">
              Sign In
            </Link>
          </p>
          <div className="mt-4 flex justify-center gap-4 text-[10px] text-gray-400 dark:text-textSecondary/65 font-bold">
            <Link to="/" className="hover:text-gray-600 dark:hover:text-textSecondary flex items-center gap-1">
              <ArrowLeft size={10} /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
