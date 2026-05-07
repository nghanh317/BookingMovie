import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Notification types: 'info', 'success', 'warning', 'error', 'movie'
const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: [], // Lịch sử thông báo
      toasts: [],        // Thông báo tức thời (hiện rồi biến mất)
      
      addNotification: (notification) => set((state) => ({
        notifications: [
          {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            date: new Date().toISOString(),
            read: false,
            ...notification,
          },
          ...state.notifications,
        ].slice(0, 50),
      })),

      // 🍞 Thêm Toast mới
      addToast: (message, type = 'success') => {
        const id = Date.now().toString();
        set((state) => ({
          toasts: [...state.toasts, { id, message, type }]
        }));
        // Tự động xóa sau 3 giây
        setTimeout(() => get().removeToast(id), 3000);
      },

      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id)
      })),

      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        )
      })),

      markAllAsRead: (isAdmin = false) => set((state) => ({
        notifications: state.notifications.map(n => 
          !!n.isAdmin === isAdmin ? { ...n, read: true } : n
        )
      })),

      getUnreadCount: (isAdmin = false) => get().notifications.filter(n => !n.read && !!n.isAdmin === isAdmin).length,
    }),
    {
      name: 'cinema-notifications',
    }
  )
);

export default useNotificationStore;
