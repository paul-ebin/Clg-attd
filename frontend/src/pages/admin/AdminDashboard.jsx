import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, BookOpen, Clock, Building2, GraduationCap, ChevronRight, LayoutDashboard, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    totalClasses: 0,
    totalDepartments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-white/10 border-t-primary-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
           <GraduationCap className="w-6 h-6 text-primary-500 animate-pulse" />
        </div>
      </div>
    </div>
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="relative">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
            System <span className="gradient-text">Overview</span>
          </h1>
          <p className="text-slate-400 font-medium">Precision management for your elite educational infrastructure.</p>
        </motion.div>
      </header>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard title="Active Students" value={stats.totalStudents} icon={GraduationCap} gradient="from-blue-500 to-indigo-600" />
        <StatCard title="Expert Faculty" value={stats.totalTeachers} icon={Users} gradient="from-emerald-500 to-teal-600" />
        <StatCard title="Academic Batches" value={stats.totalClasses} icon={LayoutDashboard} gradient="from-amber-400 to-orange-600" />
        <StatCard title="Campus Depts" value={stats.totalDepartments} icon={Building2} gradient="from-rose-500 to-pink-600" />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="glass-card p-10 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-primary-500/10 transition-colors duration-500"></div>
        
        <div className="flex items-center justify-between mb-10 relative z-10">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight mb-1">Administrative Hub</h3>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Rapid management utilities</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary-400">
             <LayoutDashboard size={24} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          <QuickActionLink 
            to="/admin/departments" 
            label="Infrastructure" 
            description="Architect and organize campus departments" 
            icon={Building2} 
            gradient="from-indigo-500/20 to-indigo-500/5"
            iconColor="text-indigo-400"
          />
          <QuickActionLink 
            to="/admin/teachers" 
            label="Faculty Wing" 
            description="Orchestrate and monitor teaching excellence" 
            icon={Users} 
            gradient="from-emerald-500/20 to-emerald-500/5"
            iconColor="text-emerald-400"
          />
          <QuickActionLink 
            to="/admin/reports" 
            label="Analytics" 
            description="Deep dive into attendance performance metrics" 
            icon={Clock} 
            gradient="from-amber-500/20 to-amber-500/5"
            iconColor="text-amber-400"
          />
        </div>
      </motion.div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, gradient }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0 }
    }}
    whileHover={{ y: -8, scale: 1.02 }}
    className="glass-card p-7 group cursor-pointer border-white/5 hover:border-white/20 transition-all duration-300"
  >
    <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-xl group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 flex items-center justify-center w-14 h-14 mb-6 ring-4 ring-white/5`}>
      <Icon className="w-7 h-7" />
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{title}</p>
      <div className="flex items-baseline space-x-2">
        <p className="text-4xl font-black text-white tracking-tighter">{value}</p>
        <p className="text-[10px] font-bold text-slate-400">Records</p>
      </div>
    </div>
  </motion.div>
);

const QuickActionLink = ({ to, label, description, icon: Icon, gradient, iconColor }) => (
  <Link to={to} className="block group/item">
    <motion.div
      whileHover={{ y: -4 }}
      className={`p-6 rounded-3xl border border-white/5 bg-gradient-to-br ${gradient} hover:border-white/20 transition-all duration-300 h-full backdrop-blur-md relative overflow-hidden`}
    >
      <div className="absolute top-0 right-0 p-3 opacity-20 group-hover/item:opacity-40 transition-opacity">
        <ChevronRight size={20} className="text-white" />
      </div>
      <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${iconColor} mb-5 group-hover/item:scale-110 transition-transform duration-500`}>
        <Icon size={24} />
      </div>
      <div>
        <h4 className="font-black text-white text-lg mb-1 tracking-tight">{label}</h4>
        <p className="text-xs text-slate-400 font-medium leading-relaxed group-hover/item:text-slate-300 transition-colors">{description}</p>
      </div>
    </motion.div>
  </Link>
);

export default AdminDashboard;
