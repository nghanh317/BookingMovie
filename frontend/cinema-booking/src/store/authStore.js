/**
 * authStore.js — Zustand store xác thực người dùng
 *
 * Kết nối thật với backend qua authService.
 * Response login: { id, userName, email, phone, fullName, role, token, tickets, createDate }
 * role từ backend là "ADMIN" hoặc "USER" (chữ hoa)
 *
 * DEMO MODE: Nếu backend không khả dụng, tự động fallback sang demo accounts.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';

// ── Demo accounts (chỉ dùng khi backend không khả dụng) ────────────────────
const DEMO_ACCOUNTS = [
  {
    userName: 'admin',
    passwordHash: 'admin123',
    user: {
      id: 'demo-1',
      userName: 'admin',
      email: 'admin@cinemabooking.demo',
      phone: '0901234567',
      fullName: 'Admin Demo',
      role: 'ADMIN',
      tickets: [],
      createDate: new Date().toISOString(),
    },
    token: 'demo-admin-token',
  },
  {
    userName: 'user',
    passwordHash: 'user123',
    user: {
      id: 'demo-2',
      userName: 'user',
      email: 'user@cinemabooking.demo',
      phone: '0912345678',
      fullName: 'Người Dùng Demo',
      role: 'USER',
      tickets: [],
      createDate: new Date().toISOString(),
    },
    token: 'demo-user-token',
  },
];

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,       // { id, userName, email, phone, fullName, role, tickets, ... }
      token: null,      // JWT token
      isLoggedIn: false,

      /**
       * Đăng nhập — gọi POST /api/v1/auth/login
       * @param {string} userName
       * @param {string} passwordHash - mật khẩu người dùng nhập
       * @returns {{ success: boolean, role?: string, message?: string }}
       */
      login: async (userName, passwordHash) => {
        try {
          const data = await authService.login(userName, passwordHash);

          // Tách token ra khỏi object user trước khi lưu
          const { token, ...userInfo } = data;

          set({
            user: userInfo,
            token: token,
            isLoggedIn: true,
          });

          // role từ backend: "ADMIN" hoặc "USER"
          return { success: true, role: (data.role || '').toLowerCase() };
        } catch (err) {
          // ── Fallback: thử demo accounts khi backend không khả dụng ──────
          const isNetworkError =
            !err.response || err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED';

          // Log chi tiết lỗi để debug
          console.error('[Login] Backend error:', {
            status: err.response?.status,
            data: err.response?.data,
            code: err.code,
            isNetworkError,
          });

          if (isNetworkError) {
            const demo = DEMO_ACCOUNTS.find(
              (a) => a.userName === userName && a.passwordHash === passwordHash
            );
            if (demo) {
              set({ user: demo.user, token: demo.token, isLoggedIn: true });
              return { success: true, role: demo.user.role.toLowerCase(), isDemo: true };
            }
            return {
              success: false,
              message: 'Không thể kết nối với server. Dùng tài khoản demo: admin/admin123 hoặc user/user123',
            };
          }

          const message =
            err.response?.data?.detailMessage ||
            err.response?.data?.message ||
            (typeof err.response?.data === 'string' ? err.response.data : null) ||
            'Tên đăng nhập hoặc mật khẩu không đúng';
          return { success: false, message: String(message) };
        }
      },

      /** Đăng xuất */
      logout: () => set({ user: null, token: null, isLoggedIn: false }),

      /** Kiểm tra user có phải admin không */
      isAdmin: () => {
        const { user } = get();
        return (user?.role || '').toUpperCase() === 'ADMIN';
      },

      /**
       * Trừ điểm thưởng của user (khi đổi voucher bằng điểm)
       * @param {number} amount - số điểm cần trừ
       */
      spendPoints: (amount) => {
        const { user } = get();
        if (!user) return;
        const currentPoints = user.points || 0;
        if (currentPoints < amount) return;
        set({ user: { ...user, points: currentPoints - amount } });
      },

      /**
       * Thêm voucher vào danh sách voucher của user (persist qua localStorage)
       * @param {string} voucherId
       */
      addVoucher: (voucherId) => {
        const { user } = get();
        if (!user) return;
        const current = user.myVouchers || [];
        if (current.includes(voucherId)) return; // tránh trùng
        set({ user: { ...user, myVouchers: [...current, voucherId] } });
      },
    }),
    {
      name: 'cinema-auth', // key trong localStorage
    }
  )
);

export default useAuthStore;
