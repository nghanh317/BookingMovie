/**
 * authService.js
 * Các endpoint xác thực:
 *   POST /api/v1/auth/login   → { id, userName, email, phone, fullName, role, accessToken, refreshToken }
 *   POST /api/v1/auth/refresh → { accessToken }
 *   POST /api/v1/auth/register
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Instance riêng không qua api.js để tránh vòng lặp interceptor
const authAxios = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

const authService = {
  /**
   * Đăng nhập — POST /api/v1/auth/login
   * @returns {{ id, userName, email, phone, fullName, role, accessToken, refreshToken }}
   */
  login: async (userName, passwordHash) => {
    const res = await authAxios.post('/v1/auth/login', { userName, passwordHash });
    return res.data;
  },

  /**
   * Làm mới access token — POST /api/v1/auth/refresh
   * @param {string} refreshToken
   * @returns {{ accessToken: string }}
   */
  refresh: async (refreshToken) => {
    const res = await authAxios.post('/v1/auth/refresh', { refreshToken });
    return res.data; // { accessToken }
  },

  /**
   * Đăng ký — POST /api/v1/auth/register
   */
  register: async (payload) => {
    const res = await authAxios.post('/v1/auth/register', payload);
    return res.data;
  },
};

export default authService;
