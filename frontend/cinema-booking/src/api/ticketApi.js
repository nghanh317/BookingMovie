import axiosClient from './axiosClient';

const ticketApi = {
  /**
   * Lấy danh sách vé (phân trang + filter)
   * GET /api/v1/tickets?page=0&size=20
   * Response: Page<TicketDTO>
   */
  getAll: (params = {}) => {
    return axiosClient.get('/api/v1/tickets', { params });
  },

  /**
   * Lấy chi tiết 1 vé
   * GET /api/v1/tickets/{id}
   * Response: TicketDTO { id, accountsId, slotsId, ticketsCode, totalAmount, ...
   *                        ticketsDetails[], seats[] }
   */
  getById: (id) => {
    return axiosClient.get(`/api/v1/tickets/${id}`);
  },

  /**
   * Tạo vé mới (đặt vé)
   * POST /api/v1/tickets
   */
  create: (data) => {
    return axiosClient.post('/api/v1/tickets', data);
  },

  /**
   * Tạo url thanh toán VNPay / MoMo
   * POST /api/v1/payments/{method}
   */
  createPaymentUrl: (method, data) => {
    return axiosClient.post(`/api/v1/payments/${method}`, data);
  },

  /**
   * Cập nhật vé
   * PUT /api/v1/tickets/{id}
   */
  update: (id, data) => {
    return axiosClient.put(`/api/v1/tickets/${id}`, data);
  },

  /**
   * Xoá vé
   * DELETE /api/v1/tickets/{id}
   */
  delete: (id) => {
    return axiosClient.delete(`/api/v1/tickets/${id}`);
  },
};

export default ticketApi;

export const ticketDetailApi = {
  getAll: (params = {}) => axiosClient.get('/api/v1/ticketDetails', { params }),
  getById: (id) => axiosClient.get(`/api/v1/ticketDetails/${id}`),
  create: (data) => axiosClient.post('/api/v1/ticketDetails', data),
};
