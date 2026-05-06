/**
 * promotionService.js
 * Quản lý API khuyến mãi (Promotions)
 *
 * GET    /api/v1/promotions          — Danh sách khuyến mãi (pageable + filter)
 * POST   /api/v1/promotions          — Tạo khuyến mãi mới (Admin)
 * PUT    /api/v1/promotions/{id}     — Cập nhật khuyến mãi (Admin)
 * DELETE /api/v1/promotions/{id}     — Xoá khuyến mãi (Admin)
 *
 * PromotionDTO: {
 *   id, promotionCode, promotionName, description,
 *   discountType ("PERCENTAGE"|"FIXED"),
 *   discountValue, maxDiscountAmount, minOrderAmount,
 *   usageLimit, usageCount, usagePerUser,
 *   startDate, endDate,
 *   applicableDay, applicableMovie, applicableCinema,
 *   status ("ACTIVE"|"INACTIVE"|...),
 *   imageUrl, createDate, updateDate
 * }
 */
import api from './api';

const promotionService = {
  /**
   * Lấy danh sách khuyến mãi — GET /api/v1/promotions
   * @param {object} params - query params: page, size, sort, search
   */
  getAll: async (params = {}) => {
    const res = await api.get('/v1/promotions', { params });
    return res.data;
  },

  /** Tạo khuyến mãi mới (Admin) — POST /api/v1/promotions */
  create: async (payload) => {
    const res = await api.post('/v1/promotions', payload);
    return res.data;
  },

  /** Cập nhật khuyến mãi (Admin) — PUT /api/v1/promotions/{id} */
  update: async (id, payload) => {
    const res = await api.put(`/v1/promotions/${id}`, payload);
    return res.data;
  },

  /** Xoá khuyến mãi (Admin) — DELETE /api/v1/promotions/{id} */
  remove: async (id) => {
    await api.delete(`/v1/promotions/${id}`);
  },
};

export default promotionService;
