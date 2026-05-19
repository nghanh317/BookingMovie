/**
 * cinemaService.js
 * Quản lý API liên quan đến rạp chiếu phim
 */
import api from './api';
import { CINEMAS } from '../constants/mockData';

const normalize = (cinema) => ({
  id: cinema.id,
  name: cinema.name || cinema.cinemaName || '',
  address: cinema.address || cinema.location || '',
  city: cinema.city || '',
  image: cinema.image || cinema.imageUrl || '',
  screens: parseInt(cinema.screens || cinema.numberOfScreens) || 0,
  rating: parseFloat(cinema.rating) || 0,
});

const cinemaService = {
  /** Lấy danh sách rạp — GET /api/v1/cinemas */
  getAll: async () => {
    try {
      const res = await api.get('/v1/cinemas');
      const data = Array.isArray(res.data) ? res.data : res.data?.content || res.data?.data || [];
      return data.map(normalize);
    } catch (err) {
      console.warn('[cinemaService] getAll failed, using mock data:', err.message);
      return CINEMAS;
    }
  },

  /** Lấy chi tiết rạp — GET /api/v1/cinemas/{id} */
  getById: async (id) => {
    try {
      const res = await api.get(`/v1/cinemas/${id}`);
      return normalize(res.data);
    } catch (err) {
      console.warn('[cinemaService] getById failed, using mock data:', err.message);
      return CINEMAS.find((c) => c.id === Number(id)) || null;
    }
  },

  /** Thêm rạp (Admin) — POST /api/v1/cinemas */
  create: async (payload) => {
    const res = await api.post('/v1/cinemas', payload);
    return normalize(res.data);
  },

  /** Cập nhật rạp (Admin) — PUT /api/v1/cinemas/{id} */
  update: async (id, payload) => {
    const res = await api.put(`/v1/cinemas/${id}`, payload);
    return normalize(res.data);
  },

  /** Xoá rạp (Admin) — DELETE /api/v1/cinemas/{id} */
  remove: async (id) => {
    await api.delete(`/v1/cinemas/${id}`);
  },
};

export default cinemaService;
