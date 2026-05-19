/**
 * seatHoldStore.js
 * Quản lý trạng thái "giữ ghế" trong quá trình đặt vé.
 * Ghế được giữ trong 5 phút. Sau đó tự động giải phóng.
 * Dùng localStorage để đồng bộ giữa nhiều tab/session.
 */
import { create } from 'zustand';

const HOLD_DURATION_MS = 5 * 60 * 1000; // 5 phút
const STORAGE_KEY = 'cinema-seat-holds';

// ── localStorage helpers ──────────────────────────────────────────────────

function readHolds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const holds = raw ? JSON.parse(raw) : [];
    // Lọc bỏ các hold đã hết hạn
    const now = Date.now();
    return holds.filter((h) => h.expiresAt > now);
  } catch {
    return [];
  }
}

function writeHolds(holds) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(holds));
  } catch { /* ignore */ }
}

// ── Store ─────────────────────────────────────────────────────────────────

const useSeatHoldStore = create((set, get) => ({
  /**
   * holds: mảng { showtimeId, seats: string[], userId, expiresAt, heldAt }
   * Đọc từ localStorage mỗi lần cần, để đồng bộ giữa các tab
   */

  /**
   * Lấy danh sách tất cả ghế đang bị giữ cho một suất chiếu
   * Trả về: [{ seatId, userId, expiresAt, remainingMs }]
   */
  getHeldSeats: (showtimeId) => {
    const holds = readHolds();
    const result = [];
    const now = Date.now();
    holds
      .filter((h) => h.showtimeId === showtimeId)
      .forEach((h) => {
        h.seats.forEach((seatId) => {
          result.push({
            seatId,
            userId: h.userId,
            expiresAt: h.expiresAt,
            remainingMs: h.expiresAt - now,
          });
        });
      });
    return result;
  },

  /**
   * Giữ các ghế cho user trong 5 phút
   * @param {string|number} showtimeId
   * @param {string[]} seats - danh sách seatId (e.g. ['A1','A2'])
   * @param {string|number} userId
   * @returns {{ success: boolean, message?: string }}
   */
  holdSeats: (showtimeId, seats, userId) => {
    const holds = readHolds();
    const now = Date.now();

    // Kiểm tra các ghế có đang bị người khác giữ không
    const conflictSeats = [];
    holds
      .filter((h) => h.showtimeId === showtimeId && h.userId !== String(userId))
      .forEach((h) => {
        h.seats.forEach((s) => {
          if (seats.includes(s)) conflictSeats.push(s);
        });
      });

    if (conflictSeats.length > 0) {
      return {
        success: false,
        message: `Ghế ${conflictSeats.join(', ')} đang được người khác giữ. Vui lòng chọn ghế khác.`,
      };
    }

    // Xóa hold cũ của user cho suất chiếu này
    const filtered = holds.filter(
      (h) => !(h.showtimeId === showtimeId && h.userId === String(userId))
    );

    if (seats.length > 0) {
      filtered.push({
        showtimeId,
        seats,
        userId: String(userId),
        heldAt: now,
        expiresAt: now + HOLD_DURATION_MS,
      });
    }

    writeHolds(filtered);
    set({ _tick: Date.now() }); // trigger re-render
    return { success: true };
  },

  /**
   * Giải phóng ghế của user cho suất chiếu
   */
  releaseSeats: (showtimeId, userId) => {
    const holds = readHolds().filter(
      (h) => !(h.showtimeId === showtimeId && h.userId === String(userId))
    );
    writeHolds(holds);
    set({ _tick: Date.now() });
  },

  /**
   * Lấy thời gian còn lại (ms) của hold hiện tại của user
   * @returns {number} milliseconds còn lại, 0 nếu không có hold
   */
  getRemainingTime: (showtimeId, userId) => {
    const holds = readHolds();
    const myHold = holds.find(
      (h) => h.showtimeId === showtimeId && h.userId === String(userId)
    );
    if (!myHold) return 0;
    return Math.max(0, myHold.expiresAt - Date.now());
  },

  // Internal tick để trigger re-render
  _tick: 0,
  _forceUpdate: () => set({ _tick: Date.now() }),
}));

export default useSeatHoldStore;
export { HOLD_DURATION_MS };
