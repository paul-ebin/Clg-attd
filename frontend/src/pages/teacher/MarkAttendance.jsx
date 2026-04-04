import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { 
  Users, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter, 
  Search, 
  GraduationCap, 
  UserCheck, 
  AlertCircle,
  Briefcase,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MarkAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const { register, watch } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      period: '1'
    }
  });
  
  const selectedClass = watch('class_id');
  const selectedDate = watch('date');
  const selectedPeriod = watch('period');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/teacher/classes');
        setClasses(res.data);
      } catch (error) {
        toast.error('Failed to load classes');
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    const fetchStudentsAndAttendance = async () => {
      if (!selectedClass || !selectedDate || !selectedPeriod) return;
      setLoading(true);
      try {
        const [stuRes, attRes] = await Promise.all([
          api.get(`/teacher/classes/${selectedClass}/students`),
          api.get(`/teacher/attendance?class_id=${selectedClass}&date=${selectedDate}&period=${selectedPeriod}`)
        ]);
        
        setStudents(stuRes.data);
        setAttendanceRecords(attRes.data);
      } catch (error) {
        toast.error('Failed to load roster data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentsAndAttendance();
  }, [selectedClass, selectedDate, selectedPeriod]);

  const markStudentAttendance = async (studentId, status) => {
    try {
      const res = await api.post('/teacher/attendance', {
        class_id: parseInt(selectedClass),
        date: selectedDate,
        period: parseInt(selectedPeriod),
        student_id: studentId,
        status
      });

      const newRecord = res.data.record;
      setAttendanceRecords(prev => {
        const filtered = prev.filter(r => r.student_id !== studentId);
        return [...filtered, newRecord];
      });

      toast.success(`Marked as ${status}`, {
        duration: 1500,
        className: 'glass text-[10px] font-black uppercase tracking-widest'
      });
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to mark attendance`);
    }
  };

  const getStatus = (studentId) => {
    const record = attendanceRecords.find(r => r.student_id === studentId);
    return record ? record.status : null;
  };

  return (
    <div className="space-y-10 pb-20">
      <header>
        <h1 className="text-3xl font-black text-white tracking-tighter mb-2">
          Attendance <span className="gradient-text">Log</span>
        </h1>
        <p className="text-slate-400 font-medium text-sm">Real-time presence tracking and engagement monitoring.</p>
      </header>

      <section className="glass-card p-8 border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/5 rounded-full blur-[60px] -mr-20 -mt-20"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
              <Filter size={12} className="mr-2" /> Select Target Batch
            </label>
            <select 
              {...register('class_id')}
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
            >
              <option value="" className="bg-navy-950 text-white">Specify Academic Batch...</option>
              {classes.map(c => (
                <option key={c.id} value={c.id} className="bg-navy-950 text-white">{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
              <Clock size={12} className="mr-2" /> Academic Period
            </label>
            <select 
              {...register('period')}
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium appearance-none"
            >
              {[1, 2, 3, 4, 5, 6, 7].map(p => (
                <option key={p} value={p} className="bg-navy-950 text-white">Period {p}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
              <Calendar size={12} className="mr-2" /> Chronology Date
            </label>
            <input 
              type="date"
              {...register('date')}
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium appearance-none"
              defaultValue={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </section>

      <AnimatePresence mode="wait">
        {selectedClass && selectedDate && selectedPeriod ? (
          <motion.div 
            key="roster"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card overflow-hidden border-white/5 relative"
          >
            {loading && (
               <div className="absolute inset-0 bg-navy-950/40 backdrop-blur-sm flex items-center justify-center z-20">
                  <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
               </div>
            )}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/5">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Scholar Intelligence</th>
                    <th className="px-8 py-5 text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-transparent">
                  {students.map((student) => {
                    const currentStatus = getStatus(student.id);
                    const attPerc = parseFloat(student.attendance_percentage || 0);
                    const isLow = attPerc < 80;

                    return (
                      <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg mr-4 border border-white/5 group-hover:scale-110 transition-transform ${
                               isLow ? 'bg-rose-500/10 text-rose-400' : 'bg-primary-500/10 text-primary-400'
                             }`}>
                                {student.User?.name?.[0].toUpperCase()}
                             </div>
                             <div>
                                <p className="text-sm font-bold text-white tracking-tight leading-none mb-1.5">{student.User?.name}</p>
                                <div className="flex items-center space-x-3">
                                   <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{student.reg_no}</span>
                                   <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                   <div className="flex items-center">
                                      <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden mr-2">
                                         <div 
                                           className={`h-full rounded-full ${isLow ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                                           style={{ width: `${Math.min(attPerc, 100)}%` }}
                                         ></div>
                                      </div>
                                      <span className={`text-[10px] font-black uppercase tracking-widest ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                                         {attPerc}%
                                      </span>
                                   </div>
                                </div>
                             </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex justify-center items-center space-x-3">
                            <AttendanceBtn 
                              active={currentStatus === 'PRESENT'}
                              onClick={() => markStudentAttendance(student.id, 'PRESENT')}
                              label="Present"
                              icon={<CheckCircle2 size={16} />}
                              color="emerald"
                            />
                            <AttendanceBtn 
                              active={currentStatus === 'ABSENT'}
                              onClick={() => markStudentAttendance(student.id, 'ABSENT')}
                              label="Absent"
                              icon={<XCircle size={16} />}
                              color="rose"
                            />
                            <AttendanceBtn 
                              active={currentStatus === 'ON_DUTY'}
                              onClick={() => markStudentAttendance(student.id, 'ON_DUTY')}
                              label="O-Duty"
                              icon={<Briefcase size={16} />}
                              color="amber"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {students.length === 0 && !loading && (
                    <tr>
                      <td colSpan="2" className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center">
                           <Users className="h-12 w-12 text-slate-700 mb-4" />
                           <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">No Active roster detected</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-20 text-center border-white/5 border-dashed border-2"
          >
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-600">
               <UserCheck size={32} />
            </div>
            <h3 className="text-lg font-black text-white/40 tracking-widest uppercase">Select Batch & Temporal Parameters</h3>
            <p className="text-slate-600 font-medium text-sm mt-2">Specify the academic identifiers above to initialize tracking.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AttendanceBtn = ({ active, onClick, label, icon, color }) => {
  const colorMap = {
    emerald: active ? 'bg-emerald-600 text-white shadow-emerald-500/20 shadow-lg' : 'bg-white/5 text-slate-500 hover:text-emerald-400',
    rose: active ? 'bg-rose-600 text-white shadow-rose-500/20 shadow-lg' : 'bg-white/5 text-slate-500 hover:text-rose-400',
    amber: active ? 'bg-amber-500 text-white shadow-amber-500/20 shadow-lg' : 'bg-white/5 text-slate-500 hover:text-amber-400',
  };

  return (
    <button 
      onClick={onClick}
      className={`group flex items-center px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${colorMap[color]}`}
    >
      <span className={`mr-2 transition-transform group-hover:scale-125 ${active ? 'scale-110' : ''}`}>
        {icon}
      </span>
      {label}
    </button>
  );
};

export default MarkAttendance;
