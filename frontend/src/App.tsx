import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientMetrics from './pages/patient/PatientMetrics';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientRecommendations from './pages/patient/PatientRecommendations';
import PatientProfile from './pages/patient/PatientProfile';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorRecommendations from './pages/doctor/DoctorRecommendations';
import DoctorProfile from './pages/doctor/DoctorProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAppointments from './pages/admin/AdminAppointments';

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}

function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkBg text-gray-900 dark:text-textPrimary flex flex-col selection:bg-brandBlue/35 selection:text-white">
      {/* Landing Header */}
      <header className="bg-white/80 dark:bg-darkSidebar/70 backdrop-blur-md border-b border-gray-200 dark:border-darkBorder py-4 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-brandBlue flex items-center justify-center text-white text-sm font-extrabold shadow-md shadow-brandBlue/20">
              ➕
            </span>
            PulseCare
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link to="/" className="text-gray-600 hover:text-gray-900 dark:text-textSecondary dark:hover:text-white font-semibold transition">Home</Link>
            {user ? (
              <Link
                to={user.role === 'ADMIN' ? '/admin' : user.role === 'DOCTOR' ? '/doctor' : '/patient'}
                className="px-4 py-2 bg-brandBlue hover:bg-brandBlue/90 text-white rounded-xl font-bold transition shadow-md shadow-brandBlue/10 hover:scale-[1.02] active:scale-[0.98]"
              >
                Go to Workspace &rarr;
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900 dark:text-textSecondary dark:hover:text-white font-semibold transition">Login</Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-brandBlue hover:bg-brandBlue/90 text-white rounded-xl font-bold transition shadow-md shadow-brandBlue/10 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Create Account
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="relative py-20 px-6 md:py-32 overflow-hidden bg-slate-50 dark:bg-darkBg">
          {/* Neon background blur nodes */}
          <div className="absolute top-10 right-10 w-96 h-96 bg-brandBlue/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px]"></div>

          <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
            <span className="inline-block px-3 py-1 bg-brandBlue/10 text-brandBlue border border-brandBlue/20 rounded-full text-xs font-bold uppercase tracking-wider">
              🏥 Enterprise Clinical Workspace
            </span>
            <h1 className="text-4xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-none">
              Your Complete Health & <br className="hidden md:inline" />
              <span className="bg-gradient-to-r from-brandBlue via-brandBlue to-emerald-450 bg-clip-text text-transparent">
                Wellness Platform
              </span>
            </h1>
            <p className="text-sm md:text-lg text-gray-600 dark:text-textSecondary max-w-2xl mx-auto font-medium leading-relaxed">
              PulseCare bridges patient self-monitoring with clinician advice. Log daily vitals, book online medical sessions, and receive treatment plans instantly.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-6">
              {user ? (
                <Link
                  to={user.role === 'ADMIN' ? '/admin' : user.role === 'DOCTOR' ? '/doctor' : '/patient'}
                  className="px-7 py-3 bg-brandBlue hover:bg-brandBlue/90 text-white font-bold rounded-xl shadow-lg shadow-brandBlue/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  Enter Workspace
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-7 py-3 bg-brandBlue hover:bg-brandBlue/90 text-white font-bold rounded-xl shadow-lg shadow-brandBlue/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Access Portal
                  </Link>
                  <Link
                    to="/register"
                    className="px-7 py-3 bg-white dark:bg-darkCard border border-gray-300 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkCard/80 text-gray-900 dark:text-white font-bold rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Join as Doctor or Patient
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="py-24 bg-gray-100/50 dark:bg-darkSidebar/30 px-6 border-t border-gray-200 dark:border-darkBorder">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                Architected for Patients, Clinicians, & Systems
              </h2>
              <p className="text-sm text-gray-600 dark:text-textSecondary font-semibold">
                PulseCare supports dedicated workspaces tailored to each platform role.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white dark:bg-darkCard p-8 rounded-2xl border border-gray-200 dark:border-darkBorder shadow-sm space-y-4 hover:border-brandBlue/30 transition duration-300">
                <div className="w-12 h-12 bg-brandBlue/10 text-brandBlue rounded-xl flex items-center justify-center text-xl font-bold">
                  📈
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Patient Vitals Logging</h3>
                <p className="text-xs text-gray-600 dark:text-textSecondary leading-relaxed font-medium">
                  Log heart rates, blood pressure reading, sugars, step counts, and sleep logs. Watch your progress over time in history metrics tables.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white dark:bg-darkCard p-8 rounded-2xl border border-gray-200 dark:border-darkBorder shadow-sm space-y-4 hover:border-brandBlue/30 transition duration-300">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-450 rounded-xl flex items-center justify-center text-xl font-bold">
                  🩺
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Doctor Evaluations</h3>
                <p className="text-xs text-gray-600 dark:text-textSecondary leading-relaxed font-medium">
                  Clinicians can view detailed patient biometrics logs, review symptoms, approve upcoming online sessions, and submit dietary/prescription plans.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white dark:bg-darkCard p-8 rounded-2xl border border-gray-200 dark:border-darkBorder shadow-sm space-y-4 hover:border-brandBlue/30 transition duration-300">
                <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center text-xl font-bold">
                  ⚙️
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Platform Management</h3>
                <p className="text-xs text-gray-600 dark:text-textSecondary leading-relaxed font-medium">
                  Administrator suite allows managing registered users database, adding doctor specialties, and monitoring master care appointments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-darkSidebar/50 border-t border-gray-200 dark:border-darkBorder py-8 text-center text-xs text-gray-500 dark:text-textSecondary font-bold">
        <div className="max-w-7xl mx-auto px-6">
          © {new Date().getFullYear()} PulseCare Personalized Healthcare Platform. Engineered using React, SQLite & Prisma.
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1A1A',
            color: '#FFFFFF',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: '13px',
            fontWeight: '600',
            borderRadius: '12px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#4ADE80',
              secondary: '#1A1A1A',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#1A1A1A',
            },
          },
        }}
      />
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />

            {/* Patient Routes */}
            <Route
              path="/patient"
              element={
                <ProtectedRoute allowedRoles={['PATIENT']}>
                  <DashboardLayout>
                    <PageWrapper><PatientDashboard /></PageWrapper>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/metrics"
              element={
                <ProtectedRoute allowedRoles={['PATIENT']}>
                  <DashboardLayout>
                    <PageWrapper><PatientMetrics /></PageWrapper>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/appointments"
              element={
                <ProtectedRoute allowedRoles={['PATIENT']}>
                  <DashboardLayout>
                    <PageWrapper><PatientAppointments /></PageWrapper>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/recommendations"
              element={
                <ProtectedRoute allowedRoles={['PATIENT']}>
                  <DashboardLayout>
                    <PageWrapper><PatientRecommendations /></PageWrapper>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/profile"
              element={
                <ProtectedRoute allowedRoles={['PATIENT']}>
                  <DashboardLayout>
                    <PageWrapper><PatientProfile /></PageWrapper>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Doctor Routes */}
            <Route
              path="/doctor"
              element={
                <ProtectedRoute allowedRoles={['DOCTOR']}>
                  <DashboardLayout>
                    <PageWrapper><DoctorDashboard /></PageWrapper>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/patients"
              element={
                <ProtectedRoute allowedRoles={['DOCTOR']}>
                  <DashboardLayout>
                    <PageWrapper><DoctorPatients /></PageWrapper>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/appointments"
              element={
                <ProtectedRoute allowedRoles={['DOCTOR']}>
                  <DashboardLayout>
                    <PageWrapper><DoctorAppointments /></PageWrapper>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/recommendations"
              element={
                <ProtectedRoute allowedRoles={['DOCTOR']}>
                  <DashboardLayout>
                    <PageWrapper><DoctorRecommendations /></PageWrapper>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/profile"
              element={
                <ProtectedRoute allowedRoles={['DOCTOR']}>
                  <DashboardLayout>
                    <PageWrapper><DoctorProfile /></PageWrapper>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DashboardLayout>
                    <PageWrapper><AdminDashboard /></PageWrapper>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DashboardLayout>
                    <PageWrapper><AdminUsers /></PageWrapper>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/appointments"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DashboardLayout>
                    <PageWrapper><AdminAppointments /></PageWrapper>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
