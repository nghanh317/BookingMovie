import axiosClient from './axiosClient';

const accountApi = {
  /**
   * Lấy danh sách tài khoản (ADMIN)
   * GET /api/v1/accounts
   * Response: { data: AccountDTO[] }
   * AccountDTO: { id, userName, email, phone, fullName, role, token, createDate, tickets[] }
   */
  getAll: (params = {}) => {
    return axiosClient.get('/api/v1/accounts', { params });
  },

  /**
   * Tạo tài khoản mới (ADMIN)
   * POST /api/v1/accounts
   * Body: { userName, password, email, phone, fullName, role }
   */
  create: (data) => {
    return axiosClient.post('/api/v1/accounts', data);
  },

  /**
   * Lấy chi tiết 1 tài khoản
   * GET /api/v1/accounts/{id}
   * Response: AccountDTO { id, userName, email, phone, fullName, role, token, createDate, tickets[] }
   */
  getById: (id) => {
    return axiosClient.get(`/api/v1/accounts/${id}`);
  },

  /**
   * Cập nhật tài khoản (ADMIN)
   * PUT /api/v1/accounts/{id}
   * Body: { userName, email, phone, fullName, role }
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

/**
 * Parse danh sách accounts từ response
 * Backend trả về { data: [...] } hoặc trực tiếp array
 */
export const parseAccountList = (res) => {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.content)) return d.content;
  return [];
};

export default accountApi;
