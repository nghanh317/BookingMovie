import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,       // { id, userName, email, phone, fullName, role, token, ... }
      isLoggedIn: false,

      /**
       * Đăng nhập bằng API backend
       * Backend nhận: { userName, passwordHash }
       * Backend trả: AccountDTO { id, userName, email, phone, fullName, role, token }
       */
      login: async (userName, password) => {
        try {
          const { data } = await authApi.login(userName, password);
          // data = AccountDTO chứa token
          set({ user: data, isLoggedIn: true });
          return { success: true, role: data.role };
        } catch (error) {
          const msg =
            error.response?.status === 401
              ? 'Tên đăng nhập hoặc mật khẩu không đúng'
              : error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
          return { success: false, message: msg };
        }
      },

      /**
       * Đăng ký tài khoản
       * Backend nhận: { userName, passwordHash, email, phone, fullName }
       */
      register: async ({ userName, password, email, phone, fullName }) => {
        try {
          await authApi.register({
            userName,
            passwordHash: password,
            email,
            phone,
            fullName,
          });
          return { success: true };
        } catch (error) {
          const msg =
            error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
          return { success: false, message: msg };
        }
      },

      // Đăng xuất
      logout: () => set({ user: null, isLoggedIn: false }),
    }),
    {
      name: 'cinema-auth', // key trong localStorage
    }
  )
);

export default useAuthStore;
