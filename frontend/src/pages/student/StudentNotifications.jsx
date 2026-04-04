import { useState, useEffect } from 'react';
import api from '../../services/api';
import { AlertCircle, CheckCircle, Bell, Clock, Calendar, ShieldAlert, Info } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/student/notifications');
      setNotifications(res.data);
    } catch (error) {
      toast.error('Failed to load intelligence updates');
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/student/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      toast.error('Failed to update registry status');
    }
  };

  return (
    <div className="space-y-10 pb-20 max-w-5xl mx-auto">
      <header>
        <h1 className="text-3xl font-black text-white tracking-tighter mb-2 flex items-center">
          Intelligence <span className="gradient-text ml-2">Feed</span>
        </h1>
        <p className="text-slate-400 font-medium text-sm">Critical structural updates and institutional alerts.</p>
      </header>

      <div className="space-y-6">
        {notifications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 glass-card border-white/5 border-dashed border-2"
          >
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-600">
               <Bell size={32} />
            </div>
            <h3 className="text-lg font-black text-white/40 tracking-widest uppercase">Registry Synchronized</h3>
            <p className="text-slate-600 font-medium text-sm mt-2">All active communication channels are currently clear.</p>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            <AnimatePresence>
              {notifications.map((notif, index) => (
                <motion.div 
                  key={notif.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`glass-card p-6 border-white/5 relative overflow-hidden group transition-all duration-300 ${
                    !notif.is_read ? 'bg-rose-500/5 ring-1 ring-rose-500/20 border-rose-500/10' : 'opacity-60 bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-start flex-1">
                      <div className={`mt-0.5 p-3 rounded-2xl shrink-0 ${
                        !notif.is_read ? 'bg-rose-500/20 text-rose-400' : 'bg-white/5 text-slate-500'
                      }`}>
                        {!notif.is_read ? <ShieldAlert size={24} /> : <CheckCircle size={24} />}
                      </div>
                      <div className="ml-5 pr-10">
                        <div className="flex items-center space-x-3 mb-2">
                           <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded ${
                             !notif.is_read ? 'bg-rose-500 text-white' : 'bg-white/10 text-slate-500'
                           }`}>
                             {notif.is_read ? 'Verified' : 'Unread'}
                           </span>
                           <span className="text-[10px] text-slate-500 font-bold tracking-widest flex items-center">
                             <Clock size={12} className="mr-1.5" />
                             {new Date(notif.created_at).toLocaleString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                           </span>
                        </div>
                        <p className={`text-base leading-relaxed tracking-tight ${!notif.is_read ? 'text-white font-bold' : 'text-slate-400 font-medium'}`}>
                          {notif.message}
                        </p>
                      </div>
                    </div>
                    
                    {!notif.is_read && (
                      <button 
                        onClick={() => markAsRead(notif.id)}
                        className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-rose-600/20 transition-all active:scale-95"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                  
                  {/* Subtle accent line for unread */}
                  {!notif.is_read && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentNotifications;
