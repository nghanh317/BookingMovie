/**
 * authStore.js — Zustand store xác thực
 *
 * Lưu trữ:
 *   - user: thông tin người dùng
 *   - accessToken: JWT ngắn hạn (15 phút) — dùng để gọi API
 *   - refreshToken: JWT dài hạn (7 ngày) — dùng để lấy accessToken mới
 *
 * Người dùng chỉ bị redirect /login khi refreshToken hết hạn.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,           // { id, userName, email, phone, fullName, role }
      accessToken: null,    // JWT 15 phút
      refreshToken: null,   // JWT 7 ngày
      isLoggedIn: false,

      /**
       * Đăng nhập — gọi POST /api/v1/auth/login
       */
      login: async (userName, passwordHash) => {
        try {
          const data = await authService.login(userName, passwordHash);

          // data = { id, userName, email, phone, fullName, role, accessToken, refreshToken }
          const { accessToken, refreshToken, ...userInfo } = data;

          set({
            user: userInfo,
            accessToken,
            refreshToken,
            isLoggedIn: true,
          });

          return { success: true, role: (data.role || '').toLowerCase() };
        } catch (err) {
          const message =
            err.response?.data?.detailMessage ||
            err.response?.data?.message ||
            (typeof err.response?.data === 'string' ? err.response.data : null) ||
            'Tên đăng nhập hoặc mật khẩu không đúng';
          return { success: false, message: String(message) };
        }
      },

      /**
       * Cập nhật accessToken mới (gọi từ api.js sau khi refresh thành công)
       */
      setAccessToken: (newAccessToken) => {
        set({ accessToken: newAccessToken });
      },

      /** Đăng xuất */
      logout: () => set({ user: null, accessToken: null, refreshToken: null, isLoggedIn: false }),

      /** Kiểm tra user có phải admin */
      isAdmin: () => {
        const { user } = get();
        return (user?.role || '').toUpperCase() === 'ADMIN';
      },

      /** Trừ điểm thưởng */
      spendPoints: (amount) => {
        const { user } = get();
        if (!user) return;
        const current = user.points || 0;
        if (current < amount) return;
        set({ user: { ...user, points: current - amount } });
      },

      /** Thêm voucher */
      addVoucher: (voucherId) => {
        const { user } = get();
        if (!user) return;
        const current = user.myVouchers || [];
        if (current.includes(voucherId)) return;
        set({ user: { ...user, myVouchers: [...current, voucherId] } });
      },
    }),
    {
      name: 'cinema-auth', // key trong localStorage
      // Chỉ persist những gì cần thiết — accessToken không cần persist lâu
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);

export default useAuthStore;
