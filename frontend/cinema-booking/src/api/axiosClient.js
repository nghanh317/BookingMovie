/**
 * axiosClient.js — Instance dùng bởi các api/ folder (slot, room, ticket, seat...)
 * Đồng bộ cơ chế token với api.js:
 *   - Đọc accessToken từ localStorage (zustand persist)
 *   - 401 → redirect /login (các endpoint này không cần silent refresh)
 */
import axios from 'axios';

const isRealJWT = (token) => typeof token === 'string' && token.startsWith('eyJ');

const getAccessToken = () => {
  try {
    const raw = localStorage.getItem('cinema-auth');
    if (!raw) return null;
    return JSON.parse(raw)?.state?.accessToken || null;
  } catch {
    return null;
  }
};

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor ──────────────────────────────────────
axiosClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && isRealJWT(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ─────────────────────────────────────
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cinema-auth');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
