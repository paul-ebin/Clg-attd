import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

const ManageClasses = () => {
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const { register, handleSubmit, reset } = useForm();
  
  const fetchData = async () => {
    try {
      const [classRes, deptRes] = await Promise.all([
        api.get('/admin/classes'),
        api.get('/admin/departments')
      ]);
      setClasses(classRes.data);
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
      await api.post('/admin/classes', data);
      toast.success('Class created successfully!');
      reset();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create class');
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <header>
        <h1 className="text-3xl font-black text-white tracking-tighter mb-2">
          Academic <span className="gradient-text">Batches</span>
        </h1>
        <p className="text-slate-400 font-medium text-sm">Deploy and manage academic classes across departments.</p>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 border-white/5 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-[60px] -mr-20 -mt-20"></div>
        
        <h3 className="text-xl font-black text-white tracking-tight mb-8 flex items-center">
           <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center mr-3 text-indigo-400">
              <GraduationCap className="h-5 w-5" />
           </div>
           Add New Batch
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-8 sm:grid-cols-12 items-end relative z-10">
          <div className="sm:col-span-4">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Batch Identifier</label>
            <input 
              {...register('name', { required: true })} 
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
              placeholder="e.g., CS-BATCH-2024"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Section</label>
            <select 
              {...register('section', { required: true })}
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium appearance-none"
            >
              <option value="A" className="bg-navy-950 text-white">A</option>
              <option value="B" className="bg-navy-950 text-white">B</option>
              <option value="C" className="bg-navy-950 text-white">C</option>
              <option value="D" className="bg-navy-950 text-white">D</option>
            </select>
          </div>
          <div className="sm:col-span-3">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Parent Infrastructure</label>
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
          <div className="sm:col-span-3">
             <button type="submit" className="w-full px-8 py-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center h-14">
               Deploy Batch
             </button>
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
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Batch ID</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Class Name</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Section</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Department</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-transparent">
              {classes.map((cls) => (
                <tr key={cls.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-500">#{cls.id}</td>
                   <td className="px-8 py-5 whitespace-nowrap">
                     <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-indigo-500/20 text-primary-400 flex items-center justify-center font-black text-sm mr-4 border border-white/5 group-hover:scale-110 transition-transform">
                           {cls.name[0]}
                        </div>
                        <span className="text-sm font-bold text-white tracking-tight">{cls.name}</span>
                     </div>
                   </td>
                   <td className="px-8 py-5 whitespace-nowrap">
                     <span className="text-sm font-bold text-slate-400">
                       Section {cls.section || 'A'}
                     </span>
                   </td>
                   <td className="px-8 py-5 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 text-slate-400 border border-white/10">
                      {cls.Department?.name}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
              {classes.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                       <GraduationCap className="h-12 w-12 text-slate-700 mb-4" />
                       <p className="text-sm text-slate-500 font-bold uppercase tracking-widest leading-none">No Academic Batches Deployed</p>
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

export default ManageClasses;
