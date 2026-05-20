/**
 * api.js — Axios instance trung tâm
 * - Tự động gắn Bearer token vào mọi request
 * - Chặn demo/invalid token ngay tại request interceptor
 * - Tự động logout + redirect khi nhận 401
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// JWT thật luôn bắt đầu bằng "eyJ" (base64 của {"alg":...})
const isRealJWT = (token) => typeof token === 'string' && token.startsWith('eyJ');

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: chặn token giả, chỉ gắn JWT thật ──
api.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('cinema-auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        const token = parsed?.state?.token;

        if (token && isRealJWT(token)) {
          // Token hợp lệ → gắn vào header
          config.headers.Authorization = `Bearer ${token}`;
        } else if (token && !isRealJWT(token)) {
          // Token giả (demo-admin-token, demo-user-token, ...) → xóa ngay
          console.warn('[API] Demo/invalid token detected and removed:', token);
          localStorage.removeItem('cinema-auth');
          // Không gắn Authorization → backend trả lỗi 401 công khai nếu cần auth
        }
      } catch (_) {
        // ignore parse errors
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: xử lý 401 ────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      console.warn('[API] 401 Unauthorized — token expired or invalid. URL:', error.config?.url);
      localStorage.removeItem('cinema-auth');
      if (currentPath !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
