/**
 * api.js — Axios instance trung tâm
 * - Tự động gắn Bearer token vào mọi request
 * - Tự động logout + redirect khi nhận 401
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: gắn token ──────────────────────────
api.interceptors.request.use(
  (config) => {
    // Lấy token từ authStore (persist trong localStorage)
    const authData = localStorage.getItem('cinema-auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        const token = parsed?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
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
      const requestUrl = error.config?.url || '';
      // Danh sách các API không được phép redirect về login khi gặp 401
      const isPublicEndpoint = 
        requestUrl.includes('/v1/auth/') || 
        requestUrl.includes('/v1/movies') || 
        requestUrl.includes('/v1/cinemas') || 
        requestUrl.includes('/v1/provinces') ||
        requestUrl.includes('/v1/slots') ||
        requestUrl.includes('/v1/accounts') ||
        requestUrl.includes('/v1/promotions') ||
        requestUrl.includes('/v1/tickets');

      if (!isPublicEndpoint) {
        localStorage.removeItem('cinema-auth');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
