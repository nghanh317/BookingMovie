/**
 * slotService.js
 * Quản lý API suất chiếu (Slots)
 *
 * GET    /api/v1/slots          — Danh sách tất cả suất chiếu (pageable)
 * GET    /api/v1/slots/{id}     — Chi tiết một suất chiếu
 * POST   /api/v1/slots          — Tạo suất chiếu mới (Admin)
 * PUT    /api/v1/slots/{id}     — Cập nhật suất chiếu (Admin)
 * DELETE /api/v1/slots/{id}     — Xoá suất chiếu (Admin)
 *
 * SlotDTO: {
 *   id, movieId, movieName, roomId, roomName,
 *   cinemaName, provinceName,
 *   showTime ("yyyy-MM-dd HH:mm:ss"), endTime ("yyyy-MM-dd HH:mm:ss"),
 *   price, emptySeats, createDate
 * }
 */
import api from './api';

const slotService = {
  /**
   * Lấy danh sách suất chiếu — GET /api/v1/slots
   * @param {object} params - query params: page, size, sort, search (SlotFilterForm)
   */
  getAll: async (params = {}) => {
    const res = await api.get('/v1/slots', { params });
    // Backend trả về Page<SlotDTO> → data nằm trong res.data.content
    return res.data;
  },

  /** Lấy chi tiết suất chiếu — GET /api/v1/slots/{id} */
  getById: async (id) => {
    const res = await api.get(`/v1/slots/${id}`);
    return res.data;
  },

  /**
   * Tạo suất chiếu mới (Admin) — POST /api/v1/slots
   * Body: { movieId, roomId, showTime, endTime, price }
   */
  create: async (payload) => {
    const res = await api.post('/v1/slots', payload);
    return res.data;
  },

  /**
   * Cập nhật suất chiếu (Admin) — PUT /api/v1/slots/{id}
   * Body: { movieId, roomId, showTime, endTime, price }
   */
  update: async (id, payload) => {
    const res = await api.put(`/v1/slots/${id}`, payload);
    return res.data;
  },

  /** Xoá suất chiếu (Admin) — DELETE /api/v1/slots/{id} */
  remove: async (id) => {
    await api.delete(`/v1/slots/${id}`);
  },
};

export default slotService;
