// /**
//  * api.js — Axios instance trung tâm
//  *
//  * Cơ chế token:
//  *   - Mọi request gắn accessToken (15 phút) vào header Authorization
//  *   - Nếu backend trả 401 → tự động gọi /auth/refresh bằng refreshToken
//  *   - Nếu refresh thành công → lưu accessToken mới + retry request gốc
//  *   - Nếu refresh thất bại (refreshToken hết hạn 7 ngày) → logout + redirect /login
//  */
// import axios from 'axios';
// import authService from './authService';

// const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// // Chỉ token bắt đầu bằng "eyJ" mới là JWT thật
// const isRealJWT = (token) => typeof token === 'string' && token.startsWith('eyJ');

// // ── Đọc tokens từ localStorage (zustand persist) ────────────
// const getTokens = () => {
//   try {
//     const raw = localStorage.getItem('cinema-auth');
//     if (!raw) return { accessToken: null };
//     const parsed = JSON.parse(raw);
//     return {
//       accessToken: parsed?.state?.accessToken || null,
//     };
//   } catch {
//     return { accessToken: null };
//   }
// };

// // ── Ghi accessToken mới vào localStorage (zustand persist format) ──
// const saveNewAccessToken = (newToken) => {
//   try {
//     const raw = localStorage.getItem('cinema-auth');
//     if (!raw) return;
//     const parsed = JSON.parse(raw);
//     if (parsed?.state) {
//       parsed.state.accessToken = newToken;
//       localStorage.setItem('cinema-auth', JSON.stringify(parsed));
//     }
//   } catch {
//     // ignore
//   }
// };

// // ── Tạo axios instance ───────────────────────────────────────
// const api = axios.create({
//   baseURL: BASE_URL,
//   timeout: 15000,
//   headers: { 'Content-Type': 'application/json' },
// });

// // ── REQUEST interceptor: gắn accessToken ────────────────────
// api.interceptors.request.use(
//   (config) => {
//     const { accessToken } = getTokens();
//     if (accessToken && isRealJWT(accessToken)) {
//       config.headers.Authorization = `Bearer ${accessToken}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // ── Biến chống gọi refresh song song nhiều lần ──────────────
// let isRefreshing = false;
// let pendingQueue = []; // Hàng đợi các request đang chờ token mới

// const processQueue = (error, token = null) => {
//   pendingQueue.forEach((prom) => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token);
//     }
//   });
//   pendingQueue = [];
// };

// // ── RESPONSE interceptor: tự động refresh khi 401 ───────────
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // Chỉ xử lý 401 và chưa retry
//     if (error.response?.status !== 401 || originalRequest._retry) {
//       return Promise.reject(error);
//     }

//     // Nếu backend trả 401 thì sẽ không kiểm tra refreshToken từ localStorage nữa
//     // vì refreshToken đang nằm an toàn ở HttpOnly cookie.
//     // Nếu gọi refresh bị lỗi, thì refreshToken trong cookie cũng đã hết hạn hoặc không hợp lệ.

//     // Đang refresh → đưa request vào hàng đợi
//     if (isRefreshing) {
//       return new Promise((resolve, reject) => {
//         pendingQueue.push({ resolve, reject });
//       }).then((newAccessToken) => {
//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//         return api(originalRequest);
//       });
//     }

//     // Bắt đầu refresh
//     originalRequest._retry = true;
//     isRefreshing = true;

//     try {
//       const { accessToken: newAccessToken } = await authService.refresh();

//       // Lưu token mới
//       saveNewAccessToken(newAccessToken);

//       // Cập nhật header cho request hiện tại và các request đang chờ
//       api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
//       processQueue(null, newAccessToken);

//       // Retry request gốc với token mới
//       originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//       return api(originalRequest);
//     } catch (refreshError) {
//       // Refresh thất bại → refresh token hết hạn 7 ngày → buộc đăng nhập lại
//       processQueue(refreshError, null);
//       forceLogout();
//       return Promise.reject(refreshError);
//     } finally {
//       isRefreshing = false;
//     }
//   }
// );

// // ── Logout + redirect về /login ──────────────────────────────
// function forceLogout() {
//   localStorage.removeItem('cinema-auth');
//   if (window.location.pathname !== '/login') {
//     window.location.href = '/login';
//   }
// }

// export default api;
/**
 * api.js — Axios instance trung tâm
 */
import axios from 'axios';
import authService from './authService';
import useAuthStore from '../store/authStore'; // 💡 Import trực tiếp file Zustand vào đây

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const isRealJWT = (token) => typeof token === 'string' && token.startsWith('eyJ');

// ── Tạo axios instance ───────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── REQUEST interceptor: gắn accessToken lấy trực tiếp từ Zustand RAM ──
api.interceptors.request.use(
  (config) => {
    // 💡 Đọc token trực tiếp từ Zustand State (luôn mới nhất)
    const accessToken = useAuthStore.getState().accessToken;
    
    if (accessToken && isRealJWT(accessToken)) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── RESPONSE interceptor: Dự phòng nếu có lỗi mạng bất ngờ ──
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do ta đã làm bộ hẹn giờ Active Refresh chủ động đổi token trước 10s rồi,
    // Nên lỗi 401 ở đây hầu như chỉ xảy ra khi mạng có sự cố lớn hoặc Token bị xóa đột ngột.
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Tự động kích hoạt hàm logout dọn dẹp sạch sẽ và đẩy về login
        useAuthStore.getState().logout();
      } catch (e) {
        // ignore
      }
    }
    return Promise.reject(error);
  }
);

export default api;