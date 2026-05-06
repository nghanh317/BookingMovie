/**
 * paymentService.js
 * Quản lý API thanh toán (Payments)
 *
 * POST /api/v1/payments/vnpay — Tạo thanh toán VNPay
 * POST /api/v1/payments/momo  — Tạo thanh toán MoMo
 *
 * PaymentRequestDTO: { ticketId, amount, ... }
 */
import api from './api';

const paymentService = {
  /**
   * Tạo thanh toán VNPay — POST /api/v1/payments/vnpay
   * @param {object} payload - PaymentRequestDTO
   * @returns {Promise<object>} URL thanh toán hoặc response
   */
  createVNPay: async (payload) => {
    const res = await api.post('/v1/payments/vnpay', payload);
    return res.data;
  },

  /**
   * Tạo thanh toán MoMo — POST /api/v1/payments/momo
   * @param {object} payload - PaymentRequestDTO
   * @returns {Promise<object>} URL thanh toán hoặc response
   */
  createMoMo: async (payload) => {
    const res = await api.post('/v1/payments/momo', payload);
    return res.data;
  },
};

export default paymentService;
