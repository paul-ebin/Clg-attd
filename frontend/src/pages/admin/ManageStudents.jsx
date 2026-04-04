import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { GraduationCap, Mail, Contact, Calendar, BookOpen, Layers, Edit3, XCircle, UserPlus, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();
  
  const fetchData = async () => {
    try {
      const [stuRes, clsRes, deptRes] = await Promise.all([
        api.get('/admin/students'),
        api.get('/admin/classes'),
        api.get('/admin/departments')
      ]);
      setStudents(stuRes.data);
      setClasses(clsRes.data);
      setDepartments(deptRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (editingStudent) {
        await api.put(`/admin/students/${editingStudent.id}`, data);
        toast.success('Student profile updated');
        setEditingStudent(null);
      } else {
        await api.post('/admin/students', data);
        toast.success('Student successfully enrolled');
      }
      reset();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Transaction failed');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setValue('name', student.User?.name);
    setValue('email', student.User?.email);
    setValue('reg_no', student.reg_no);
    setValue('dob', student.dob);
    setValue('department_id', student.department_id);
    setValue('class_id', student.class_id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-10 pb-20">
      <header>
        <h1 className="text-3xl font-black text-white tracking-tighter mb-2">
          Scholar <span className="gradient-text">Directory</span>
        </h1>
        <p className="text-slate-400 font-medium text-sm">Enroll and manage the academic profiles of your student body.</p>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 border-white/5 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
        
        <div className="flex items-center mb-10">
           <div className="w-12 h-12 rounded-2xl bg-primary-500/20 flex items-center justify-center mr-4 text-primary-400 border border-primary-500/20 shadow-lg">
              {editingStudent ? <Edit3 size={24} /> : <UserPlus size={24} />}
           </div>
           <div>
              <h3 className="text-xl font-black text-white tracking-tight">
                {editingStudent ? 'Modify Scholar Record' : 'Enroll New Scholar'}
              </h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                {editingStudent ? `Modifying: ${editingStudent.User?.name}` : 'Initialize a new student profile'}
              </p>
           </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Legal Full Name</label>
              <input 
                {...register('name', { required: true })} 
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                placeholder="e.g., Alexander Hamilton"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Institutional Email</label>
              <input 
                type="email"
                {...register('email', { required: true })} 
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                placeholder="a.hamilton@academy.edu"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Registration Identifier</label>
              <input 
                {...register('reg_no', { required: true })} 
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                placeholder="e.g., REG-2024-001"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Chronological DOB</label>
              <input 
                type="date"
                {...register('dob', { required: true })} 
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium appearance-none"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Allocated Department</label>
              <select 
                {...register('department_id', { required: true })}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium appearance-none"
              >
                <option value="" className="bg-navy-950 text-white">Select Infrastructure...</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id} className="bg-navy-950 text-white">{d.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Assigned Batch</label>
              <select 
                {...register('class_id', { required: true })}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium appearance-none"
              >
                <option value="" className="bg-navy-950 text-white">Select Batch...</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id} className="bg-navy-950 text-white">{c.name} - Sec {c.section}</option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-3 flex items-center justify-end space-x-4 mt-4">
               {editingStudent && (
                <button 
                  type="button" 
                  onClick={() => { setEditingStudent(null); reset(); }}
                  className="px-8 py-4 bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all font-bold flex items-center"
                >
                  <XCircle size={20} className="mr-2" />
                  Cancel Operation
                </button>
              )}
              <button type="submit" className="px-12 py-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center">
                {editingStudent ? 'Synchronize Record' : 'Enroll Scholar'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card overflow-hidden border-white/5"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5">
            <thead>
              <tr className="bg-white/5">
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Scholar Profile</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Registration</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Chronology</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Allocated Batch</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-transparent">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center">
                       <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-400 flex items-center justify-center font-black text-lg mr-4 border border-white/5 group-hover:scale-110 transition-transform">
                          {student.User?.name?.[0].toUpperCase()}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-white tracking-tight">{student.User?.name}</p>
                          <p className="text-[11px] text-slate-500 font-medium flex items-center mt-0.5">
                             <Mail size={12} className="mr-1.5" />
                             {student.User?.email}
                          </p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center text-xs font-bold text-slate-400">
                       <Contact size={14} className="mr-2 text-primary-500/50" />
                       {student.reg_no}
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-xs font-bold text-slate-500">
                    <div className="flex items-center">
                       <Calendar size={14} className="mr-2 text-primary-500/50" />
                       {student.dob}
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex flex-col">
                       <span className="text-xs font-black text-white tracking-tight leading-none mb-1.5">{student.Class ? `${student.Class.name} (Sec ${student.Class.section})` : 'None'}</span>
                       <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{student.Department?.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-right">
                    <button 
                      onClick={() => handleEdit(student)}
                      className="p-2 ml-auto rounded-xl bg-primary-500/10 text-primary-400 hover:bg-primary-500 hover:text-white transition-all shadow-lg shadow-primary-500/5"
                    >
                      <Edit3 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                       <GraduationCap className="h-12 w-12 text-slate-700 mb-4" />
                       <p className="text-sm text-slate-500 font-bold uppercase tracking-widest leading-none">No Scholars Enrolled</p>
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

export default ManageStudents;
