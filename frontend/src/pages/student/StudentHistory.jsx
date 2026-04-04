import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'sonner';
import { Calendar, BookOpen, Clock, ChevronRight, Activity, Filter, User } from 'lucide-react';
import { motion } from 'framer-motion';

const StudentHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/student/attendance');
        setHistory(res.data);
      } catch (error) {
        toast.error('Failed to load attendance history');
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="space-y-10 pb-20">
      <header>
        <h1 className="text-3xl font-black text-white tracking-tighter mb-2">
          Structural <span className="gradient-text">History</span>
        </h1>
        <p className="text-slate-400 font-medium text-sm">Review your chronological presence across academic sessions.</p>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden border-white/5"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5">
            <thead>
              <tr className="bg-white/5">
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Chronology</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Academic Session</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Period Details</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-transparent">
              {history.map((record) => (
                <tr key={record.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6 whitespace-nowrap">
                     <div className="flex items-center text-xs font-bold text-slate-400">
                        <Calendar size={14} className="mr-3 text-primary-500/50" />
                        {new Date(record.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                     </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center">
                       <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mr-4 text-indigo-400 group-hover:scale-110 transition-transform">
                          <BookOpen size={16} />
                       </div>
                       <span className="text-sm font-bold text-white tracking-tight">{record.Class?.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                     <div className="flex flex-col">
                        <div className="text-sm font-bold text-slate-200 flex items-center mb-1">
                           <Clock size={12} className="mr-1.5 text-primary-400" />
                           Period {record.period} <span className="text-slate-500 mx-2">•</span> <span className="text-[11px] font-medium text-slate-400">{new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {record.status === 'ABSENT' && (
                           <div className="text-[10px] font-bold text-rose-400/80 uppercase tracking-widest flex items-center">
                              <User size={10} className="mr-1" /> Marked by {record.Teacher?.User?.name || 'Unknown Faculty'}
                           </div>
                        )}
                        {record.status !== 'ABSENT' && (
                           <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                              <User size={10} className="mr-1" /> {record.Teacher?.User?.name || 'System'}
                           </div>
                        )}
                     </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-right">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      record.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      record.status === 'ABSENT' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                       <span className={`w-1.5 h-1.5 rounded-full mr-2 ${record.status === 'PRESENT' ? 'bg-emerald-400' : record.status === 'ABSENT' ? 'bg-rose-400' : 'bg-amber-400'}`}></span>
                       {record.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                       <Activity className="h-12 w-12 text-slate-700 mb-4" />
                       <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">No Historical footprint found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentHistory;
