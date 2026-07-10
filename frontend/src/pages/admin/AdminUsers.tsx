import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { User } from '../../types';
import { Plus, Trash2, Edit2, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // State for toggling editing mode vs creating
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'PATIENT',
      patientProfile: {
        bloodType: '',
        dateOfBirth: '',
        gender: '',
        height: '',
        weight: '',
      },
      doctorProfile: {
        specialization: '',
        licenseNumber: '',
        consultationFee: '',
      },
    },
  });

  const selectedRole = watch('role');

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      if (response.data?.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching admin users list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onSubmitCreate = async (data: any) => {
    setSaving(true);
    setErrorMsg(null);
    const loadToast = toast.loading('Registering new user account...');
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

      const response = await api.post('/admin/users', payload);
      if (response.data?.success) {
        toast.dismiss(loadToast);
        toast.success(`Account for ${data.name} created successfully.`);
        setShowAddForm(false);
        reset();
        fetchUsers();
      }
    } catch (error: any) {
      toast.dismiss(loadToast);
      const msg = error.response?.data?.message || 'Failed to create user account.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowAddForm(false);
    setErrorMsg(null);

    // Load user values into form
    reset({
      name: user.name,
      email: user.email,
      password: '', // leave empty unless resetting
      role: user.role,
      patientProfile: {
        bloodType: user.patientProfile?.bloodType || '',
        dateOfBirth: user.patientProfile?.dateOfBirth || '',
        gender: user.patientProfile?.gender || '',
        height: user.patientProfile?.height ? String(user.patientProfile.height) : '',
        weight: user.patientProfile?.weight ? String(user.patientProfile.weight) : '',
      },
      doctorProfile: {
        specialization: user.doctorProfile?.specialization || '',
        licenseNumber: user.doctorProfile?.licenseNumber || '',
        consultationFee: user.doctorProfile?.consultationFee ? String(user.doctorProfile.consultationFee) : '',
      },
    });
  };

  const onSubmitUpdate = async (data: any) => {
    if (!editingUser) return;
    setSaving(true);
    setErrorMsg(null);
    const loadToast = toast.loading('Saving account updates...');
    try {
      const payload: any = {
        name: data.name,
        email: data.email,
        role: data.role,
      };

      if (data.password) {
        payload.password = data.password;
      }

      if (data.role === 'PATIENT') {
        payload.patientProfile = data.patientProfile;
      } else if (data.role === 'DOCTOR') {
        payload.doctorProfile = {
          ...data.doctorProfile,
          consultationFee: data.doctorProfile.consultationFee ? parseFloat(data.doctorProfile.consultationFee) : null,
        };
      }

      const response = await api.put(`/admin/users/${editingUser.id}`, payload);
      if (response.data?.success) {
        toast.dismiss(loadToast);
        toast.success(`Account for ${data.name} updated successfully.`);
        setEditingUser(null);
        reset();
        fetchUsers();
      }
    } catch (error: any) {
      toast.dismiss(loadToast);
      const msg = error.response?.data?.message || 'Failed to update user account.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete user account: ${name}? All vital records, appointments, and recommendations will be purged.`
      )
    )
      return;
    const loadToast = toast.loading('Deleting user account...');
    try {
      await api.delete(`/admin/users/${id}`);
      toast.dismiss(loadToast);
      toast.success('Account deleted successfully.');
      setUsers(users.filter((u) => u.id !== id));
    } catch (error: any) {
      toast.dismiss(loadToast);
      toast.error(error.response?.data?.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 selection:bg-brandBlue/35 selection:text-white transition-colors duration-200">
      {/* Left Column: Create or Edit user form */}
      <section className="lg:col-span-1 space-y-4">
        {(showAddForm || editingUser) ? (
          <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder shadow-xl rounded-2xl p-6 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brandBlue/5 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                {editingUser ? `Edit Account: ${editingUser.name}` : 'Create New Account'}
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-textSecondary font-semibold mt-0.5">
                {editingUser ? 'Submit modified fields. Leave password blank to keep current.' : 'Register any patient, doctor, or administrator.'}
              </p>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 p-3 rounded-xl text-xs font-semibold">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(editingUser ? onSubmitUpdate : onSubmitCreate)} className="space-y-4 relative z-10">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  {...register('name', { required: 'Name is required' })}
                  className={`w-full px-3.5 py-2.5 bg-white dark:bg-[#222222] border rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-600 dark:focus:ring-brandBlue ${
                    errors.name ? 'border-red-500/40' : 'border-gray-300 dark:border-white/10'
                  }`}
                />
                {errors.name && <span className="text-[9px] text-red-500 dark:text-red-400 font-bold block mt-1">{errors.name.message}</span>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. sarah@pulsecare.com"
                  {...register('email', { required: 'Email is required' })}
                  className={`w-full px-3.5 py-2.5 bg-white dark:bg-[#222222] border rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-600 dark:focus:ring-brandBlue ${
                    errors.email ? 'border-red-500/40' : 'border-gray-300 dark:border-white/10'
                  }`}
                />
                {errors.email && <span className="text-[9px] text-red-550 dark:text-red-400 font-bold block mt-1">{errors.email.message}</span>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider mb-1">
                  Password {editingUser && '(Optional)'}
                </label>
                <input
                  type="password"
                  placeholder={editingUser ? '•••••••• (unchanged)' : '••••••••'}
                  {...register('password', { required: editingUser ? false : 'Password is required' })}
                  className={`w-full px-3.5 py-2.5 bg-white dark:bg-[#222222] border rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-600 dark:focus:ring-brandBlue ${
                    errors.password ? 'border-red-550/40' : 'border-gray-300 dark:border-white/10'
                  }`}
                />
                {errors.password && <span className="text-[9px] text-red-550 dark:text-red-400 font-bold block mt-1">{errors.password.message}</span>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider mb-1">Account Role</label>
                <select
                  {...register('role')}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-xl text-xs text-gray-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-650 dark:focus:ring-brandBlue cursor-pointer"
                >
                  <option value="PATIENT" className="text-gray-900 dark:text-white bg-white dark:bg-zinc-800">Patient</option>
                  <option value="DOCTOR" className="text-gray-900 dark:text-white bg-white dark:bg-zinc-800">Doctor</option>
                  <option value="ADMIN" className="text-gray-900 dark:text-white bg-white dark:bg-zinc-800">Admin</option>
                </select>
              </div>

              {/* Patient Fields */}
              {selectedRole === 'PATIENT' && (
                <div className="pt-4 border-t border-gray-200 dark:border-darkBorder space-y-4">
                  <p className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">Patient Biometrics</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 dark:text-textSecondary uppercase mb-1">Blood Type</label>
                      <select
                        {...register('patientProfile.bloodType')}
                        className="w-full px-3 py-1.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-lg text-[11px] text-gray-900 dark:text-white cursor-pointer"
                      >
                        <option value="" className="text-gray-900 dark:text-white bg-white dark:bg-zinc-800">Choose</option>
                        <option value="A+" className="text-gray-900 dark:text-white bg-white dark:bg-zinc-800">A+</option>
                        <option value="A-" className="text-gray-900 dark:text-white bg-white dark:bg-zinc-800">A-</option>
                        <option value="B+" className="text-gray-900 dark:text-white bg-white dark:bg-zinc-800">B+</option>
                        <option value="B-" className="text-gray-900 dark:text-white bg-white dark:bg-zinc-800">B-</option>
                        <option value="AB+" className="text-gray-900 dark:text-white bg-white dark:bg-zinc-800">AB+</option>
                        <option value="AB-" className="text-gray-900 dark:text-white bg-white dark:bg-zinc-800">AB-</option>
                        <option value="O+" className="text-gray-900 dark:text-white bg-white dark:bg-zinc-800">O+</option>
                        <option value="O-" className="text-gray-900 dark:text-white bg-white dark:bg-zinc-800">O-</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 dark:text-textSecondary uppercase mb-1">Gender</label>
                      <select
                        {...register('patientProfile.gender')}
                        className="w-full px-3 py-1.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-lg text-[11px] text-gray-900 dark:text-white cursor-pointer"
                      >
                        <option value="" className="text-gray-905 dark:text-white bg-white dark:bg-zinc-800">Choose</option>
                        <option value="MALE" className="text-gray-905 dark:text-white bg-white dark:bg-zinc-800">Male</option>
                        <option value="FEMALE" className="text-gray-905 dark:text-white bg-white dark:bg-zinc-800">Female</option>
                        <option value="OTHER" className="text-gray-905 dark:text-white bg-white dark:bg-zinc-800">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 dark:text-textSecondary uppercase mb-1">Date of Birth</label>
                    <input
                      type="date"
                      {...register('patientProfile.dateOfBirth')}
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-lg text-[11px] text-gray-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-650 dark:focus:ring-brandBlue"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 dark:text-textSecondary uppercase mb-1">Height (cm)</label>
                      <input
                        type="number"
                        placeholder="Height"
                        {...register('patientProfile.height')}
                        className="w-full px-3 py-1.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-lg text-[11px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-650 dark:focus:ring-brandBlue"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 dark:text-textSecondary uppercase mb-1">Weight (kg)</label>
                      <input
                        type="number"
                        placeholder="Weight"
                        {...register('patientProfile.weight')}
                        className="w-full px-3 py-1.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-lg text-[11px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-650 dark:focus:ring-brandBlue"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Doctor Fields */}
              {selectedRole === 'DOCTOR' && (
                <div className="pt-4 border-t border-gray-200 dark:border-darkBorder space-y-4">
                  <p className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">Doctor Credentials</p>
                  
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 dark:text-textSecondary uppercase mb-1">Specialization *</label>
                    <input
                      type="text"
                      placeholder="e.g. Pediatrics"
                      {...register('doctorProfile.specialization', {
                        required: selectedRole === 'DOCTOR' ? 'Specialization is required' : false,
                      })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-lg text-[11px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-650 dark:focus:ring-brandBlue"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 dark:text-textSecondary uppercase mb-1">License ID *</label>
                    <input
                      type="text"
                      placeholder="e.g. LIC-882255"
                      {...register('doctorProfile.licenseNumber', {
                        required: selectedRole === 'DOCTOR' ? 'License is required' : false,
                      })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-lg text-[11px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-650 dark:focus:ring-brandBlue"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 dark:text-textSecondary uppercase mb-1">Consultation Fee ($)</label>
                    <input
                      type="number"
                      placeholder="Consult fee"
                      {...register('doctorProfile.consultationFee')}
                      className="w-full px-3 py-1.5 bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 rounded-lg text-[11px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-650 dark:focus:ring-brandBlue"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2.5 pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-brandBlue dark:hover:bg-brandBlue/90 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {saving && <Loader2 size={12} className="animate-spin" />}
                  <span>{editingUser ? 'Save Updates' : 'Create Account'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingUser(null);
                    setShowAddForm(false);
                    reset();
                  }}
                  className="px-4 py-2.5 bg-gray-50 border border-gray-250 hover:bg-gray-100 dark:bg-darkCard dark:border-darkBorder text-gray-700 dark:text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder shadow-xl rounded-2xl p-6 text-center text-gray-550 dark:text-textSecondary">
            <p className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider mb-2">Directory Control</p>
            <p className="text-xs text-gray-600 dark:text-textSecondary/70 mt-1 leading-relaxed font-semibold">
              Use the ledger action buttons on the right side to modify existing credentials or register a new system profile.
            </p>
            <button
              onClick={() => {
                reset();
                setShowAddForm(true);
              }}
              className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-brandBlue dark:hover:bg-brandBlue/90 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus size={13} />
              <span>Register New Profile</span>
            </button>
          </div>
        )}
      </section>

      {/* Right Column: User directory list */}
      <section className="lg:col-span-2 space-y-4">
        <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder shadow-xl rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-darkBorder flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Registered System Profiles</h2>
              <p className="text-[11px] text-gray-500 dark:text-textSecondary font-semibold mt-0.5">Audit credentials, license IDs, and clinical roles.</p>
            </div>
            <button
              onClick={() => {
                setLoading(true);
                fetchUsers();
              }}
              className="p-2 rounded-xl bg-white hover:bg-gray-50 dark:bg-darkSidebar border border-gray-200 dark:border-darkBorder hover:text-brandBlue transition cursor-pointer text-gray-600 dark:text-white"
            >
              <RefreshCw size={13} />
            </button>
          </div>

          {loading ? (
            <div className="p-16 text-center">
              <div className="w-8 h-8 border-3 border-brandBlue border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-gray-500 dark:text-textSecondary mt-3 font-semibold">Retrieving system ledger...</p>
            </div>
          ) : users.length > 0 ? (
            <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-darkSidebar/50 border-b border-gray-200 dark:border-darkBorder text-gray-550 dark:text-textSecondary uppercase text-[9px] font-bold tracking-wider sticky top-0 backdrop-blur-md">
                    <th className="px-6 py-3.5">User Identity</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Bio details / specialty</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 dark:divide-darkBorder text-gray-700 dark:text-textSecondary font-semibold">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-darkSidebar/10 transition duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-darkSidebar border border-gray-200 dark:border-darkBorder text-gray-900 dark:text-white font-extrabold flex items-center justify-center text-xs select-none">
                            {u.role === 'ADMIN' ? '⚙️' : u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-gray-950 dark:text-white font-bold">{u.name}</p>
                            <p className="text-[9px] text-gray-500 dark:text-textSecondary/75 mt-0.5">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/15'
                              : u.role === 'DOCTOR'
                              ? 'bg-emerald-500/10 text-successGreen border-emerald-500/15'
                              : 'bg-brandBlue/10 text-brandBlue border-brandBlue/15'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[11px] max-w-[200px] truncate">
                        {u.role === 'PATIENT' ? (
                          <span className="text-[10px] text-gray-600 dark:text-textSecondary bg-slate-50 dark:bg-darkSidebar border border-gray-200 dark:border-darkBorder px-2 py-0.5 rounded font-bold">
                            Blood: {u.patientProfile?.bloodType || 'N/A'} • DOB: {u.patientProfile?.dateOfBirth || 'N/A'}
                          </span>
                        ) : u.role === 'DOCTOR' ? (
                          <span className="text-[10px] text-brandBlue font-extrabold bg-brandBlue/5 border border-brandBlue/10 px-2 py-0.5 rounded">
                            {u.doctorProfile?.specialization} (Fee: ${u.doctorProfile?.consultationFee || 0})
                          </span>
                        ) : (
                          <span className="text-gray-500 dark:text-textSecondary/50 font-bold italic">System Ledger admin</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-1">
                        <button
                          onClick={() => handleEdit(u)}
                          className="text-brandBlue hover:bg-brandBlue/10 p-1.5 rounded-lg border border-transparent hover:border-brandBlue/25 transition cursor-pointer"
                          title="Modify details"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          className="text-red-650 dark:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg border border-transparent hover:border-red-500/25 transition cursor-pointer"
                          title="Delete profile"
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
              <p className="font-bold text-sm">No registered profiles in ledger database.</p>
              <p className="text-xs text-gray-400 dark:text-textSecondary/70 mt-1">Select "Register New Profile" to add entries.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminUsers;
