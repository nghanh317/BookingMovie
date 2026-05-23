/**
 * newsService.js
 * Quản lý API tin tức (News)
 *
 * GET    /api/v1/news          — Danh sách tin (pageable, public)
 * GET    /api/v1/news/{id}     — Chi tiết tin (public)
 * POST   /api/v1/news          — Tạo tin (ADMIN)
 * PUT    /api/v1/news/{id}     — Cập nhật tin (ADMIN)
 * DELETE /api/v1/news/{id}     — Xoá tin (ADMIN)
 *
 * News entity fields:
 *   id, title, content, imageUrl, createDate, updateDate, isDeleted
 */
import api from './api';

const newsService = {
  /**
   * Lấy danh sách tin tức — GET /api/v1/news
   * @param {object} params - { page, size, sort }
   */
  getAll: async (params = {}) => {
    const res = await api.get('/v1/news', { params });
    return res.data;
  },

  /** Lấy chi tiết một tin — GET /api/v1/news/{id} */
  getById: async (id) => {
    const res = await api.get(`/v1/news/${id}`);
    return res.data;
  },

  /** Tạo tin mới — POST /api/v1/news (ADMIN) */
  create: async (payload) => {
    const res = await api.post('/v1/news', payload);
    return res.data;
  },

  /** Cập nhật tin — PUT /api/v1/news/{id} (ADMIN) */
  update: async (id, payload) => {
    const res = await api.put(`/v1/news/${id}`, payload);
    return res.data;
  },

  /** Xoá tin — DELETE /api/v1/news/{id} (ADMIN) */
  remove: async (id) => {
    await api.delete(`/v1/news/${id}`);
  },
};

export default newsService;
