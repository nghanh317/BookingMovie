/**
 * roomService.js
 * Quản lý API phòng chiếu (Rooms)
 *
 * GET    /api/v1/rooms                       — Danh sách phòng (pageable + filter)
 * GET    /api/v1/rooms/{id}                  — Chi tiết phòng (kèm danh sách ghế)
 * POST   /api/v1/rooms                       — Tạo phòng mới (Admin)
 * PUT    /api/v1/rooms/{id}                  — Cập nhật phòng (Admin)
 * DELETE /api/v1/rooms/{id}                  — Xoá phòng (Admin)
 * PUT    /api/v1/rooms/{id}/recalculate-seats — Tính lại tổng ghế
 *
 * RoomDTO: {
 *   id, cinemasName, roomName, roomType, totalSeats, status,
 *   seats: [{ id, seatRow, seatNumber, status, seatTypesName }]
 * }
 */
import api from './api';

const roomService = {
  /**
   * Lấy danh sách phòng — GET /api/v1/rooms
   * @param {object} params - query params: page, size, sort, search (RoomFilterForm)
   */
  getAll: async (params = {}) => {
    const res = await api.get('/v1/rooms', { params });
    return res.data;
  },

  /**
   * Lấy chi tiết phòng (kèm seats) — GET /api/v1/rooms/{id}
   * Trả về RoomDTO với danh sách ghế bên trong
   */
  getById: async (id) => {
    const res = await api.get(`/v1/rooms/${id}`);
    return res.data;
  },

  /** Tạo phòng mới (Admin) — POST /api/v1/rooms */
  create: async (payload) => {
    const res = await api.post('/v1/rooms', payload);
    return res.data;
  },

  /** Cập nhật phòng (Admin) — PUT /api/v1/rooms/{id} */
  update: async (id, payload) => {
    const res = await api.put(`/v1/rooms/${id}`, payload);
    return res.data;
  },

  /** Xoá phòng (Admin) — DELETE /api/v1/rooms/{id} */
  remove: async (id) => {
    await api.delete(`/v1/rooms/${id}`);
  },

  /** Tính lại tổng ghế — PUT /api/v1/rooms/{id}/recalculate-seats */
  recalculateSeats: async (id) => {
    const res = await api.put(`/v1/rooms/${id}/recalculate-seats`);
    return res.data;
  },
};

export default roomService;
