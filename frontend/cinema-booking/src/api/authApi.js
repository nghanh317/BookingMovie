import axiosClient from './axiosClient';

const authApi = {
  /**
   * Đăng nhập
   * POST /api/v1/auth/login
   * Body: { userName, passwordHash }
   * Response: AccountDTO { id, userName, email, phone, fullName, role, token, ... }
   */
  login: (userName, passwordHash) => {
    return axiosClient.post('/api/v1/auth/login', { userName, passwordHash });
  },

  /**
   * Đăng ký tài khoản mới
   * POST /api/v1/auth/register
   * Body: { userName, passwordHash, email, phone, fullName }
   */
  register: ({ userName, passwordHash, email, phone, fullName }) => {
    return axiosClient.post('/api/v1/auth/register', {
      userName,
      passwordHash,
      email,
      phone,
      fullName,
    });
  },
};

export default authApi;
