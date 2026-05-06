/**
 * movieCinemaService.js
 * Quản lý API liên kết Phim - Rạp (MovieCinema)
 *
 * GET /api/v1/movieCinemas — Danh sách phim theo rạp (pageable + filter)
 */
import api from './api';

const movieCinemaService = {
  /**
   * Lấy danh sách phim–rạp — GET /api/v1/movieCinemas
   * @param {object} params - query params: page, size, sort, search
   */
  getAll: async (params = {}) => {
    const res = await api.get('/v1/movieCinemas', { params });
    return res.data;
  },
};

export default movieCinemaService;
