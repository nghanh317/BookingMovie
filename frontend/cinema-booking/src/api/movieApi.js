import axiosClient from './axiosClient';

const movieApi = {
  /**
   * Lấy danh sách phim (có phân trang + filter)
   * GET /api/v1/movies?page=0&size=20&search=...&status=...
   * Response: Page<MovieDTO>
   */
  getAll: (params = {}) => {
    return axiosClient.get('/api/v1/movies', { params });
  },

  /**
   * Lấy chi tiết 1 phim
   * GET /api/v1/movies/{id}
   * Response: MovieDTO
   */
  getById: (id) => {
    return axiosClient.get(`/api/v1/movies/${id}`);
  },

  /**
   * Lấy danh sách ngày chiếu của phim
   * GET /api/v1/movies/{id}/dates
   * Response: List<DateDTO>
   */
  getShowDates: (id) => {
    return axiosClient.get(`/api/v1/movies/${id}/dates`);
  },

  /**
   * Tạo phim mới (ADMIN)
   * POST /api/v1/movies
   */
  create: (data) => {
    return axiosClient.post('/api/v1/movies', data);
  },

  /**
   * Cập nhật phim (ADMIN)
   * PUT /api/v1/movies/{id}
   */
  update: (id, data) => {
    return axiosClient.put(`/api/v1/movies/${id}`, data);
  },

  /**
   * Xoá phim (ADMIN)
   * DELETE /api/v1/movies/{id}
   */
  delete: (id) => {
    return axiosClient.delete(`/api/v1/movies/${id}`);
  },
};

export default movieApi;
