import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { FileText, Filter, Calendar, User, BookOpen, ChevronRight, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AttendanceReports = () => {
  const [reports, setReports] = useState([]);
  const [classes, setClasses] = useState([]);
  const { register, watch } = useForm();
  
  const selectedClass = watch('class_id');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/admin/classes');
        setClasses(res.data);
      } catch (error) {
        toast.error('Failed to load classes');
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        let url = '/admin/attendance-reports';
        if (selectedClass) {
          url += `?class_id=${selectedClass}`;
        }
        const res = await api.get(url);
        setReports(res.data);
      } catch (error) {
        toast.error('Failed to load reports');
      }
    };
    fetchReports();
  }, [selectedClass]);

  return (
    <div className="space-y-10 pb-20">
      <header>
        <h1 className="text-3xl font-black text-white tracking-tighter mb-2">
          Attendance <span className="gradient-text">Intelligence</span>
        </h1>
        <p className="text-slate-400 font-medium text-sm">Comprehensive cross-institutional attendance analytics.</p>
      </header>

      <section className="glass-card p-6 border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-[40px] -mr-16 -mt-16"></div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
           <div className="flex items-center">
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center mr-4 text-primary-400 border border-white/5">
                 <FileText size={20} />
              </div>
              <div>
                 <h3 className="text-lg font-black text-white tracking-tight leading-none mb-1">Cumulative Reports</h3>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global institutional data</p>
              </div>
           </div>
           
           <div className="w-full md:w-72 relative group/select">
             <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/select:text-primary-400 transition-colors" />
             <select 
               {...register('class_id')}
               className="w-full pl-12 pr-6 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-bold text-sm appearance-none"
             >
               <option value="" className="bg-navy-950 text-white">All Academic Batches</option>
               {classes.map(c => (
                 <option key={c.id} value={c.id} className="bg-navy-950 text-white">{c.name}</option>
               ))}
             </select>
           </div>
        </div>
      </section>

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
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Scholar Identifier</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Academic Batch</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Registry Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-transparent">
              {reports.map((record) => (
                <tr key={record.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6 whitespace-nowrap">
                     <div className="flex items-center text-xs font-bold text-slate-400">
                        <Calendar size={14} className="mr-2 text-primary-500/50" />
                        {new Date(record.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                     </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center">
                       <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center mr-3 text-slate-500 font-bold text-xs group-hover:text-primary-400 transition-colors">
                          <User size={16} />
                       </div>
                       <span className="text-sm font-bold text-white tracking-tight">{record.Student?.User?.name || record.Student?.reg_no}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                       {record.Class?.name}
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-right">
                    <StatusBadge status={record.status} />
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                       <FileText className="h-12 w-12 text-slate-700 mb-4" />
                       <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">No Intelligence Records Found</p>
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

const StatusBadge = ({ status }) => {
  const configs = {
    PRESENT: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    ABSENT: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    ON_DUTY: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  };

  return (
    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${configs[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
       <span className={`w-1.5 h-1.5 rounded-full mr-2 ${status === 'PRESENT' ? 'bg-emerald-400' : status === 'ABSENT' ? 'bg-rose-400' : 'bg-amber-400'}`}></span>
       {status.replace('_', ' ')}
    </span>
  );
};

export default AttendanceReports;
