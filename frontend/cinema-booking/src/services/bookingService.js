/**
 * bookingService.js
 * Quản lý API đặt ghế
 *
 * POST /api/v1/bookingSeats  — Body: { ticketsId, seatsId, seatPrice }
 * GET  /api/v1/bookingSeats  — Danh sách ghế đã đặt (Admin)
 * GET  /api/v1/bookingSeats/{id} — Chi tiết đặt ghế (ALL)
 */
import api from './api';

const bookingService = {
  /**
   * Đặt ghế — POST /api/v1/bookingSeats
   * @param {number} ticketsId   - ID của ticket/showtime
   * @param {number} seatsId     - ID của ghế
   * @param {number} seatPrice   - Giá ghế
   */
  create: async ({ ticketsId, seatsId, seatPrice }) => {
    const res = await api.post('/v1/bookingSeats', {
      ticketsId,
      seatsId,
      seatPrice,
    });
    return res.data;
  },

  /**
   * Đặt nhiều ghế cùng lúc (gọi nhiều lần POST)
   * @param {number} ticketsId
   * @param {Array<{seatsId: number, seatPrice: number}>} seats
   */
  createMultiple: async (ticketsId, seats) => {
    const results = await Promise.all(
      seats.map(({ seatsId, seatPrice }) =>
        bookingService.create({ ticketsId, seatsId, seatPrice })
      )
    );
    return results;
  },

  /** Lấy danh sách ghế đã đặt (Admin) — GET /api/v1/bookingSeats */
  getAll: async () => {
    const res = await api.get('/v1/bookingSeats');
    return res.data;
  },

  /** Chi tiết đặt ghế — GET /api/v1/bookingSeats/{id} */
  getById: async (id) => {
    const res = await api.get(`/v1/bookingSeats/${id}`);
    return res.data;
  },
};

export default bookingService;
