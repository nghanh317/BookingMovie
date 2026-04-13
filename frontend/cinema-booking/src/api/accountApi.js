import axiosClient from './axiosClient';

const accountApi = {
  /**
   * Lấy danh sách tài khoản (ADMIN)
   * GET /api/v1/accounts?page=0&size=20
   * Response: Page<AccountDTO>
   */
  getAll: (params = {}) => {
    return axiosClient.get('/api/v1/accounts', { params });
  },

  /**
   * Lấy chi tiết 1 tài khoản
   * GET /api/v1/accounts/{id}
   * Response: AccountDTO { id, userName, email, phone, fullName, role, tickets[] }
   */
  getById: (id) => {
    return axiosClient.get(`/api/v1/accounts/${id}`);
  },

  /**
   * Tạo tài khoản (ADMIN)
   * POST /api/v1/accounts
   */
  create: (data) => {
    return axiosClient.post('/api/v1/accounts', data);
  },

  /**
   * Cập nhật tài khoản (ADMIN)
   * PUT /api/v1/accounts/{id}
   */
  update: (id, data) => {
    return axiosClient.put(`/api/v1/accounts/${id}`, data);
  },

  /**
   * Xoá tài khoản (ADMIN)
   * DELETE /api/v1/accounts/{id}
   */
  delete: (id) => {
    return axiosClient.delete(`/api/v1/accounts/${id}`);
  },
};

export default accountApi;
