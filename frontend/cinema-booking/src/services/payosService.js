/**
 * payosService.js — Giao tiếp với PayOS qua Backend
 */
import api from './api';

const payosService = {
  /**
   * Tạo link thanh toán PayOS
   * @param {number} ticketId
   * @returns {Promise<string>} checkoutUrl
   */
  createPaymentLink: async (ticketId) => {
    const res = await api.post('/v1/payos/create-link', { ticketId });
    return res.data;
  },

  /**
   * Sync payment status from PayOS
   * @param { number } ticketId
   */
  syncPayment: async (ticketId) => {
    const res = await api.post(`/v1/payos/sync/${ticketId}`);
    return res.data;
  }
};

export default payosService;
