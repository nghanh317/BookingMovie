import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Notification types: 'info', 'success', 'warning', 'error', 'movie'
const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: [
        {
          id: '1',
          type: 'movie',
          title: 'Phim mới ra rạp',
          message: 'Lật Mặt 7: Một Điều Ước đã chính thức khởi chiếu. Đặt vé ngay!',
          date: new Date().toISOString(),
          read: false,
        },
        {
          id: '2',
          type: 'success',
          title: 'Đặt vé thành công',
          message: 'Bạn đã đặt thành công 2 vé phim Avengers: Secret Wars.',
          date: new Date(Date.now() - 86400000).toISOString(),
          read: true,
        }
      ],
      toasts: [],
      
      addNotification: (notification) => {
        const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
        
        // Tự động xoá toast sau 4 giây
        setTimeout(() => {
          get().removeToast(id);
        }, 4000);

        set((state) => ({
          notifications: [
            {
              id,
              date: new Date().toISOString(),
              read: false,
              ...notification,
            },
            ...state.notifications,
          ].slice(0, 50), // Giữ tối đa 50 thông báo gần nhất
          toasts: [
            ...state.toasts,
            { id, type: notification.type || 'info', message: notification.message }
          ].slice(0, 5), // Giữ tối đa 5 toast trên màn hình
        }));
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

      clearAll: () => set({ notifications: [] }),

      getUnreadCount: (isAdmin = false) => get().notifications.filter(n => !n.read && !!n.isAdmin === isAdmin).length,
    }),
    {
      name: 'cinema-notifications',
    }
  )
);

export default useNotificationStore;
