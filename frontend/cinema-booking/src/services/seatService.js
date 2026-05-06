/**
 * seatService.js
 * Quản lý API ghế ngồi (Seats)
 *
 * GET    /api/v1/seats          — Danh sách tất cả ghế (pageable)
 * GET    /api/v1/seats/{id}     — Chi tiết một ghế
 * POST   /api/v1/seats          — Tạo ghế mới (Admin)
 * PUT    /api/v1/seats/{id}     — Cập nhật ghế (Admin)
 * DELETE /api/v1/seats/{id}     — Xoá ghế (Admin)
 *
 * SeatDTO: {
 *   id, roomsId, roomsName,
 *   seatRow, seatNumber,
 *   seatTypesId, seatTypeName,
 *   status ("AVAILABLE"|"BOOKED"|...)
 * }
 */
import api from './api';

const seatService = {
  /**
   * Lấy danh sách ghế — GET /api/v1/seats
   * @param {object} params - query params: page, size, sort
   */
  getAll: async (params = {}) => {
    const res = await api.get('/v1/seats', { params });
    return res.data;
  },

  /** Chi tiết một ghế — GET /api/v1/seats/{id} */
  getById: async (id) => {
    const res = await api.get(`/v1/seats/${id}`);
    return res.data;
  },

  /** Tạo ghế mới (Admin) — POST /api/v1/seats */
  create: async (payload) => {
    const res = await api.post('/v1/seats', payload);
    return res.data;
  },

  /** Cập nhật ghế (Admin) — PUT /api/v1/seats/{id} */
  update: async (id, payload) => {
    const res = await api.put(`/v1/seats/${id}`, payload);
    return res.data;
  },

  /** Xoá ghế (Admin) — DELETE /api/v1/seats/{id} */
  remove: async (id) => {
    await api.delete(`/v1/seats/${id}`);
  },
};

export default seatService;
