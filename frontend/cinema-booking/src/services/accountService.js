/**
 * accountService.js
 * Quản lý tài khoản người dùng (ADMIN)
 */
import api from './api';

const accountService = {
  /** Lấy danh sách tài khoản — GET /api/v1/accounts */
  getAll: async () => {
    // Thêm size=1000 và sort=id,desc để lấy toàn bộ danh sách và xếp tài khoản mới nhất lên đầu
    const res = await api.get('/v1/accounts?size=1000&sort=id,desc');
    return Array.isArray(res.data) ? res.data : res.data?.content || res.data?.data || [];
  },

  /** Chi tiết tài khoản — GET /api/v1/accounts/{id} */
  getById: async (id) => {
    const res = await api.get(`/v1/accounts/${id}`);
    return res.data;
  },

  /** Tạo tài khoản mới (Admin) — POST /api/v1/accounts */
  create: async (payload) => {
    const res = await api.post('/v1/accounts', payload);
    return res.data;
  },

  /**
   * Cập nhật tài khoản — PUT /api/v1/accounts/{id}
   * Dùng cho Profile.jsx và AdminUsers.jsx
   */
  update: async (id, payload) => {
    const res = await api.put(`/v1/accounts/${id}`, payload);
    return res.data;
  },

  /** Xoá tài khoản (Admin) — DELETE /api/v1/accounts/{id} */
  remove: async (id) => {
    await api.delete(`/v1/accounts/${id}`);
  },
};

export default accountService;
