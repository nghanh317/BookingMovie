// /**
//  * authStore.js — Zustand store xác thực
//  *
//  * Lưu trữ:
//  *   - user: thông tin người dùng
//  *   - accessToken: JWT ngắn hạn (15 phút) — dùng để gọi API
//  *   - refreshToken: JWT dài hạn (7 ngày) — dùng để lấy accessToken mới
//  *
//  * Người dùng chỉ bị redirect /login khi refreshToken hết hạn.
//  */
// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
// import authService from '../services/authService';

// const useAuthStore = create(
//   persist(
//     (set, get) => ({
//       user: null,           // { id, userName, email, phone, fullName, role }
//       accessToken: null,    // JWT 15 phút
//       isLoggedIn: false,

//       /**
//        * Đăng nhập — gọi POST /api/v1/auth/login
//        */
//       login: async (userName, passwordHash) => {
//         try {
//           const data = await authService.login(userName, passwordHash);

//           // data = { id, userName, email, phone, fullName, role, accessToken }
//           const { accessToken, ...userInfo } = data;

//           set({
//             user: userInfo,
//             accessToken,
//             isLoggedIn: true,
//           });

//           return { success: true, role: (data.role || '').toLowerCase() };
//         } catch (err) {
//           const message =
//             err.response?.data?.detailMessage ||
//             err.response?.data?.message ||
//             (typeof err.response?.data === 'string' ? err.response.data : null) ||
//             'Tên đăng nhập hoặc mật khẩu không đúng';
//           return { success: false, message: String(message) };
//         }
//       },

//       /**
//        * Cập nhật accessToken mới (gọi từ api.js sau khi refresh thành công)
//        */
//       setAccessToken: (newAccessToken) => {
//         set({ accessToken: newAccessToken });
//       },

//       /** Đăng xuất an toàn */
//       logout: async () => {
//         try {
//           // Gọi API để Backend xóa Cookie
//           await authService.logout(); 
//         } catch (error) {
//           console.warn("Lỗi khi gọi API logout, vẫn tiếp tục dọn dẹp máy khách:", error);
//         } finally {
//           // Xóa sạch RAM và đẩy về trang login
//           set({ user: null, accessToken: null, isLoggedIn: false });
//           localStorage.removeItem('cinema-auth'); 
          
//           if (window.location.pathname !== '/login') {
//             window.location.href = '/login';
//           }
//         }
//       },

//       /** Kiểm tra user có phải admin */
//       isAdmin: () => {
//         const { user } = get();
//         return (user?.role || '').toUpperCase() === 'ADMIN';
//       },

//       /** Trừ điểm thưởng */
//       spendPoints: (amount) => {
//         const { user } = get();
//         if (!user) return;
//         const current = user.points || 0;
//         if (current < amount) return;
//         set({ user: { ...user, points: current - amount } });
//       },

//       /** Thêm voucher */
//       addVoucher: (voucherId) => {
//         const { user } = get();
//         if (!user) return;
//         const current = user.myVouchers || [];
//         if (current.includes(voucherId)) return;
//         set({ user: { ...user, myVouchers: [...current, voucherId] } });
//       },
//     }),
//     {
//       name: 'cinema-auth', // key trong localStorage
//       // Chỉ persist những gì cần thiết — accessToken không cần persist lâu
//       partialize: (state) => ({
//         user: state.user,
//         accessToken: state.accessToken,
//         isLoggedIn: state.isLoggedIn,
//       }),
//     }
//   )
// );

// export default useAuthStore;

