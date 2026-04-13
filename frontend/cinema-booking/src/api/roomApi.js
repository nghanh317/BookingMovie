import axiosClient from './axiosClient';

const roomApi = {
  /**
   * Lấy danh sách phòng chiếu (phân trang + filter)
   * GET /api/v1/rooms?page=0&size=50
   * Response: Page<RoomDTO> - mỗi room có danh sách seats
   */
  getAll: (params = {}) => {
    return axiosClient.get('/api/v1/rooms', { params });
  },

  /**
   * Lấy chi tiết phòng chiếu (kèm danh sách ghế)
   * GET /api/v1/rooms/{id}
   * Response: RoomDTO { id, cinemasName, roomName, roomType, totalSeats, status, seats[] }
   */
  getById: (id) => {
    return axiosClient.get(`/api/v1/rooms/${id}`);
  },

  create: (data) => axiosClient.post('/api/v1/rooms', data),
  update: (id, data) => axiosClient.put(`/api/v1/rooms/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/v1/rooms/${id}`),
  recalculateSeats: (id) => axiosClient.put(`/api/v1/rooms/${id}/recalculate-seats`),
};

export default roomApi;
