import axiosClient from './axiosClient';

const roomApi = {
  /**
   * Lấy danh sách phòng chiếu (phân trang + filter)
   * GET /api/v1/rooms?page=0&size=50
   * Response: Page<RoomDTO>
   * RoomDTO: { id, cinemasName, roomName, roomType, totalSeats, status, seats[] }
   */
  getAll: (params = {}) => {
    return axiosClient.get('/api/v1/rooms', { params });
  },

  /**
   * Lấy chi tiết phòng chiếu (kèm danh sách ghế)
   * GET /api/v1/rooms/{id}
   * Response: RoomDTO
   */
  getById: (id) => {
    return axiosClient.get(`/api/v1/rooms/${id}`);
  },

  /**
   * Tạo phòng chiếu mới (ADMIN)
   * POST /api/v1/rooms
   * Body: { roomName, roomType, cinemaId, totalSeats? }
   */
  create: (data) => axiosClient.post('/api/v1/rooms', data),

  /**
   * Cập nhật phòng chiếu (ADMIN)
   * PUT /api/v1/rooms/{id}
   * Body: { roomName, roomType, totalSeats? }
   */
  update: (id, data) => axiosClient.put(`/api/v1/rooms/${id}`, data),

  /**
   * Xoá phòng chiếu (ADMIN)
   * DELETE /api/v1/rooms/{id}
   */
  delete: (id) => axiosClient.delete(`/api/v1/rooms/${id}`),
};

export default roomApi;
