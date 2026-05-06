import axiosClient from './axiosClient';

const movieApi = {
  /**
   * Lấy danh sách phim (có phân trang + filter)
   * GET /api/v1/movies?page=0&size=20
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
   * Tạo phim mới (ADMIN)
   * POST /api/v1/movies
   * Body: { title, description, duration, releaseDate, director, cast, genre, language, posterUrl? }
   */
  create: (data) => {
    return axiosClient.post('/api/v1/movies', data);
  },

  /**
   * Cập nhật phim (ADMIN)
   * PUT /api/v1/movies/{id}
   * Body: { title, description, duration, releaseDate, director, cast, genre, language, posterUrl? }
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
