import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const from = location.state?.from?.pathname;

  const onSubmit = async (data: any) => {
    setLoading(true);
    setErrorMessage(null);
    const loadToast = toast.loading('Authenticating credentials...');
    try {
      await login(data.email, data.password);
      
      const profileResponse = await import('../services/api').then(m => m.default.get('/auth/me'));
      const user = profileResponse.data?.data;
      
      toast.dismiss(loadToast);
      if (user) {
        toast.success(`Welcome back, ${user.name}!`);
        if (from) {
          navigate(from, { replace: true });
        } else {
          if (user.role === 'ADMIN') navigate('/admin');
          else if (user.role === 'DOCTOR') navigate('/doctor');
          else navigate('/patient');
        }
      }
    } catch (err: any) {
      toast.dismiss(loadToast);
      const msg = err.message || 'Login failed. Please verify credentials.';
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

      <div className="max-w-md w-full bg-white dark:bg-darkCard rounded-2xl border border-gray-200 dark:border-darkBorder p-8 sm:p-10 space-y-8 relative z-10 shadow-2xl transition-all duration-200">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-12 h-12 bg-brandBlue/10 text-brandBlue border border-brandBlue/20 rounded-xl flex items-center justify-center text-lg font-bold mx-auto mb-4 shadow-lg shadow-brandBlue/5 select-none">
            ➕
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Access PulseCare</h2>
          <p className="mt-2 text-xs text-gray-500 dark:text-textSecondary font-semibold">
            Sign in to access your secure personalized workspace
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-405 p-3.5 rounded-xl text-xs font-semibold flex gap-2.5 items-start">
            <span className="text-sm leading-none mt-0.5">⚠️</span>
            <div>
              <p className="font-bold">Authentication Failure</p>
              <p className="text-[11px] text-red-700/80 dark:text-red-400/80 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-textSecondary">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 dark:text-textSecondary pointer-events-none">
                <Mail size={15} />
              </span>
              <input
                type="email"
                placeholder="doctor@pulsecare.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-[#222222] border rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-600 dark:focus:ring-brandBlue transition-all ${
                  errors.email
                    ? 'border-red-550/40 focus:ring-red-500/40'
                    : 'border-gray-300 dark:border-white/10 focus:border-blue-600 dark:focus:border-brandBlue'
                }`}
              />
            </div>
            {errors.email && (
              <span className="text-[10px] text-red-500 dark:text-red-400 font-bold block mt-1">{errors.email.message}</span>
            )}
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-textSecondary">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 dark:text-textSecondary pointer-events-none">
                <Lock size={15} />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
                className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-[#222222] border rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-600 dark:focus:ring-brandBlue transition-all ${
                  errors.password
                    ? 'border-red-550/40 focus:ring-red-500/40'
                    : 'border-gray-300 dark:border-white/10 focus:border-blue-600 dark:focus:border-brandBlue'
                }`}
              />
            </div>
            {errors.password && (
              <span className="text-[10px] text-red-500 dark:text-red-400 font-bold block mt-1">{errors.password.message}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-brandBlue dark:hover:bg-brandBlue/90 active:bg-blue-800 dark:active:bg-brandBlue rounded-xl transition duration-150 shadow-lg shadow-brandBlue/10 hover:shadow-xl focus:outline-none flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${
              loading ? 'opacity-80 cursor-not-allowed scale-100' : ''
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Authenticating Workspace...</span>
              </>
            ) : (
              <>
                <span>Sign In to PulseCare</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Footnote links */}
        <div className="text-center border-t border-gray-200 dark:border-darkBorder pt-6">
          <p className="text-xs text-gray-500 dark:text-textSecondary font-semibold">
            Don't have a secure profile?{' '}
            <Link to="/register" className="font-extrabold text-blue-600 dark:text-brandBlue hover:underline transition">
              Create an account
            </Link>
          </p>
          <div className="mt-4 flex justify-center gap-4 text-[10px] text-gray-400 dark:text-textSecondary/60 font-bold">
            <Link to="/" className="hover:text-gray-600 dark:hover:text-textSecondary">Back to Home</Link>
            <span>•</span>
            <span>Local dev.db database connection</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