/**
 * authStore.js — Zustand store xác thực
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';
import useNotificationStore from './notificationStore';

let refreshTimeoutId = null; // Biến global giữ ID của bộ hẹn giờ để tránh rác RAM

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,           // { id, userName, email, phone, fullName, role }
      accessToken: null,    // JWT ngắn hạn
      isLoggedIn: false,

      /** ⏱️ Bộ hẹn giờ làm mới Token chủ động */
      setupActiveRefresh: (token) => {
        // Xóa bộ hẹn giờ cũ đang chạy dở nếu có
        if (refreshTimeoutId) clearTimeout(refreshTimeoutId);

        if (!token) return;

        try {
          // Bóc tách phần Payload (đoạn giữa) của JWT để xem thời gian hết hạn (exp)
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(window.atob(base64));
          
          const expireTime = payload.exp * 1000; // Đổi giây sang mili-giây
          const currentTime = Date.now();
          
          // Khoảng đệm an toàn: Đổi token trước khi AT chết 10 giây (10000ms)
          const bufferTime = 10000; 
          const delay = expireTime - currentTime - bufferTime;

          console.log(`⏱️ Access Token sẽ tự động đổi mới sau: ${Math.max(0, delay / 1000)} giây.`);

          // Lên lịch chạy ngầm
          refreshTimeoutId = setTimeout(async () => {
            console.log("🚀 [Active Refresh] Cận giờ hết hạn AT, đang tự động đổi token mới...");
            try {
              const res = await authService.refresh(); 
              const newAT = res.accessToken;

              // Thay token mới vào RAM của Store
              set({ accessToken: newAT });
              
              // Tiếp tục lên lịch đệ quy cho cái Token mới vừa lấy
              get().setupActiveRefresh(newAT);
            } catch (error) {
              console.error("❌ Chủ động refresh thất bại! Có thể Refresh Token đã hết hạn.", error);
              get().logout(); // Đăng xuất nếu Cookie RT chết thật
            }
          }, Math.max(0, delay));

        } catch (e) {
          console.error("Lỗi giải mã chuỗi JWT để tính thời gian:", e);
        }
      },

      /** Đăng nhập thành công */
      login: async (userName, passwordHash) => {
        try {
          const data = await authService.login(userName, passwordHash);
          const { accessToken, ...userInfo } = data;

          set({
            user: userInfo,
            accessToken,
            isLoggedIn: true,
          });

          // Kích hoạt hẹn giờ đổi token ngay khi vừa đăng nhập xong
          get().setupActiveRefresh(accessToken);

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

      /** Cập nhật accessToken mới (gọi từ api.js hoặc nội bộ) */
      setAccessToken: (newAccessToken) => {
        set({ accessToken: newAccessToken });
        // Mỗi lần cập nhật thủ công cũng phải tính lại giờ
        get().setupActiveRefresh(newAccessToken);
      },

      /** Đăng xuất an toàn tuyệt đối */
      logout: async () => {
        // Hủy bộ hẹn giờ ngay lập tức
        if (refreshTimeoutId) clearTimeout(refreshTimeoutId);
        
        try {
          // Gọi API để Backend xóa sạch HttpOnly Cookie
          await authService.logout(); 
        } catch (error) {
          console.warn("Lỗi khi gọi API logout, vẫn tiếp tục dọn dẹp máy khách:", error);
        } finally {
          try {
            // Xóa sạch thông báo khỏi RAM và LocalStorage
            useNotificationStore.getState().clearAll();
            localStorage.removeItem('cinema-notifications');
          } catch (e) {
            console.warn("Lỗi khi dọn dẹp thông báo:", e);
          }

          // 💡 ĐĂNG XUẤT AN TOÀN: Đưa RAM về trạng thái gốc rỗng để tránh kẹt ghi đè LocalStorage
          set({ 
            user: null, 
            accessToken: null, 
            isLoggedIn: false 
          });
          
          // Xóa dứt điểm bản ghi trong LocalStorage
          localStorage.removeItem('cinema-auth'); 
          
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      },

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
      name: 'cinema-auth', 
      // 💡 CHỈ cho phép 3 trường này persist xuống LocalStorage, loại bỏ hoàn toàn notifications!
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);

export default useAuthStore;