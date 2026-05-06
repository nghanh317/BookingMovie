/**
 * seatTypeService.js
 * Quản lý API loại ghế (SeatTypes)
 *
 * GET    /api/v1/seatTypes          — Danh sách loại ghế (pageable)
 * GET    /api/v1/seatTypes/{id}     — Chi tiết loại ghế
 * POST   /api/v1/seatTypes          — Tạo loại ghế (Admin)
 * PUT    /api/v1/seatTypes/{id}     — Cập nhật loại ghế (Admin)
 * DELETE /api/v1/seatTypes/{id}     — Xoá loại ghế (Admin)
 *
 * SeatTypeDTO: { id, ... }
 */
import api from './api';

const seatTypeService = {
  /** Lấy danh sách loại ghế — GET /api/v1/seatTypes */
  getAll: async (params = {}) => {
    const res = await api.get('/v1/seatTypes', { params });
    return res.data;
  },

  /** Chi tiết loại ghế — GET /api/v1/seatTypes/{id} */
  getById: async (id) => {
    const res = await api.get(`/v1/seatTypes/${id}`);
    return res.data;
  },

  /** Tạo loại ghế (Admin) — POST /api/v1/seatTypes */
  create: async (payload) => {
    const res = await api.post('/v1/seatTypes', payload);
    return res.data;
  },

  /** Cập nhật loại ghế (Admin) — PUT /api/v1/seatTypes/{id} */
  update: async (id, payload) => {
    const res = await api.put(`/v1/seatTypes/${id}`, payload);
    return res.data;
  },

  /** Xoá loại ghế (Admin) — DELETE /api/v1/seatTypes/{id} */
  remove: async (id) => {
    await api.delete(`/v1/seatTypes/${id}`);
  },
};

export default seatTypeService;
