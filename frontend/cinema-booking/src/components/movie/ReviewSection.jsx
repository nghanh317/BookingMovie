import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import reviewService, { formatReviewDate } from '../../services/reviewService';
import useAuthStore from '../../store/authStore';
import { checkContent } from '../../utils/contentFilter';

/** Thanh sao đánh giá tương tác */
function StarInput({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="transition-transform duration-100 hover:scale-125"
          aria-label={`${star} sao`}
        >
          <svg
            className={`w-5 h-5 transition-colors duration-150 ${
              (hovered || value) >= star ? 'text-primary' : 'text-cinema-border'
            }`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
      <span className="ml-2 text-white font-semibold text-sm">
        {hovered || value ? `${hovered || value}/10` : ''}
      </span>
    </div>
  );
}

/** Hiển thị điểm đánh giá dưới dạng sao (0–5 sao) */
function StarDisplay({ rating }) {
  // Not used anymore for 10-point scale
  return null;
}

function RatingBadge({ rating }) {
  if (!rating) return null;
  const color =
    rating >= 8 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
    rating >= 5 ? 'bg-primary/20 text-primary border-primary/30' :
    'bg-cinema-surface text-cinema-muted border-cinema-border';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg border text-sm font-bold ${color}`}>
      {rating}/10
    </span>
  );
}

export default function ReviewSection({ movieId }) {
  const { isLoggedIn, user } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [canReviewInfo, setCanReviewInfo] = useState({ canReview: false, reason: '' });
  const [showForm, setShowForm] = useState(false);
  const [formComment, setFormComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [contentError, setContentError] = useState('');

  const loadReviews = () => {
    const data = reviewService.getByMovieId(movieId);
    setReviews(data);
    setAvgRating(reviewService.getAverageRating(movieId));
  };

  useEffect(() => {
    loadReviews();
    if (isLoggedIn && user) {
      setCanReviewInfo(reviewService.canReview(user.id || user.userId, movieId));
    } else {
      setCanReviewInfo({ canReview: false, reason: 'Bạn cần đăng nhập để đánh giá phim.' });
    }
  }, [movieId, isLoggedIn, user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formComment.trim()) return;

    // Kiểm tra nội dung ngôn từ
    const filterResult = checkContent(formComment);
    if (!filterResult.valid) {
      setContentError(filterResult.message);
      return;
    }
    setContentError('');

    setSubmitting(true);
    try {
      const displayName = user?.fullName || user?.userName || 'Người dùng';
      const initials = displayName.split(' ').map((n) => n[0]).slice(-2).join('').toUpperCase();

      reviewService.create({
        movieId,
        userId: user?.id || user?.userId || 0,
        userName: displayName,
        userInitials: initials,
        rating: 0,
        comment: formComment,
      });

      setSubmitSuccess(true);
      setFormComment('');
      setShowForm(false);
      setContentError('');
      loadReviews();

      setCanReviewInfo(reviewService.canReview(user?.id || user?.userId, movieId));

      setTimeout(() => setSubmitSuccess(false), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  // Phân phối điểm
  const ratingDistribution = [5, 4, 3, 2, 1].map((score) => ({
    score,
    count: reviews.filter((r) => r.rating === score).length,
  }));
  const maxCount = Math.max(...ratingDistribution.map((d) => d.count), 1);

  return (
    <section id="reviews-section" className="mt-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="section-title">Đánh Giá & Bình Luận</h2>
          <p className="text-cinema-muted text-sm mt-1">
            {reviews.length > 0
              ? `${reviews.length} đánh giá từ khán giả đã xem phim`
              : 'Chưa có đánh giá nào. Hãy là người đầu tiên!'}
          </p>
        </div>
        {canReviewInfo.canReview && !showForm && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowForm(true)}
            className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
          >
            ✏️ Viết Bình Luận
          </motion.button>
        )}
      </div>

      {/* Thông báo gửi thành công */}
      <AnimatePresence>
        {submitSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 flex items-center gap-3"
          >
            <span className="text-xl">✅</span>
            <span className="font-medium">Cảm ơn bạn! Đánh giá của bạn đã được gửi thành công.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form đánh giá */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <form
              onSubmit={handleSubmit}
              className="bg-cinema-card border border-cinema-border rounded-2xl p-6"
            >
              <h3 className="text-white font-heading font-bold text-lg mb-5 flex items-center gap-2">
                ✍️ Viết Bình Luận Của Bạn
              </h3>



              {/* Content error */}
              {contentError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-2">
                  <span className="text-base flex-shrink-0">🚫</span>
                  <div>
                    <p className="font-medium mb-0.5">Nội dung không phù hợp</p>
                    <p className="text-xs opacity-90">{contentError}</p>
                    <p className="text-xs mt-1 opacity-70">Theo tiêu chuẩn cộng đồng (Luật An ninh mạng 2018), vui lòng sử dụng ngôn từ văn minh, lịch sự.</p>
                  </div>
                </div>
              )}

              {/* Comment */}
              <div className="mb-5">
                <label className="block text-cinema-muted text-sm mb-2 font-medium">
                  Nội dung đánh giá <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formComment}
                  onChange={(e) => { setFormComment(e.target.value); if (contentError) setContentError(''); }}
                  placeholder="Chia sẻ cảm nhận của bạn về bộ phim này..."
                  rows={4}
                  maxLength={1000}
                  className={`input-field resize-none ${contentError ? 'border-red-500/50' : ''}`}
                  required
                />
                <p className="text-cinema-muted text-xs mt-1 text-right">
                  {formComment.length}/1000
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={!formComment.trim() || submitting}
                  className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Đang gửi...' : '📤 Gửi Bình Luận'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setFormComment(''); }}
                  className="btn-outline px-6 py-2.5 text-sm"
                >
                  Hủy
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thông báo điều kiện đánh giá */}
      {!canReviewInfo.canReview && !showForm && (
        <div className={`mb-8 p-4 rounded-xl border flex items-start gap-3 ${
          isLoggedIn
            ? 'bg-yellow-500/8 border-yellow-500/20 text-yellow-400/80'
            : 'bg-cinema-surface border-cinema-border text-cinema-muted'
        }`}>
          <span className="text-xl flex-shrink-0 mt-0.5">
            {isLoggedIn ? '🎫' : '🔒'}
          </span>
          <div>
            <p className="text-sm font-medium">{canReviewInfo.reason}</p>
            {!isLoggedIn && (
              <Link to="/login" className="text-primary text-xs hover:underline mt-1 inline-block">
                Đăng nhập ngay →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Tổng quan rating */}
      {reviews.length > 0 && (
        <div className="flex justify-center mb-8">
          <div className="bg-cinema-card border border-cinema-border rounded-2xl p-8 w-full max-w-sm flex flex-col items-center justify-center text-center shadow-card-hover">
            <div className="flex items-center justify-center gap-3 mb-2">
              <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <div className="text-7xl font-heading font-extrabold text-white leading-none">
                {avgRating}
              </div>
            </div>
            <div className="text-cinema-muted text-sm mt-2">trên thang điểm 10</div>
            <div className="text-cinema-muted text-xs mt-3">{reviews.length} lượt đánh giá</div>
          </div>
        </div>
      )}

      {/* Danh sách reviews */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-cinema-card border border-cinema-border rounded-2xl p-5 hover:border-primary/30 transition-colors duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-cinema-black font-heading font-bold text-sm flex-shrink-0">
                    {review.userInitials}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{review.userName}</p>
                    <p className="text-cinema-muted text-xs">{formatReviewDate(review.createdAt)}</p>
                  </div>
                </div>
                <RatingBadge rating={review.rating} />
              </div>



              {/* Comment */}
              <p className="text-cinema-muted text-sm leading-relaxed">{review.comment}</p>

              {/* Helpful */}
              <div className="mt-3 flex items-center gap-2">
                <button className="text-cinema-muted hover:text-primary transition-colors text-xs flex items-center gap-1 group">
                  <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  Hữu ích ({review.helpful})
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-cinema-card border border-cinema-border rounded-2xl">
          <div className="text-5xl mb-4">💬</div>
          <p className="text-white font-heading font-semibold mb-2">Chưa có đánh giá nào</p>
          <p className="text-cinema-muted text-sm">Hãy là người đầu tiên chia sẻ cảm nhận về phim này!</p>
        </div>
      )}
    </section>
  );
}
