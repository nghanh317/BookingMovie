/**
 * seatLockService.js
 * Quản lý khoá ghế tạm thời (SeatLock) với backend
 *
 * POST   /api/v1/seat-locks/lock      — Khoá ghế khi user nhấn Tiếp tục
 * DELETE /api/v1/seat-locks/release   — Giải phóng ghế
 * GET    /api/v1/seat-locks?slotId=   — Danh sách ghế đang bị khoá
 * GET    /api/v1/seat-locks/my-expiry — Thời gian lock của user
 */
import api from './api';

const seatLockService = {
  /**
   * Khoá ghế cho user trong suất chiếu.
   * Gọi khi user nhấn "Tiếp tục" sau khi chọn ghế.
   * @param {number} accountId
   * @param {number} slotId
   * @param {number[]} seatIds
   * @returns {{ success, expiresAt, message }}
   */
  lockSeats: async (accountId, slotId, seatIds) => {
    const res = await api.post('/v1/seat-locks/lock', { accountId, slotId, seatIds });
    return res.data;
  },

  /**
   * Giải phóng ghế (khi user hủy chọn hoặc trang đóng).
   */
  releaseSeats: async (accountId, slotId) => {
    await api.delete('/v1/seat-locks/release', { params: { accountId, slotId } });
  },

  /**
   * Lấy danh sách ghế đang bị khoá trong suất chiếu.
   * Poll định kỳ để cập nhật map ghế cho tất cả user.
   * @returns {Array<{ seatId, accountId, slotId, expiresAt }>}
   */
  getLockedSeats: async (slotId) => {
    const res = await api.get('/v1/seat-locks', { params: { slotId } });
    return res.data;
  },

  /**
   * Lấy thời gian hết hạn lock của user hiện tại.
   * @returns {{ expiresAt: string | null }}
   */
  getMyExpiry: async (accountId, slotId) => {
    const res = await api.get('/v1/seat-locks/my-expiry', { params: { accountId, slotId } });
    return res.data;
  },

  /**
   * Gia hạn lock ghế thêm 10 phút — gọi khi user bấm "Tiếp tục" / "Thanh toán"
   * @returns {{ success, expiresAt, message }}
   */
  extendLock: async (accountId, slotId) => {
    const res = await api.post('/v1/seat-locks/extend', { accountId, slotId });
    return res.data;
  },
};

export default seatLockService;
