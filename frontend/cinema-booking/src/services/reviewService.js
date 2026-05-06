/**
 * reviewService.js
 * Quản lý đánh giá & bình luận phim
 * - Dùng localStorage để lưu reviews (fallback khi chưa có API backend)
 * - Chỉ user đã có vé xem phim và qua giờ chiếu mới được đánh giá
 */
import { REVIEWS, SHOWTIMES } from '../constants/mockData';

const STORAGE_KEY = 'cinema-reviews';

// ── Helpers ──────────────────────────────────────────────────

/** Lấy reviews từ localStorage (kết hợp với mock data) */
const getAllFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const userReviews = stored ? JSON.parse(stored) : [];
    // Gộp mock data với reviews của user, tránh trùng id
    const mockIds = new Set(REVIEWS.map((r) => r.id));
    const filtered = userReviews.filter((r) => !mockIds.has(r.id));
    return [...REVIEWS, ...filtered];
  } catch {
    return REVIEWS;
  }
};

/** Lưu reviews vào localStorage (chỉ lưu reviews do user tạo, không lưu mock) */
const saveToStorage = (reviews) => {
  const mockIds = new Set(REVIEWS.map((r) => r.id));
  const userReviews = reviews.filter((r) => !mockIds.has(r.id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userReviews));
};

/** Format thời gian hiển thị */
export const formatReviewDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// ── Service ──────────────────────────────────────────────────

const reviewService = {
  /**
   * Lấy danh sách reviews của một phim
   * @param {number} movieId
   */
  getByMovieId: (movieId) => {
    const all = getAllFromStorage();
    return all
      .filter((r) => r.movieId === Number(movieId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  /**
   * Kiểm tra xem user có thể đánh giá phim không.
   * Điều kiện: đã có showtime booking + thời điểm chiếu đã qua.
   *
   * Vì chưa có API booking history, ta dùng mock logic:
   * - Giả lập: user có thể xem danh sách showtimes đã book (lưu trong localStorage key 'cinema-booked-showtimes')
   * - Nếu chưa có dữ liệu booking thực, fallback: cho phép đánh giá các phim có showtimes trong quá khứ
   *
   * @param {number|string} userId
   * @param {number|string} movieId
   * @returns {{ canReview: boolean, reason: string }}
   */
  canReview: (userId, movieId) => {
    if (!userId) {
      return { canReview: false, reason: 'Bạn cần đăng nhập để đánh giá phim.' };
    }

    const mid = Number(movieId);

    // Kiểm tra đã review chưa
    const all = getAllFromStorage();
    const alreadyReviewed = all.some(
      (r) => r.movieId === mid && r.userId === Number(userId)
    );
    if (alreadyReviewed) {
      return { canReview: false, reason: 'Bạn đã đánh giá phim này rồi.' };
    }

    // Kiểm tra booking history từ localStorage (do checkout flow lưu lại)
    let bookedShowtimeIds = [];
    try {
      const stored = localStorage.getItem('cinema-booked-showtimes');
      bookedShowtimeIds = stored ? JSON.parse(stored) : [];
    } catch { /* ignore */ }

    // Nếu có booking history thực → kiểm tra chặt
    if (bookedShowtimeIds.length > 0) {
      const now = new Date();
      const hasValidBooking = SHOWTIMES.some((s) => {
        if (s.movieId !== mid) return false;
        if (!bookedShowtimeIds.includes(s.id)) return false;
        // Kiểm tra thời gian chiếu đã qua chưa
        const showDateTime = new Date(`${s.date}T${s.time}:00`);
        return showDateTime < now;
      });

      if (!hasValidBooking) {
        return {
          canReview: false,
          reason: 'Bạn cần xem phim tại rạp trước khi đánh giá. Chỉ có thể đánh giá sau khi suất chiếu kết thúc.',
        };
      }
      return { canReview: true, reason: '' };
    }

    // Fallback (demo): cho phép đánh giá phim đang chiếu (status now_showing)
    // Trong production, bỏ fallback này và chỉ dùng booking history thực
    const movieShowtimes = SHOWTIMES.filter((s) => s.movieId === mid);
    if (movieShowtimes.length === 0) {
      return {
        canReview: false,
        reason: 'Phim này chưa có suất chiếu. Bạn cần xem phim trước khi đánh giá.',
      };
    }

    // Demo mode: cho phép nếu phim có showtimes (mock - không check thời gian thực)
    return { canReview: true, reason: '' };
  },

  /**
   * Tạo review mới
   * @param {{ movieId, userId, userName, userInitials, rating, comment }} payload
   */
  create: ({ movieId, userId, userName, userInitials, rating, comment }) => {
    const all = getAllFromStorage();
    const maxId = all.reduce((max, r) => Math.max(max, r.id), 0);

    const newReview = {
      id: maxId + 1,
      movieId: Number(movieId),
      userId: Number(userId),
      userName: userName || 'Ẩn danh',
      userInitials: userInitials || '?',
      rating: Number(rating),
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
      helpful: 0,
    };

    const updated = [newReview, ...all];
    saveToStorage(updated);
    return newReview;
  },

  /**
   * Tính rating trung bình của phim
   * @param {number} movieId
   */
  getAverageRating: (movieId) => {
    const reviews = reviewService.getByMovieId(movieId);
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  },
};

export default reviewService;
