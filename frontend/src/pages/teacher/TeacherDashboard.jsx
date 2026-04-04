import { useState, useEffect } from 'react';
import api from '../../services/api';
import { BookOpen, Users, ChevronRight, Loader2, Sparkles, Clock, Calendar, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/teacher/classes');
        setClasses(res.data);
      } catch (error) {
        toast.error('Failed to load assigned classes');
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
        <div className="absolute inset-0 bg-primary-500/20 blur-xl animate-pulse"></div>
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
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
            Academic <span className="gradient-text">Command</span>
          </h1>
          <p className="text-slate-400 font-medium text-sm">Manage your curriculum and track student engagement in real-time.</p>
        </div>
        <Link 
          to="/teacher/attendance" 
          className="group relative px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all overflow-hidden flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Clock size={20} className="mr-3 text-primary-400" />
          <span className="text-white font-black tracking-tight">Rapid Attendance Mark</span>
        </Link>
      </header>

      <section>
        <div className="flex items-center space-x-3 mb-8">
           <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400 border border-primary-500/20 shadow-lg shadow-primary-500/5">
              <Layers size={20} />
           </div>
           <h2 className="text-2xl font-black text-white tracking-tight">Your Academic Batches</h2>
        </div>

        {classes.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-20 text-center border-white/5 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-20"></div>
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-600 border border-white/5">
               <BookOpen size={40} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No active batches assigned</h3>
            <p className="text-slate-500 font-medium max-w-md mx-auto">Please contact the administration if you believe this is an error in your curriculum assignment.</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {classes.map((cls) => (
              <ClassCard key={cls.id} cls={cls} />
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
};

const ClassCard = ({ cls }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0 }
    }}
    whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
    className="glass-card p-8 border-white/5 group relative overflow-hidden flex flex-col h-full"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-[50px] -mr-16 -mt-16 group-hover:bg-primary-500/10 transition-colors"></div>
    
    <div className="flex items-start justify-between mb-8">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-white/5 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-xl">
        <BookOpen size={28} />
      </div>
      <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
        Batch #{cls.id}
      </div>
    </div>
    
    <div className="mb-10 flex-1">
      <h3 className="text-2xl font-black text-white tracking-tighter mb-3 group-hover:text-primary-400 transition-colors duration-300 leading-tight">
        {cls.name}
      </h3>
      <div className="flex items-center text-slate-400 text-sm font-bold tracking-tight">
        <Users size={16} className="mr-2 text-primary-500" />
        <span>Manage Roster & Attendance</span>
      </div>
    </div>

    <div className="pt-8 border-t border-white/5">
      <Link 
        to="/teacher/attendance" 
        className="group/btn relative w-full h-14 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center overflow-hidden"
      >
        <span className="relative z-10 flex items-center">
          Mark Attendance
          <ChevronRight size={20} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </span>
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
      </Link>
    </div>
  </motion.div>
);

const Layers = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

export default TeacherDashboard;
