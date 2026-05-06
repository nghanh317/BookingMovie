/**
 * movieService.js
 * Quản lý các API liên quan đến phim
 */
import api from './api';
import { MOVIES } from '../constants/mockData';

// ── Helpers ─────────────────────────────────────────────────
/**
 * Chuẩn hóa response từ backend về cấu trúc mà frontend đang dùng.
 * Điều chỉnh mapping này khi biết chính xác cấu trúc JSON của backend.
 */
const normalize = (movie) => ({
  id: movie.id,
  title: movie.title || movie.movieName || movie.name || '',
  originalTitle: movie.originalTitle || movie.englishName || '',
  poster: movie.poster || movie.posterUrl || movie.imageUrl || '',
  backdrop: movie.backdrop || movie.backdropUrl || '',
  rating: parseFloat(movie.rating) || 0,
  genre: Array.isArray(movie.genre)
    ? movie.genre
    : (movie.genre || '').split(',').map((g) => g.trim()).filter(Boolean),
  duration: parseInt(movie.duration) || 0,
  language: movie.language || 'Tiếng Anh',
  releaseDate: movie.releaseDate || movie.release_date || '',
  director: movie.director || '',
  cast: Array.isArray(movie.cast)
    ? movie.cast
    : (movie.cast || '').split(',').map((c) => c.trim()).filter(Boolean),
  description: movie.description || movie.content || '',
  trailer: (() => {
    const raw = movie.trailer || movie.trailerUrl || '';
    if (!raw) return '';
    // Convert watch?v=... to /embed/...
    let videoId = '';
    if (raw.includes('v=')) {
      videoId = raw.split('v=')[1].split('&')[0];
    } else if (raw.includes('youtu.be/')) {
      videoId = raw.split('youtu.be/')[1].split('?')[0];
    } else if (raw.includes('embed/')) {
      return raw;
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : raw;
  })(),
  status: movie.status ? movie.status.toString().toLowerCase() : 'now_showing',
  ageRating: movie.ageRating || movie.age_rating || 'T13',
});

const movieService = {
  /** Lấy tất cả phim — GET /api/v1/movies */
  getAll: async () => {
    try {
      const res = await api.get('/v1/movies');
      const data = Array.isArray(res.data) ? res.data : res.data?.content || res.data?.data || [];
      return data.map(normalize);
    } catch (err) {
      console.warn('[movieService] getAll failed, using mock data:', err.message);
      return MOVIES; // fallback
    }
  },

  /** Lấy chi tiết phim — GET /api/v1/movies/{id} */
  getById: async (id) => {
    try {
      const res = await api.get(`/v1/movies/${id}`);
      return normalize(res.data);
    } catch (err) {
      console.warn('[movieService] getById failed, using mock data:', err.message);
      return MOVIES.find((m) => m.id === Number(id)) || null;
    }
  },

  /** Lấy ngày chiếu của phim — GET /api/v1/movies/{id}/dates */
  getDates: async (id) => {
    try {
      const res = await api.get(`/v1/movies/${id}/dates`);
      return res.data;
    } catch (err) {
      console.warn('[movieService] getDates failed:', err.message);
      return [];
    }
  },

  /** Thêm phim mới (Admin) — POST /api/v1/movies */
  create: async (payload) => {
    const res = await api.post('/v1/movies', payload);
    return normalize(res.data);
  },

  /** Cập nhật phim (Admin) — PUT /api/v1/movies/{id} */
  update: async (id, payload) => {
    const res = await api.put(`/v1/movies/${id}`, payload);
    return normalize(res.data);
  },

  /** Xoá phim (Admin) — DELETE /api/v1/movies/{id} */
  remove: async (id) => {
    await api.delete(`/v1/movies/${id}`);
  },
};

export default movieService;
