import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Activity,
  Calendar,
  ClipboardList,
  User,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Bell,
  Moon,
  Sun,
  Monitor,
  UserCheck,
  Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Successfully logged out.');
    navigate('/');
  };

  if (!user) return null;

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      toast.success('Switched to Dark Mode');
    } else if (theme === 'dark') {
      setTheme('system');
      toast.success('Switched to System Preference');
    } else {
      setTheme('light');
      toast.success('Switched to Light Mode');
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={15} className="text-amber-500" />;
      case 'dark':
        return <Moon size={15} className="text-brandBlue" />;
      case 'system':
        return <Monitor size={15} className="text-purple-400" />;
    }
  };

  const getSidebarLinks = () => {
    switch (user.role) {
      case 'PATIENT':
        return [
          { path: '/patient', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/patient/metrics', label: 'Vitals & Metrics', icon: Activity },
          { path: '/patient/appointments', label: 'Appointments', icon: Calendar },
          { path: '/patient/recommendations', label: 'Recommendations', icon: ClipboardList },
          { path: '/patient/profile', label: 'My Profile', icon: User },
        ];
      case 'DOCTOR':
        return [
          { path: '/doctor', label: 'Overview', icon: LayoutDashboard },
          { path: '/doctor/patients', label: 'Patient Logs', icon: Activity },
          { path: '/doctor/appointments', label: 'Appointments Care', icon: Calendar },
          { path: '/doctor/recommendations', label: 'Recommendations', icon: ClipboardList },
          { path: '/doctor/profile', label: 'Doctor Profile', icon: User },
        ];
      case 'ADMIN':
        return [
          { path: '/admin', label: 'Analytics', icon: LayoutDashboard },
          { path: '/admin/users', label: 'User Directory', icon: UserCheck },
          { path: '/admin/appointments', label: 'Appointments', icon: Calendar },
        ];
      default:
        return [];
    }
  };

  const links = getSidebarLinks();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkBg text-gray-900 dark:text-white flex flex-col md:flex-row font-sans overflow-x-hidden transition-colors duration-200">
      
      {/* Sidebar for Desktop */}
      <aside
        className={`hidden md:flex flex-col bg-white dark:bg-darkSidebar border-r border-gray-200 dark:border-darkBorder sticky top-0 h-screen transition-all duration-300 z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-200 dark:border-darkBorder">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-brandBlue flex items-center justify-center text-white text-sm font-extrabold shadow-lg shadow-brandBlue/20 shrink-0">
              ➕
            </div>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-extrabold text-sm tracking-tight text-gray-900 dark:text-white select-none whitespace-nowrap"
              >
                PulseCare
              </motion.span>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-darkCard text-gray-500 dark:text-textSecondary hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* User context info */}
        <div className={`p-4 border-b border-gray-200 dark:border-darkBorder flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-brandBlue/10 text-brandBlue border border-brandBlue/25 flex items-center justify-center font-bold text-sm select-none shrink-0">
            {user.role === 'ADMIN' ? <Shield size={18} /> : user.name.charAt(0).toUpperCase()}
          </div>
          {!isCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
              <h4 className="text-xs font-bold text-gray-950 dark:text-white truncate">{user.name}</h4>
              <span className="text-[9px] font-extrabold text-brandBlue bg-brandBlue/10 border border-brandBlue/10 px-2 py-0.5 rounded-full inline-block mt-1 uppercase tracking-wider">
                {user.role}
              </span>
            </motion.div>
          )}
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all group ${
                  isActive
                    ? 'text-brandBlue dark:text-white font-bold'
                    : 'text-gray-600 dark:text-textSecondary hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-brandBlue/5 dark:bg-brandBlue/10 border-l-2 border-brandBlue rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  size={16}
                  className={`relative z-10 transition-transform duration-200 group-hover:scale-105 ${
                    isActive ? 'text-brandBlue' : 'text-gray-500 dark:text-textSecondary group-hover:text-gray-900 dark:group-hover:text-white'
                  }`}
                />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative z-10 whitespace-nowrap"
                  >
                    {link.label}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Bottom */}
        <div className="p-3 border-t border-gray-200 dark:border-darkBorder">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3.5 py-3 text-gray-500 dark:text-textSecondary hover:text-red-500 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 rounded-xl text-xs font-bold transition duration-205 cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut size={16} className="shrink-0" />
            {!isCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="md:hidden bg-white dark:bg-darkSidebar h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-darkBorder z-40 sticky top-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brandBlue flex items-center justify-center text-white text-sm font-extrabold shadow-md">
            ➕
          </div>
          <span className="font-extrabold text-sm tracking-tight text-gray-900 dark:text-white select-none">PulseCare</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-1 rounded-lg hover:bg-gray-150 dark:hover:bg-darkCard text-gray-500 dark:text-textSecondary hover:text-gray-900 dark:hover:text-white transition focus:outline-none cursor-pointer"
          aria-label="Toggle mobile navigation menu"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Mobile Dropdown Nav Menu */}
      {isMobileOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white dark:bg-darkSidebar border-b border-gray-200 dark:border-darkBorder px-6 py-4 space-y-2.5 z-40 absolute top-16 left-0 right-0 shadow-lg"
        >
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive ? 'bg-brandBlue/10 text-brandBlue border-l-2 border-brandBlue' : 'text-gray-600 dark:text-textSecondary hover:bg-gray-100 dark:hover:bg-darkCard hover:text-gray-950 dark:hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => {
              setIsMobileOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/10 hover:bg-red-500/15 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold border border-red-500/20 mt-4 cursor-pointer"
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </motion.nav>
      )}

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        
        {/* Sticky Desktop Top Navbar */}
        <header className="hidden md:flex h-16 bg-white/80 dark:bg-darkSidebar/70 backdrop-blur-md items-center justify-between px-8 border-b border-gray-200 dark:border-darkBorder sticky top-0 z-20">
          <div>
            <h2 className="text-xs font-bold text-gray-500 dark:text-textSecondary uppercase tracking-wider">
              {user.role} workspace / <span className="text-gray-900 dark:text-white font-extrabold">{user.name}</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <div className="relative group">
              <button
                onClick={cycleTheme}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-darkCard dark:hover:bg-darkCard/80 border border-gray-200 dark:border-darkBorder text-gray-600 dark:text-textSecondary hover:text-gray-900 dark:hover:text-white transition hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
                aria-label={`Cycle theme, currently ${theme}`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={theme}
                    initial={{ y: -5, opacity: 0, rotate: -45 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 5, opacity: 0, rotate: 45 }}
                    transition={{ duration: 0.15 }}
                  >
                    {getThemeIcon()}
                  </motion.div>
                </AnimatePresence>
              </button>
              {/* Tooltip */}
              <div className="absolute right-0 top-11 scale-0 group-hover:scale-100 transition-all origin-top duration-150 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-bold py-1 px-2.5 rounded-lg whitespace-nowrap shadow-md pointer-events-none z-50">
                Theme: {theme.toUpperCase()} (click to cycle)
              </div>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => toast.success('You have no new alerts.')}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-darkCard dark:hover:bg-darkCard/80 border border-gray-200 dark:border-darkBorder text-gray-600 dark:text-textSecondary hover:text-gray-900 dark:hover:text-white transition relative hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="View notifications"
            >
              <Bell size={15} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brandBlue ring-2 ring-white dark:ring-darkSidebar animate-pulse" />
            </button>

            {/* Small status indicator */}
            <div className="text-[10px] font-extrabold px-3 py-1.5 bg-gray-100 dark:bg-darkCard text-emerald-600 dark:text-emerald-400 border border-gray-200 dark:border-darkBorder rounded-xl flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
              Live DB Online
            </div>
          </div>
        </header>

        {/* Dynamic page container */}
        <main className="flex-grow p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
