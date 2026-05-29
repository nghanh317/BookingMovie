import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import useNotificationStore from '../../store/notificationStore';

function StarBar({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <div key={i} className={`h-1.5 w-3.5 rounded-sm ${i <= rating ? 'bg-primary' : 'bg-cinema-border'}`} />
      ))}
      <span className="text-primary text-xs font-bold ml-1">{rating}/5</span>
    </div>
  );
}

function ReviewCard({ review, onHide, onDelete, hidden }) {
  return (
    <div className={`rounded-lg border p-3 transition-all ${hidden ? 'opacity-40 border-cinema-border/40 bg-cinema-dark/50' : 'border-cinema-border bg-cinema-dark hover:border-primary/30'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-cinema-black font-bold text-[10px] flex-shrink-0">
            {review.userInitials}
          </div>
          <div className="min-w-0">
            <span className="text-white text-xs font-semibold">{review.userName}</span>
            <span className="text-cinema-muted text-[10px] ml-2">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {hidden && <span className="text-[10px] text-orange-400 border border-orange-400/30 px-1.5 py-0.5 rounded">Đã ẩn</span>}
          <button
            onClick={() => onHide(review.id)}
            title={hidden ? 'Hiển thị lại' : 'Ẩn đánh giá'}
            className="px-2 py-1 text-[11px] rounded border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 transition-colors"
          >
            {hidden ? '👁️ Hiện' : '🙈 Ẩn'}
          </button>
          <button
            onClick={() => onDelete(review.id)}
            title="Xóa vĩnh viễn"
            className="px-2 py-1 text-[11px] rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            🗑️ Xóa
          </button>
        </div>
      </div>
      <StarBar rating={review.rating} />
      <p className="text-cinema-muted text-xs mt-1.5 leading-relaxed line-clamp-3">{review.comment}</p>
      <div className="flex items-center gap-2 mt-1.5">
        <span className="text-cinema-muted text-[10px]">👍 {review.helpful || 0} người thấy hữu ích</span>
      </div>
    </div>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews]       = useState([]);
  const [movies, setMovies]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [hiddenIds, setHiddenIds]   = useState(new Set());
  const [search, setSearch]         = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [expandedMovies, setExpandedMovies] = useState({});
  const searchRef = useRef(null);
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [moviesRes, reviewsRes] = await Promise.all([
          api.get('/v1/movies', { params: { size: 1000 } }),
          api.get('/v1/movie-reviews', { params: { size: 1000 } })
        ]);
        
        let moviesData = [];
        if (Array.isArray(moviesRes.data)) moviesData = moviesRes.data;
        else if (Array.isArray(moviesRes.data?.data)) moviesData = moviesRes.data.data;
        else if (Array.isArray(moviesRes.data?.content)) moviesData = moviesRes.data.content;
        else if (Array.isArray(moviesRes.data?.data?.content)) moviesData = moviesRes.data.data.content;
        setMovies(moviesData);

        let reviewsData = [];
        if (Array.isArray(reviewsRes.data)) reviewsData = reviewsRes.data;
        else if (Array.isArray(reviewsRes.data?.data)) reviewsData = reviewsRes.data.data;
        else if (Array.isArray(reviewsRes.data?.content)) reviewsData = reviewsRes.data.content;
        else if (Array.isArray(reviewsRes.data?.data?.content)) reviewsData = reviewsRes.data.data.content;
        
        const mappedReviews = reviewsData.map(r => ({
          id: r.id,
          movieId: r.movieId,
          userId: r.accountId,
          userName: r.accountFullName || 'Khán giả',
          userInitials: (r.accountFullName || 'K G').split(' ').map(n => n[0]).slice(-2).join('').toUpperCase(),
          rating: r.rating || 5,
          comment: r.comment,
          createdAt: r.createDate || new Date().toISOString(),
          helpful: 0
        }));
        setReviews(mappedReviews);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        addNotification({ title: 'Lỗi', message: 'Không thể tải danh sách đánh giá', type: 'error', isAdmin: true });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Autocomplete
  const allSuggestions = useMemo(() => {
    const titles  = movies.map(m => m.title);
    const users   = [...new Set(reviews.map(r => r.userName))];
    return [...titles, ...users];
  }, [reviews, movies]);

  const handleSearchChange = (val) => {
    setSearch(val);
    if (val.trim().length < 2) { setSuggestions([]); return; }
    setSuggestions(allSuggestions.filter(s => s.toLowerCase().includes(val.toLowerCase())).slice(0, 7));
  };

  useEffect(() => {
    const handler = e => { if (searchRef.current && !searchRef.current.contains(e.target)) setSuggestions([]); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Filter
  const filtered = useMemo(() => {
    if (!search.trim()) return reviews;
    const q = search.toLowerCase();
    return reviews.filter(r => {
      const movie = movies.find(m => m.id === r.movieId);
      return (movie?.title || '').toLowerCase().includes(q)
        || r.userName.toLowerCase().includes(q)
        || r.comment.toLowerCase().includes(q);
    });
  }, [reviews, search, movies]);

  // Group by movie
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(r => {
      if (!map[r.movieId]) map[r.movieId] = [];
      map[r.movieId].push(r);
    });
    return map;
  }, [filtered]);

  // Actions
  const handleHide = (id) => {
    setHiddenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này vĩnh viễn?")) return;
    
    try {
      await api.delete(`/v1/movie-reviews/${id}`);
      
      const r = reviews.find(x => x.id === id);
      const movie = movies.find(m => m.id === r?.movieId);
      
      setReviews(prev => prev.filter(x => x.id !== id));
      
      // Gửi thông báo đến người dùng (user-facing notification)
      addNotification({
        title: 'Đánh giá đã bị xóa',
        message: `Đánh giá của bạn về phim "${movie?.title || ''}" đã bị xóa bởi quản trị viên do vi phạm chính sách cộng đồng.`,
        type: 'warn',
        isAdmin: false, // hiển thị phía user
      });
      addNotification({
        title: 'Đã xóa đánh giá',
        message: `Xóa đánh giá của ${r?.userName || 'Khán giả'} về "${movie?.title || 'phim'}"`,
        type: 'success',
        isAdmin: true,
      });
    } catch (error) {
      console.error("Lỗi khi xóa đánh giá:", error);
      addNotification({
        title: 'Lỗi',
        message: 'Không thể xóa đánh giá này. Vui lòng thử lại.',
        type: 'error',
        isAdmin: true,
      });
    }
  };

  const toggleExpand = (movieId) => {
    setExpandedMovies(prev => ({ ...prev, [movieId]: !prev[movieId] }));
  };

  // Overall stats
  const totalStats = useMemo(() => ({
    total:   reviews.length,
    hidden:  hiddenIds.size,
    movies:  Object.keys(grouped).length,
  }), [reviews, hiddenIds, grouped]);

  const PREVIEW_COUNT = 2;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading font-extrabold text-2xl text-white">Quản lý Đánh Giá</h2>
        <p className="text-cinema-muted text-sm mt-0.5">Kiểm duyệt và quản lý đánh giá phim từ người dùng</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Tổng đánh giá',    value: totalStats.total,  icon: '💬', color: 'border-blue-500/30 bg-blue-500/5' },
          { label: 'Phim được review', value: totalStats.movies, icon: '🎬', color: 'border-primary/30 bg-primary/5' },
          { label: 'Đang ẩn',         value: totalStats.hidden, icon: '🙈', color: 'border-orange-500/30 bg-orange-500/5' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <p className="font-heading font-bold text-xl text-white">{s.value}</p>
            <p className="text-cinema-muted text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md" ref={searchRef}>
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cinema-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={search}
          onChange={e => handleSearchChange(e.target.value)}
          placeholder="🔍 Tìm theo phim, người dùng, nội dung..."
          className="input-field pl-9 w-full"
        />
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute z-30 left-0 right-0 mt-1 bg-cinema-card border border-cinema-border rounded-xl shadow-lg overflow-hidden"
            >
              {suggestions.map(s => (
                <li key={s}
                  onClick={() => { setSearch(s); setSuggestions([]); }}
                  className="px-4 py-2 text-sm text-cinema-text hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                >{s}</li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* Grouped by movie */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 text-cinema-muted">
          <div className="text-4xl mb-3">💬</div>
          <p>Không tìm thấy đánh giá nào</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([movieId, movieReviews]) => {
            const movie     = movies.find(m => m.id === +movieId);
            const avgRating = (movieReviews.reduce((s, r) => s + r.rating, 0) / movieReviews.length).toFixed(1);
            const expanded  = expandedMovies[movieId];
            const displayed = expanded ? movieReviews : movieReviews.slice(0, PREVIEW_COUNT);

            return (
              <div key={movieId} className="bg-cinema-surface rounded-xl border border-cinema-border overflow-hidden">
                {/* Movie header */}
                <div className="flex items-center gap-4 p-4 border-b border-cinema-border bg-cinema-dark">
                  <img
                    src={movie?.poster}
                    alt={movie?.title}
                    className="w-10 h-14 object-cover rounded flex-shrink-0"
                    referrerPolicy="no-referrer"
                    onError={e => { e.target.src = 'https://placehold.co/50x70/1E1E2C/A0A0B4'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-white text-sm truncate">{movie?.title}</h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-cinema-muted text-xs">💬 {movieReviews.length} đánh giá</span>
                      <span className="flex items-center gap-1 text-primary text-xs font-bold">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        {avgRating}/10 TB
                      </span>
                      <span className="text-cinema-muted text-xs">
                        🙈 {movieReviews.filter(r => hiddenIds.has(r.id)).length} đang ẩn
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleExpand(movieId)}
                    className="text-xs text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-all flex-shrink-0"
                  >
                    {expanded ? '▲ Thu gọn' : `▼ Xem tất cả (${movieReviews.length})`}
                  </button>
                </div>

                {/* Reviews */}
                <div className="p-4 space-y-3">
                  <AnimatePresence initial={false}>
                    {displayed.map(r => (
                      <motion.div key={r.id}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <ReviewCard
                          review={r}
                          hidden={hiddenIds.has(r.id)}
                          onHide={handleHide}
                          onDelete={handleDelete}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {!expanded && movieReviews.length > PREVIEW_COUNT && (
                    <button
                      onClick={() => toggleExpand(movieId)}
                      className="w-full text-xs text-cinema-muted hover:text-white border border-dashed border-cinema-border rounded-lg py-2 transition-colors"
                    >
                      + {movieReviews.length - PREVIEW_COUNT} đánh giá khác...
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
