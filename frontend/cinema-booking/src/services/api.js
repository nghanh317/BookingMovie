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
      // Xoá dữ liệu auth và redirect về login
      localStorage.removeItem('cinema-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
