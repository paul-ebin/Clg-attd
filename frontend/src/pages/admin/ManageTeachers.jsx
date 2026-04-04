import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Users, Mail, UserCheck, ShieldCheck, Building2, Edit3, XCircle, Search, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();
  
  const fetchData = async () => {
    try {
      const [teacherRes, deptRes, classRes] = await Promise.all([
        api.get('/admin/teachers'),
        api.get('/admin/departments'),
        api.get('/admin/classes')
      ]);
      setTeachers(teacherRes.data);
      setDepartments(deptRes.data);
      setClasses(classRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (editingTeacher) {
        await api.put(`/admin/teachers/${editingTeacher.id}`, data);
        toast.success('Teacher profile updated');
        setEditingTeacher(null);
      } else {
        await api.post('/admin/teachers', data);
        toast.success('New faculty member added');
      }
      reset();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Transaction failed');
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setValue('name', teacher.User?.name);
    setValue('email', teacher.User?.email);
    setValue('username', teacher.User?.username);
    setValue('department_id', teacher.department_id);
    setValue('class_id', teacher.class_id || '');
    setValue('password', ''); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-10 pb-20">
      <header>
        <h1 className="text-3xl font-black text-white tracking-tighter mb-2">
          Faculty <span className="gradient-text">Wing</span>
        </h1>
        <p className="text-slate-400 font-medium text-sm">Orchestrate your institution's teaching excellence.</p>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 border-white/5 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
        
        <div className="flex items-center mb-10">
           <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center mr-4 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
              {editingTeacher ? <Edit3 size={24} /> : <UserPlus size={24} />}
           </div>
           <div>
              <h3 className="text-xl font-black text-white tracking-tight">
                {editingTeacher ? 'Modify Faculty Profile' : 'Enlist New Faculty'}
              </h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                {editingTeacher ? `Modifying: ${editingTeacher.User?.name}` : 'Create a new teacher account'}
              </p>
           </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group/input">
                <input 
                  {...register('name', { required: true })} 
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                  placeholder="e.g., Prof. Sarah Jenkins"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Corporate Email</label>
              <input 
                type="email"
                {...register('email', { required: true })} 
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                placeholder="s.jenkins@academy.edu"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Access Username</label>
              <input 
                {...register('username', { required: true })} 
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                placeholder="sarah_j"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                Security Passkey {editingTeacher && <span className="text-[10px] text-slate-600">(Optional)</span>}
              </label>
              <input 
                type="password" 
                {...register('password', { required: !editingTeacher })} 
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Assigned Department</label>
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
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Assigned Class (In-charge)</label>
              <select 
                {...register('class_id')}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium appearance-none"
              >
                <option value="" className="bg-navy-950 text-white">No Class Assigned...</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id} className="bg-navy-950 text-white">{c.name} - Section {c.section}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end space-x-3 lg:col-span-3">
              <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center h-14">
                {editingTeacher ? 'Deploy Changes' : 'Initialize Account'}
              </button>
              {editingTeacher && (
                <button 
                  type="button" 
                  onClick={() => { setEditingTeacher(null); reset(); }}
                  className="px-6 h-14 bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all flex items-center justify-center aspect-square"
                >
                  <XCircle size={24} />
                </button>
              )}
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
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Profile Info</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Username</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Security Key</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Infrastructure</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Class In-charge</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-transparent">
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center">
                       <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-400 flex items-center justify-center font-black text-lg mr-4 border border-white/5 group-hover:scale-110 transition-transform">
                          {teacher.User?.name?.[0].toUpperCase()}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-white tracking-tight">{teacher.User?.name}</p>
                          <p className="text-[11px] text-slate-500 font-medium flex items-center mt-0.5">
                             <Mail size={12} className="mr-1.5" />
                             {teacher.User?.email}
                          </p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className="px-3 py-1.5 rounded-xl bg-white/5 text-slate-300 text-xs font-bold border border-white/5">
                       {teacher.User?.username}
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className="font-mono text-xs text-slate-500 tracking-widest bg-slate-900/50 px-2 py-1 rounded">
                       {teacher.User?.plain_password}
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center text-xs font-bold text-slate-400">
                       <Building2 size={14} className="mr-2 text-indigo-500/50" />
                       {teacher.Department?.name}
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 text-slate-400 border border-white/10">
                      {teacher.Class ? `${teacher.Class.name} (Sec ${teacher.Class.section})` : 'Unassigned'}
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-right">
                    <button 
                      onClick={() => handleEdit(teacher)}
                      className="p-2 ml-auto rounded-xl bg-primary-500/10 text-primary-400 hover:bg-primary-500 hover:text-white transition-all shadow-lg shadow-primary-500/5"
                    >
                      <Edit3 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                       <Users className="h-12 w-12 text-slate-700 mb-4" />
                       <p className="text-sm text-slate-500 font-bold uppercase tracking-widest leading-none">No Educators Registered</p>
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

export default ManageTeachers;
