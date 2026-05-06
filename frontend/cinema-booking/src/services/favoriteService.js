/**
 * favoriteService.js
 * Quản lý phim yêu thích
 */
import api from './api';

const favoriteService = {
  /** Lấy danh sách yêu thích của user hiện tại — GET /api/v1/favorites */
  getAll: async () => {
    const res = await api.get('/v1/favorites');
    return Array.isArray(res.data) ? res.data : res.data?.data || [];
  },

  /**
   * Thêm phim vào danh sách yêu thích — POST /api/v1/favorites
   * @param {object} payload - dữ liệu yêu thích (movieId, ...)
   */
  add: async (payload) => {
    const res = await api.post('/v1/favorites', payload);
    return res.data;
  },
};

export default favoriteService;
