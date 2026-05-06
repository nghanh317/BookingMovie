/**
 * authService.js
 * POST /api/v1/auth/login     → Đăng nhập
 * POST /api/v1/auth/register  → Đăng ký
 *
 * Dùng axios trực tiếp (không qua api.js) vì:
 * - Register/Login là public (không cần Bearer token)
 * - Register trả về plain string, không phải JSON
 * - api.js có interceptor redirect 401 → /login gây lỗi khi register
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const authService = {
  /**
   * Đăng nhập
   * POST /api/v1/auth/login
   * Body: { userName, passwordHash }
   * Response (JSON): { id, userName, email, phone, fullName, role, token, createDate, tickets }
   */
  login: async (userName, passwordHash) => {
    const response = await axios.post(
      `${BASE_URL}/v1/auth/login`,
      { userName, passwordHash },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  },

  /**
   * Đăng ký tài khoản mới
   * POST /api/v1/auth/register
   * Body: { userName, passwordHash, email, phone, fullName }
   * Response (plain text): "Đăng ký thành công"
   */
  register: async ({ userName, passwordHash, email, phone, fullName }) => {
    const response = await axios.post(
      `${BASE_URL}/v1/auth/register`,
      { userName, passwordHash, email, phone, fullName },
      {
        headers: { 'Content-Type': 'application/json' },
        // Backend trả về plain string, không phải JSON
        transformResponse: [(data) => data],
      }
    );
    return response.data;
  },
};

export default authService;
