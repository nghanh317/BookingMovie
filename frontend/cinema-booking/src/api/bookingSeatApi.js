import axiosClient from './axiosClient';

const bookingSeatApi = {
  /**
   * Lấy danh sách ghế đã đặt (phân trang + filter)
   * GET /api/v1/bookingSeats?page=0&size=200
   * Response: Page<BookingSeatDTO>
   */
  getAll: (params = {}) => {
    return axiosClient.get('/api/v1/bookingSeats', { params });
  },

  /**
   * Lấy chi tiết booking seat
   * GET /api/v1/bookingSeats/{id}
   */
  getById: (id) => {
    return axiosClient.get(`/api/v1/bookingSeats/${id}`);
  },

  /**
   * Đặt ghế
   * POST /api/v1/bookingSeats
   */
  create: (data) => {
    return axiosClient.post('/api/v1/bookingSeats', data);
  },
};

export default bookingSeatApi;
