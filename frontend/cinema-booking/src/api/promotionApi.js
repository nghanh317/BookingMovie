import axiosClient from './axiosClient';

const promotionApi = {
  /**
   * Lấy danh sách khuyến mãi (phân trang + filter)
   * GET /api/v1/promotions?page=0&size=20
   * Response: Page<PromotionDTO>
   */
  getAll: (params = {}) => {
    return axiosClient.get('/api/v1/promotions', { params });
  },

  create: (data) => axiosClient.post('/api/v1/promotions', data),
  update: (id, data) => axiosClient.put(`/api/v1/promotions/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/v1/promotions/${id}`),
};

export default promotionApi;
