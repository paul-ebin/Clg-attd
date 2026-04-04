import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Clock, Calendar, AlertCircle, TrendingUp, Bell, Loader2, Info, User, Layers, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const [data, setData] = useState({
    percentage: 100,
    totalDays: 0,
    presentDays: 0,
    unreadNotifications: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/student/dashboard');
        setData(res.data);
      } catch (error) {
        toast.error('Failed to load portal data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
        <div className="absolute inset-0 bg-primary-500/20 blur-xl animate-pulse"></div>
      </div>
    </div>
  );

  const percentage = data.percentage.toFixed(1);
  const isDanger = parseFloat(percentage) < 80;

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
            Scholar <span className="gradient-text">Studio</span>
          </h1>
          <p className="text-slate-400 font-medium text-sm">Monitor your academic presence and institutional updates.</p>
        </div>
        <Link 
          to="/student/history" 
          className="group relative px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all overflow-hidden flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Clock size={20} className="mr-3 text-primary-400" />
          <span className="text-white font-black tracking-tight">Full History Ledger</span>
        </Link>
      </header>

      <AnimatePresence>
        {isDanger && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white p-6 rounded-3xl shadow-2xl shadow-rose-600/20 flex items-center mb-0 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse"></div>
              <div className="bg-white/20 p-3 rounded-2xl mr-5 backdrop-blur-md border border-white/20 shadow-lg">
                <ShieldAlert className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 relative z-10">
                <p className="font-black text-xl tracking-tight leading-none mb-2 uppercase">Eligibility Alert</p>
                <p className="text-sm text-rose-50 font-medium opacity-90 leading-relaxed max-w-2xl">
                   Critical Warning: Your attendance yields <span className="font-black underline px-1">{percentage}%</span>. Sustaining at least <span className="font-bold">80%</span> is Mandatory for final certification eligibility.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard title="Overall Presence" value={`${percentage}%`} icon={TrendingUp} colorClass={isDanger ? 'text-rose-400' : 'text-emerald-400'} shadowColor={isDanger ? 'rose' : 'emerald'} delay={0.1} />
        <StatCard title="Session Days" value={data.totalDays} icon={Layers} colorClass="text-slate-200" shadowColor="slate" delay={0.2} />
        <StatCard title="Verified Presence" value={data.presentDays} icon={CheckCircle2} colorClass="text-primary-400" shadowColor="primary" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-10 border-white/5 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-[40px] -mr-16 -mt-16 group-hover:bg-primary-500/10 transition-colors"></div>
          
          <div className="flex items-center justify-between mb-10">
             <h3 className="text-2xl font-black text-white tracking-tighter">Engagement Velocity</h3>
             <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${isDanger ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                {isDanger ? 'Critical Risk' : 'Healthy Status'}
             </div>
          </div>
          
          <div className="space-y-10">
            <div className="flex justify-between items-end">
              <div>
                 <span className={`text-5xl font-black tracking-tighter ${isDanger ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {percentage}%
                 </span>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">Real-time attendance weight</p>
              </div>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">Threshold: 80%</span>
            </div>
            
            <div className="relative pt-2">
               <div className="absolute -top-1 left-[80%] -ml-0.5 w-[2px] h-10 bg-white/20 z-10">
                 <div className="absolute top-10 left-1/2 -translate-x-1/2 text-[8px] font-black text-slate-600 uppercase tracking-widest">Cap</div>
               </div>
               <div className="w-full bg-white/5 rounded-full h-8 overflow-hidden border border-white/10 p-1.5 relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(data.percentage, 100)}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className={`h-full rounded-full relative ${isDanger ? 'bg-gradient-to-r from-rose-600 to-pink-500 shadow-lg shadow-rose-500/20' : 'bg-gradient-to-r from-primary-600 to-emerald-500 shadow-lg shadow-emerald-500/20'}`} 
                  >
                     <div className="absolute inset-0 bg-white/20 opacity-20 animate-pulse"></div>
                  </motion.div>
               </div>
            </div>
            
            <div className="flex items-start space-x-4 p-5 bg-white/5 rounded-3xl border border-white/5 relative z-10 group/info">
               <div className="shrink-0 mt-1 p-2 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover/info:bg-indigo-500 group-hover/info:text-white transition-colors">
                  <Info size={18} />
               </div>
               <p className="text-xs text-slate-400 font-medium leading-relaxed">
                 Statistical metrics are aggregated from <span className="text-white font-bold">{data.totalDays} academic sessions</span> recorded within the current structural semester.
               </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-10 border-white/5 flex flex-col justify-center overflow-hidden relative group"
        >
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary-600/5 rounded-full blur-[80px] group-hover:bg-primary-600/10 transition-colors duration-700"></div>
          
          <div className="flex items-center space-x-6 mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-500 rounded-3xl flex items-center justify-center border border-amber-500/20 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
               <Bell size={40} className="animate-bounce" />
            </div>
            <div>
               <h3 className="text-2xl font-black text-white tracking-tighter mb-1">Alert Feed</h3>
               <p className="text-base text-slate-400 font-medium">
                 {data.unreadNotifications > 0 
                   ? `You have ${data.unreadNotifications} pending intelligence updates` 
                   : 'All administrative systems are synchronized'}
               </p>
            </div>
          </div>
          
          <Link to="/student/notifications" className="mt-auto relative z-10">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white hover:bg-slate-100 text-navy-950 p-6 rounded-3xl flex items-center justify-between font-black text-sm shadow-2xl transition-all"
            >
              <span className="uppercase tracking-[0.1em]">Access Communication Hub</span>
              <div className="w-8 h-8 rounded-full bg-navy-950 text-white flex items-center justify-center">
                 <ChevronRight size={20} />
              </div>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, colorClass, shadowColor, delay }) => {
  const shadows = {
    rose: 'shadow-rose-500/20',
    emerald: 'shadow-emerald-500/20',
    primary: 'shadow-primary-500/20',
    slate: 'shadow-slate-500/10'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`glass-card p-8 border-white/5 flex items-center group relative overflow-hidden h-full shadow-2xl ${shadows[shadowColor]}`}
    >
      <div className="p-4 rounded-2xl bg-white/5 text-slate-500 group-hover:bg-white/10 group-hover:text-primary-400 transition-all duration-300 border border-white/5">
        <Icon className="w-8 h-8" />
      </div>
      <div className="ml-6">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1.5">{title}</p>
        <p className={`text-4xl font-black tracking-tighter leading-none ${colorClass}`}>{value}</p>
      </div>
    </motion.div>
  );
};

export default StudentDashboard;
