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
  provinceId: cinema.province?.id || cinema.provinceId || '',
  province: cinema.province?.provinceName || cinema.provincesName || cinema.provinceName || cinema.province || '',
  image: cinema.image || cinema.imgUrl || cinema.imageUrl || '',
  latitude: cinema.latitude ? parseFloat(cinema.latitude) : null,
  longitude: cinema.longitude ? parseFloat(cinema.longitude) : null,
  phone: cinema.phone || '',
  email: cinema.email || '',
  screens: parseInt(cinema.screens || cinema.numberOfScreens) || (cinema.rooms && Array.isArray(cinema.rooms) ? cinema.rooms.length : 0),
  rating: parseFloat(cinema.rating) || (4.5 + ((cinema.id || 0) % 5) / 10),
  rooms: cinema.rooms || [],
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
    const res = await api.post('/v1/cinemas', {
      cinemaName: payload.name,
      address: payload.address,
      provinceId: payload.provinceId,
      imageUrl: payload.image,
      phone: payload.phone || "0924783748",
      email: payload.email || "lottebn@gmail.com",
      latitude: payload.latitude || null,
      longitude: payload.longitude || null
    });
    return res.data ? normalize(res.data) : null;
  },

  /** Cập nhật rạp (Admin) — PUT /api/v1/cinemas/{id} */
  update: async (id, payload) => {
    const res = await api.put(`/v1/cinemas/${id}`, {
      cinemaName: payload.name,
      address: payload.address,
      provinceId: payload.provinceId,
      imageUrl: payload.image,
      phone: payload.phone || "0924783748",
      email: payload.email || "lottebn@gmail.com",
      latitude: payload.latitude || null,
      longitude: payload.longitude || null
    });
    return res.data ? normalize(res.data) : null;
  },

  /** Xoá rạp (Admin) — DELETE /api/v1/cinemas/{id} */
  remove: async (id) => {
    await api.delete(`/v1/cinemas/${id}`);
  },
};

export default cinemaService;
