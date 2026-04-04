import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Users, BookOpen, Clock, AlertCircle, Menu, X, ChevronRight, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getLinks = () => {
    if (!user) return [];
    if (user.role === 'ADMIN') {
      return [
        { path: '/admin', label: 'Dashboard', icon: Home },
        { path: '/admin/departments', label: 'Departments', icon: BookOpen },
        { path: '/admin/classes', label: 'Classes', icon: BookOpen },
        { path: '/admin/teachers', label: 'Teachers', icon: Users },
        { path: '/admin/students', label: 'Students', icon: Users },
        { path: '/admin/reports', label: 'Reports', icon: Clock },
      ];
    }
    if (user.role === 'TEACHER') {
      return [
        { path: '/teacher', label: 'Classes', icon: Home },
        { path: '/teacher/attendance', label: 'Mark Attendance', icon: Clock },
      ];
    }
    if (user.role === 'STUDENT') {
      return [
        { path: '/student', label: 'Dashboard', icon: Home },
        { path: '/student/history', label: 'Attendance History', icon: Clock },
        { path: '/student/notifications', label: 'Notifications', icon: AlertCircle },
      ];
    }
    return [];
  };

  const links = getLinks();

  const SidebarContent = () => (
    <div className="flex flex-col h-full relative z-10">
      <div className="h-28 flex items-center px-10">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-600 shadow-2xl shadow-primary-500/30 group-hover:scale-110 transition-transform duration-500">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <span className="font-extrabold text-2xl text-white tracking-tighter">
            Attend<span className="gradient-text">Pro</span>
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
        <nav className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`group relative flex items-center px-5 py-4 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-white/10 text-white shadow-xl border border-white/10' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className={`mr-4 transition-colors duration-300 ${isActive ? 'text-primary-400' : 'group-hover:text-primary-400'}`}>
                   <Icon size={20} />
                </div>
                <span className="font-bold text-sm tracking-tight">{link.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute right-3 w-1.5 h-1.5 bg-primary-400 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.8)]"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-6 mt-auto">
        <div className="glass-card rounded-3xl p-5 border-white/5 mb-4 group cursor-pointer overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-black text-xl shadow-lg">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="ml-4 overflow-hidden">
              <p className="text-sm font-black text-white truncate">{user?.username}</p>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{user?.role}</p>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center w-full px-5 py-4 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all font-black text-sm group"
        >
          <LogOut className="w-5 h-5 mr-4 group-hover:rotate-12 transition-transform" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-navy-950">
      {/* Background Layer */}
      <div className="fixed inset-0 bg-hero-glow opacity-60 pointer-events-none"></div>
      <div className="fixed inset-0 bg-grid opacity-10 pointer-events-none"></div>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-80 glass border-r border-white/5 flex-col relative z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-80 glass border-r border-white/10 z-40 lg:hidden"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <header className="h-24 bg-transparent border-b border-white/5 flex items-center justify-between px-8 lg:px-12">
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-3 -ml-3 text-white bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all"
            >
              <Menu size={24} />
            </button>
            <div className="ml-4 flex items-center space-x-2">
               <GraduationCap className="h-6 w-6 text-primary-500" />
               <span className="font-extrabold text-xl text-white">AttendPro</span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center space-x-3 text-slate-500 text-xs font-black uppercase tracking-widest leading-none">
            <span className="hover:text-primary-400 transition-colors cursor-pointer">Platform</span>
            <ChevronRight size={14} className="text-slate-700" />
            <span className="text-white">{location.pathname.split('/').filter(Boolean).pop()?.replace('-', ' ') || 'Dashboard'}</span>
          </div>

          <div className="flex items-center space-x-5">
             <div className="hidden sm:flex -space-x-3">
               {[1,2,3].map(i => (
                 <div key={i} className={`w-9 h-9 rounded-full border-2 border-navy-950 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-xl`}>U{i}</div>
               ))}
             </div>
             <div className="relative group">
                <button className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all shadow-lg">
                   <AlertCircle size={22} />
                </button>
                <div className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full border-2 border-navy-950 -translate-y-1/3 translate-x-1/3"></div>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
