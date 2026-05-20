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
const normalizeTrailer = (url) => {
  if (!url) return '';
  if (url.includes('/embed/')) return url;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/))([^?&]+)/);
  return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : url;
};

const normalize = (movie) => ({
  id: movie.id,
  title: movie.title || movie.movieName || movie.name || '',
  originalTitle: movie.originalTitle || movie.englishName || '',
  poster: movie.poster || movie.posterUrl || movie.imageUrl || '',
  backdrop: movie.backdrop || movie.backdropUrl || movie.poster || movie.posterUrl || movie.imageUrl || '',
  rating: parseFloat(movie.rating) || 0,
  genre: Array.isArray(movie.genre)
    ? movie.genre
    : (movie.genre || '').split(',').map((g) => g.trim()).filter(Boolean),
  duration: parseInt(movie.duration) || 0,
  language: movie.language || 'Tiếng Anh',
  releaseDate: movie.releaseDate || movie.release_date || '',
  director: movie.director || '',
  cast: Array.isArray(movie.cast) ? movie.cast : [],
  description: movie.description || movie.content || '',
  trailer: normalizeTrailer(movie.trailer || movie.trailerUrl || ''),
  status: (movie.status || 'now_showing').toLowerCase(),
  ageRating: movie.ageRating || movie.age_rating || 'T13',
});

const movieService = {
  /** Lấy tất cả phim — GET /api/v1/movies */
  getAll: async () => {
    try {
      const res = await api.get('/v1/movies', { params: { size: 1000 } });
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

  /** Thêm phím mới (Admin) — POST /api/v1/movies */
  create: async (payload) => {
    const res = await api.post('/v1/movies', {
      title: payload.title,
      description: payload.description,
      duration: parseInt(payload.duration) || 0,
      releaseDate: payload.releaseDate,
      director: payload.director,
      cast: Array.isArray(payload.cast) ? payload.cast.join(', ') : (payload.cast || ''),
      genre: Array.isArray(payload.genre) ? payload.genre.join(', ') : (payload.genre || ''),
      language: payload.language || 'Tiếng Anh',
      posterUrl: payload.poster || payload.posterUrl || '',
      trailerUrl: payload.trailer || payload.trailerUrl || '',
      status: (payload.status || 'now_showing').toUpperCase().replace('_', '_'),
    });
    return res.data ? normalize(res.data) : null;
  },

  /** Cập nhật phím (Admin) — PUT /api/v1/movies/{id} */
  update: async (id, payload) => {
    const res = await api.put(`/v1/movies/${id}`, {
      title: payload.title,
      description: payload.description,
      duration: parseInt(payload.duration) || 0,
      releaseDate: payload.releaseDate,
      director: payload.director,
      //cast: Array.isArray(payload.cast) ? payload.cast.join(', ') : (payload.cast || ''),
      cast: "Miho Okasaki, Mao Ichimichi, Tomoaki Maeno, Makoto Furukawa, Sayaka Senbongi",
      //genre: Array.isArray(payload.genre) ? payload.genre.join(', ') : (payload.genre || ''),
      genre: "Khoa học viễn tưởng, Hành động, Phiêu lưu",
      language: payload.language || 'Tiếng Anh',
      posterUrl: payload.poster || payload.posterUrl || '',
      trailerUrl: payload.trailer || payload.trailerUrl || '',
      //status: (payload.status || 'now_showing').toUpperCase().replace('_', '_'),
    });
    return res.data ? normalize(res.data) : null;
  },

  /** Xoá phím (Admin) — DELETE /api/v1/movies/{id} */
  remove: async (id) => {
    await api.delete(`/v1/movies/${id}`);
  },
};

export default movieService;
