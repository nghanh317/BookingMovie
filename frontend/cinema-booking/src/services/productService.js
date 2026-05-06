/**
 * productService.js
 * Quản lý API sản phẩm bỏng nước (Products)
 *
 * GET    /api/v1/products          — Danh sách sản phẩm (pageable + filter)
 * GET    /api/v1/products/{id}     — Chi tiết sản phẩm
 * POST   /api/v1/products          — Tạo sản phẩm mới (Admin)
 * PUT    /api/v1/products/{id}     — Cập nhật sản phẩm (Admin)
 * DELETE /api/v1/products/{id}     — Xoá sản phẩm (Admin)
 *
 * ProductDTO: {
 *   id, productName, category ("FOOD"|"DRINK"|"COMBO"),
 *   description, price, imageUrl, createDate
 * }
 */
import api from './api';

const productService = {
  /**
   * Lấy danh sách sản phẩm — GET /api/v1/products
   * @param {object} params - query params: page, size, sort, search
   */
  getAll: async (params = {}) => {
    const res = await api.get('/v1/products', { params });
    return res.data;
  },

  /** Chi tiết sản phẩm — GET /api/v1/products/{id} */
  getById: async (id) => {
    const res = await api.get(`/v1/products/${id}`);
    return res.data;
  },

  /** Tạo sản phẩm mới (Admin) — POST /api/v1/products */
  create: async (payload) => {
    const res = await api.post('/v1/products', payload);
    return res.data;
  },

  /** Cập nhật sản phẩm (Admin) — PUT /api/v1/products/{id} */
  update: async (id, payload) => {
    const res = await api.put(`/v1/products/${id}`, payload);
    return res.data;
  },

  /** Xoá sản phẩm (Admin) — DELETE /api/v1/products/{id} */
  remove: async (id) => {
    await api.delete(`/v1/products/${id}`);
  },
};

export default productService;
