import axiosClient from './axiosClient';

const promotionApi = {
  /**
   * Lấy danh sách khuyến mãi (phân trang + filter)
   * GET /api/v1/promotions?page=0&size=20
   * Response: Page<PromotionDTO>
   */
  getAll: (params = {}) => axiosClient.get('/api/v1/promotions', { params }),

  /**
   * Lấy chi tiết 1 khuyến mãi
   * GET /api/v1/promotions/{id}
   */
  getById: (id) => axiosClient.get(`/api/v1/promotions/${id}`),

  /**
   * Tạo khuyến mãi mới (ADMIN)
   * POST /api/v1/promotions
   */
  create: (data) => axiosClient.post('/api/v1/promotions', data),

  /**
   * Cập nhật khuyến mãi (ADMIN)
   * PUT /api/v1/promotions/{id}
   */
  update: (id, data) => axiosClient.put(`/api/v1/promotions/${id}`, data),

  /**
   * Xoá khuyến mãi (ADMIN)
   * DELETE /api/v1/promotions/{id}
   */
  delete: (id) => axiosClient.delete(`/api/v1/promotions/${id}`),
};

export default promotionApi;
