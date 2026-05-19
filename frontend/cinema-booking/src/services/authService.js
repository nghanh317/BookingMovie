/**
 * authService.js
 * POST /api/v1/auth/login
 * Body: { userName, passwordHash }
 * Response: { id, userName, email, phone, fullName, role, token, tickets, createDate }
 */
import api from './api';

const authService = {
  /**
   * Đăng nhập
   * @param {string} userName
   * @param {string} passwordHash - mật khẩu gửi lên (backend đặt tên là passwordHash)
   * @returns {Promise<object>} dữ liệu user + token
   */
  login: async (userName, passwordHash) => {
    const response = await api.post('/v1/auth/login', { userName, passwordHash });
    return response.data;
  },
};

export default authService;
