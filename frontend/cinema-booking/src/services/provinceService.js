/**
 * provinceService.js
 * Quản lý API tỉnh/thành phố (Provinces)
 *
 * GET    /api/v1/provinces              — Danh sách tỉnh (pageable)
 * GET    /api/v1/provinces/{id}         — Chi tiết một tỉnh
 * GET    /api/v1/provinces/{id}/cinemas — Danh sách rạp theo tỉnh
 * POST   /api/v1/provinces              — Tạo tỉnh mới (Admin)
 * PUT    /api/v1/provinces/{id}         — Cập nhật tỉnh (Admin)
 * DELETE /api/v1/provinces/{id}         — Xoá tỉnh (Admin)
 *
 * ProvinceDTO: { id, provinceName }
 */
import api from './api';

const provinceService = {
  /**
   * Lấy danh sách tỉnh/thành — GET /api/v1/provinces
   * @param {object} params - query params: page, size, sort, search
   */
  getAll: async (params = {}) => {
    const res = await api.get('/v1/provinces', { params });
    return res.data;
  },

  /** Chi tiết tỉnh — GET /api/v1/provinces/{id} */
  getById: async (id) => {
    const res = await api.get(`/v1/provinces/${id}`);
    return res.data;
  },

  /**
   * Lấy danh sách rạp theo tỉnh — GET /api/v1/provinces/{id}/cinemas
   * @param {number} id - Province ID
   * @param {object} params - pageable params
   */
  getCinemas: async (id, params = {}) => {
    const res = await api.get(`/v1/provinces/${id}/cinemas`, { params });
    return res.data;
  },

  /** Tạo tỉnh mới (Admin) — POST /api/v1/provinces */
  create: async (payload) => {
    const res = await api.post('/v1/provinces', payload);
    return res.data;
  },

  /** Cập nhật tỉnh (Admin) — PUT /api/v1/provinces/{id} */
  update: async (id, payload) => {
    const res = await api.put(`/v1/provinces/${id}`, payload);
    return res.data;
  },

  /** Xoá tỉnh (Admin) — DELETE /api/v1/provinces/{id} */
  remove: async (id) => {
    await api.delete(`/v1/provinces/${id}`);
  },
};

export default provinceService;
