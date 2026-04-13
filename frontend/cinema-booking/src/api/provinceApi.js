import axiosClient from './axiosClient';

const provinceApi = {
  /**
   * Lấy danh sách tỉnh/thành (phân trang + filter)
   * GET /api/v1/provinces?page=0&size=100
   * Response: Page<ProvinceDTO>
   */
  getAll: (params = {}) => {
    return axiosClient.get('/api/v1/provinces', { params });
  },

  /**
   * Lấy 1 tỉnh/thành
   * GET /api/v1/provinces/{id}
   */
  getById: (id) => {
    return axiosClient.get(`/api/v1/provinces/${id}`);
  },

  /**
   * Lấy danh sách rạp thuộc 1 tỉnh/thành
   * GET /api/v1/provinces/{id}/cinemas
   * Response: Page<CinemaDTO>
   */
  getCinemasByProvinceId: (id, params = {}) => {
    return axiosClient.get(`/api/v1/provinces/${id}/cinemas`, { params });
  },

  create: (data) => axiosClient.post('/api/v1/provinces', data),
  update: (id, data) => axiosClient.put(`/api/v1/provinces/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/v1/provinces/${id}`),
};

export default provinceApi;
