import axiosClient from './axiosClient';

const slotApi = {
  /**
   * Lấy danh sách suất chiếu (phân trang + filter)
   * GET /api/v1/slots?page=0&size=50&movieId=...&roomId=...
   * Response: Page<SlotDTO>
   * SlotDTO: { id, movieId, movieName, roomId, roomName, cinemaName, provinceName,
   *            showTime, endTime, price, emptySeats, createDate }
   */
  getAll: (params = {}) => {
    return axiosClient.get('/api/v1/slots', { params });
  },

  /**
   * Lấy chi tiết 1 suất chiếu
   * GET /api/v1/slots/{id}
   */
  getById: (id) => {
    return axiosClient.get(`/api/v1/slots/${id}`);
  },

  create: (data) => axiosClient.post('/api/v1/slots', data),
  update: (id, data) => axiosClient.put(`/api/v1/slots/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/v1/slots/${id}`),
};

export default slotApi;
