import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const { register, handleSubmit, reset } = useForm();
  
  const fetchDepartments = async () => {
    try {
      const res = await api.get('/admin/departments');
      setDepartments(res.data);
    } catch (error) {
      toast.error('Failed to load departments');
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const onSubmit = async (data) => {
    try {
      await api.post('/admin/departments', data);
      toast.success('Department created successfully!');
      reset();
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create department');
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <header>
        <h1 className="text-3xl font-black text-white tracking-tighter mb-2">
          Campus <span className="gradient-text">Infrastructure</span>
        </h1>
        <p className="text-slate-400 font-medium text-sm">Organize and manage institutional departments with ease.</p>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 border-white/5 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/5 rounded-full blur-[60px] -mr-20 -mt-20"></div>
        
        <h3 className="text-xl font-black text-white tracking-tight mb-6 flex items-center">
           <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center mr-3 text-primary-400">
              <Building2 className="h-5 w-5" />
           </div>
           Add New Department
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-6 items-end relative z-10">
          <div className="flex-1 w-full">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Department Nomenclature</label>
            <input 
              {...register('name', { required: true })} 
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
              placeholder="e.g., Department of Neuro-Linguistics"
            />
          </div>
          <button type="submit" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center">
            Deploy Department
          </button>
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
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Serial ID</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Department Name</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-transparent">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-500">#{dept.id}</td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                       <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-400 flex items-center justify-center font-black text-sm mr-4 border border-white/5 group-hover:scale-110 transition-transform">
                          {dept.name[0]}
                       </div>
                       <span className="text-sm font-bold text-white tracking-tight">{dept.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
              {departments.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                       <Building2 className="h-12 w-12 text-slate-700 mb-4" />
                       <p className="text-sm text-slate-500 font-bold uppercase tracking-widest leading-none">No Departments Architected</p>
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

export default ManageDepartments;
