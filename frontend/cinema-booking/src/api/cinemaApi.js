import axiosClient from './axiosClient';

const cinemaApi = {
  /**
   * Lấy danh sách rạp (phân trang + filter)
   * GET /api/v1/cinemas?page=0&size=20
   * Response: Page<CinemaDTO>
   * CinemaDTO: { id, provinceId, provincesName, cinemaName, address, latitude, longitude,
   *              status, phone, email, createDate, rooms[] }
   */
  getAll: (params = {}) => {
    return axiosClient.get('/api/v1/cinemas', { params });
  },

  /**
   * Lấy chi tiết 1 rạp (kèm danh sách rooms + slots)
   * GET /api/v1/cinemas/{id}
   * Response: CinemaDTO
   */
  getById: (id) => {
    return axiosClient.get(`/api/v1/cinemas/${id}`);
  },

  /**
   * Tạo rạp mới (ADMIN)
   * POST /api/v1/cinemas
   * Body: { cinemaName, address, phone, email, provinceId, latitude?, longitude? }
   */
  create: (data) => {
    return axiosClient.post('/api/v1/cinemas', data);
  },

  /**
   * Cập nhật rạp (ADMIN)
   * PUT /api/v1/cinemas/{id}
   * Body: { cinemaName, address, phone, email, provinceId?, latitude?, longitude? }
   */
  update: (id, data) => {
    return axiosClient.put(`/api/v1/cinemas/${id}`, data);
  },

  /**
   * Xoá rạp (ADMIN) — soft delete (isDeleted = true)
   * DELETE /api/v1/cinemas/{id}
   */
  delete: (id) => {
    return axiosClient.delete(`/api/v1/cinemas/${id}`);
  },
};

export default cinemaApi;
