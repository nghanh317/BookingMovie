/**
 * ticketService.js
 * Quản lý API vé (Tickets)
 *
 * GET    /api/v1/tickets          — Danh sách vé (pageable)
 * GET    /api/v1/tickets/{id}     — Chi tiết một vé
 * POST   /api/v1/tickets          — Tạo vé mới (Đặt vé)
 * PUT    /api/v1/tickets/{id}     — Cập nhật vé
 * DELETE /api/v1/tickets/{id}     — Xoá vé
 *
 * CreateTicketForm: {
 *   accountsId: number,
 *   slotsId: number,
 *   discountAmount: number,
 *   note: string,
 *   seats: [{ seatId: number }],
 *   products: [{ productId: number, quantity: number }]
 * }
 *
 * TicketDTO: {
 *   id, accountsId, accountsFullName, slotsId,
 *   ticketsCode, qrCodeUrl, qrCodeData, ticketsDate,
 *   totalAmount, discountAmount, finalAmount,
 *   paymentStatus ("PAID"|"UNPAID"),
 *   status ("PENDING"|"CONFIRMED"|"CANCELLED"),
 *   note,
 *   ticketsDetails: [{ id, productsName, quantity, unitPrice, totalPrice }],
 *   seats: [{ seatsId, seatsRow, seatsNumber, seatTypes, priceMultiplier, seatPrice }]
 * }
 */
import api from './api';

const ticketService = {
  /**
   * Lấy danh sách vé — GET /api/v1/tickets
   * @param {object} params - query params: page, size, sort
   */
  getAll: async (params = {}) => {
    const res = await api.get('/v1/tickets', { params });
    return res.data;
  },

  /** Chi tiết một vé — GET /api/v1/tickets/{id} */
  getById: async (id, params = {}) => {
    const res = await api.get(`/v1/tickets/${id}`, { params });
    return res.data;
  },

  /**
   * Tạo vé mới (Đặt vé) — POST /api/v1/tickets
   * @param {object} payload - CreateTicketForm
   * @param {number} payload.accountsId  - ID tài khoản
   * @param {number} payload.slotsId     - ID suất chiếu (slot)
   * @param {number} payload.discountAmount - Số tiền giảm giá
   * @param {string} payload.note        - Ghi chú
   * @param {Array<{seatId: number}>} payload.seats     - Danh sách ghế
   * @param {Array<{productId: number, quantity: number}>} payload.products - Danh sách sản phẩm
   */
  create: async (payload) => {
    const res = await api.post('/v1/tickets', payload);
    return res.data;
  },

  /**
   * Cập nhật vé — PUT /api/v1/tickets/{id}
   * Body: UpdateTicketForm
   */
  update: async (id, payload) => {
    const res = await api.put(`/v1/tickets/${id}`, payload);
    return res.data;
  },

  /** Xoá vé — DELETE /api/v1/tickets/{id} */
  remove: async (id) => {
    await api.delete(`/v1/tickets/${id}`);
  },
};

export default ticketService;
