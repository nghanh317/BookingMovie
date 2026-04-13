import axiosClient from './axiosClient';

const seatApi = {
  /**
   * Lấy danh sách ghế
   * GET /api/v1/seats?page=0&size=200
   * Response: Page<SeatDTO>
   */
  getAll: (params = {}) => {
    return axiosClient.get('/api/v1/seats', { params });
  },

  /**
   * Lấy chi tiết 1 ghế
   * GET /api/v1/seats/{id}
   */
  getById: (id) => {
    return axiosClient.get(`/api/v1/seats/${id}`);
  },

  create: (data) => axiosClient.post('/api/v1/seats', data),
  update: (id, data) => axiosClient.put(`/api/v1/seats/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/v1/seats/${id}`),
};

export default seatApi;

export const seatTypeApi = {
  /**
   * Lấy danh sách loại ghế + giá
   * GET /api/v1/seatTypes
   * Response: Page<SeatTypeDTO> { id, typeName, priceMultiplier, description }
   */
  getAll: (params = {}) => {
    return axiosClient.get('/api/v1/seatTypes', { params });
  },

  getById: (id) => axiosClient.get(`/api/v1/seatTypes/${id}`),
  create: (data) => axiosClient.post('/api/v1/seatTypes', data),
  update: (id, data) => axiosClient.put(`/api/v1/seatTypes/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/v1/seatTypes/${id}`),
};
