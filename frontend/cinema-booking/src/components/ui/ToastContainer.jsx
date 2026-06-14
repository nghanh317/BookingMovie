import { motion, AnimatePresence } from 'framer-motion';
import useNotificationStore from '../../store/notificationStore';

export default function ToastContainer() {
  const { toasts, removeToast } = useNotificationStore();

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto"
          >
            <div className={`
              min-w-[300px] px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md
              ${toast.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-400' : 
                toast.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-400' : 
                'bg-blue-500/20 border-blue-500/30 text-blue-400'}
            `}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                toast.type === 'success' ? 'bg-green-500 text-white' : 
                toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
              }`}>
                {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white mb-0.5">
                  {toast.type === 'success' ? 'Thành công' : toast.type === 'error' ? 'Thất bại' : 'Thông báo'}
                </p>
                <p className="text-xs opacity-90">{toast.message}</p>
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                className="text-white/40 hover:text-white transition-colors p-1"
              >
                ✕
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
