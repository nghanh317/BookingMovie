import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AGE_RATINGS } from '../../constants/mockData';
import movieService from '../../services/movieService';
import ticketService from '../../services/ticketService';
import api from '../../services/api';

// ── Helpers ──────────────────────────────────────────────────

function formatRevenue(n) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} tỷ`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)} triệu`;
  return n.toLocaleString('vi-VN');
}

function formatTickets(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

/** Rank badge */
function RankBadge({ rank }) {
  const styles = {
    1: 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 shadow-lg shadow-yellow-500/30',
    2: 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900 shadow-lg shadow-gray-400/30',
    3: 'bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100 shadow-lg shadow-amber-600/30',
  };
  return (
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-heading font-extrabold text-sm flex-shrink-0 ${
      styles[rank] || 'bg-cinema-surface border border-cinema-border text-cinema-muted'
    }`}>
      {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`}
    </div>
  );
}

function RatingBar({ rating, maxRating = 5 }) {
  const pct = Math.min((rating / maxRating) * 100, 100);
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 bg-cinema-surface rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="h-full bg-primary rounded-full"
        />
      </div>
      <span className="text-sm font-bold flex-shrink-0 text-primary">
        {rating.toFixed(1)}/5
      </span>
    </div>
  );
}

/** Card phim trong bảng top */
function TopMovieRow({ movie, rank, stat, showRevenue = false, showTickets = false }) {
  const ageInfo = AGE_RATINGS[movie.ageRating];
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.06 }}
      className="group flex items-center gap-4 p-4 rounded-2xl bg-cinema-card border border-cinema-border hover:border-primary/40 hover:bg-cinema-card/80 transition-all duration-200"
    >
      <RankBadge rank={rank} />

      {/* Poster */}
      <Link to={`/movies/${movie.id}`} className="flex-shrink-0 relative">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-12 h-[4.5rem] object-cover rounded-xl border border-cinema-border group-hover:border-primary/40 transition-colors duration-200"
          onError={(e) => {
            e.target.src = `https://placehold.co/48x72/1E1E2C/A0A0B4?text=${encodeURIComponent(movie.title[0])}`;
          }}
        />
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Link to={`/movies/${movie.id}`}>
            <h3 className="text-white font-heading font-semibold text-sm hover:text-primary transition-colors line-clamp-1">
              {movie.title}
            </h3>
          </Link>
          {ageInfo && (
            <span className={`badge ${ageInfo.color} text-white font-bold text-[10px] flex-shrink-0`}>{ageInfo.label}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          {movie.genre.slice(0, 2).map((g) => (
            <span key={g} className="badge bg-cinema-surface border border-cinema-border text-cinema-muted text-[10px]">{g}</span>
          ))}
          {movie.genre.length > 2 && (
            <span className="badge bg-primary/10 border border-primary/30 text-primary text-[10px]">+{movie.genre.length - 2}</span>
          )}
        </div>
        <RatingBar rating={movie.rating} />
        <div className="mt-2.5 text-xs text-cinema-muted space-y-1.5 bg-cinema-surface/50 p-2.5 rounded-lg border border-cinema-border/50">
          <p><span className="font-semibold text-white/70">Thể loại:</span> {movie.genre.join(', ')}</p>
          <p><span className="font-semibold text-white/70">Khởi chiếu:</span> {new Date(movie.releaseDate).getFullYear()} • <span className="font-semibold text-white/70">Thời lượng:</span> {movie.duration} phút</p>
          <p className="line-clamp-2"><span className="font-semibold text-white/70">Nội dung:</span> {movie.description}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0 text-right min-w-[100px]">
        {showRevenue && stat && (
          <div>
            <p className="text-xs text-cinema-muted">Doanh thu</p>
            <p className="text-primary font-bold text-sm">{formatRevenue(stat.revenue)}</p>
          </div>
        )}
        {showTickets && stat && (
          <div>
            <p className="text-xs text-cinema-muted">Vé bán</p>
            <p className="text-accent font-bold text-sm">{formatTickets(stat.ticketsSold)}</p>
          </div>
        )}
      </div>

      {/* CTA */}
      {movie.status === 'now_showing' && (
        <Link
          to={`/booking/${movie.id}`}
          className="hidden md:flex btn-primary text-xs px-3 py-1.5 whitespace-nowrap flex-shrink-0"
        >
          Đặt Vé
        </Link>
      )}
    </motion.div>
  );
}

/** Section top phim */
function TopSection({ title, icon, movies, statsMap, showRevenue, showTickets, accent = 'primary' }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">{icon}</span>
        <h2 className="font-heading font-extrabold text-2xl text-white">{title}</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-cinema-border to-transparent" />
      </div>
      <div className="space-y-3">
        {movies.map((movie, i) => (
          <TopMovieRow
            key={movie.id}
            movie={movie}
            rank={i + 1}
            stat={statsMap[movie.id]}
            showRevenue={showRevenue}
            showTickets={showTickets}
          />
        ))}
      </div>
    </motion.section>
  );
}

// ── Tabs ────────────────────────────────────────────────────

const TABS = [
  { id: 'all', label: '🔥 Tất Cả' },
  { id: 'now_showing', label: '● Đang Chiếu' },
  { id: 'romance', label: '💕 Tình Cảm' },
  { id: 'action', label: '⚡ Hành Động' },
  { id: 'animated', label: '🎨 Hoạt Hình' },
  { id: 'alltime', label: '👑 Mọi Thời Đại' },
];

// ── Main Component ───────────────────────────────────────────

export default function TopMovies() {
  const [activeTab, setActiveTab] = useState('all');
  const [apiMovies, setApiMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopMoviesData = async () => {
      setLoading(true);
      try {
        const [ticketsRes, moviesRes, reviewsRes] = await Promise.all([
          ticketService.getAll({ size: 10000 }),
          movieService.getAll(),
          api.get('/v1/movie-reviews', { params: { size: 1000 } }).catch(() => ({ data: [] }))
        ]);
        
        const tickets = Array.isArray(ticketsRes) ? ticketsRes : ticketsRes?.content || ticketsRes?.data || [];
        const allMovies = moviesRes || [];
        
        let reviewsData = [];
        if (reviewsRes && reviewsRes.data) {
          if (Array.isArray(reviewsRes.data)) reviewsData = reviewsRes.data;
          else if (Array.isArray(reviewsRes.data.data)) reviewsData = reviewsRes.data.data;
          else if (Array.isArray(reviewsRes.data.content)) reviewsData = reviewsRes.data.content;
          else if (Array.isArray(reviewsRes.data.data?.content)) reviewsData = reviewsRes.data.data.content;
        }

        const statsMap = {};
        allMovies.forEach(m => {
          // Tính trung bình đánh giá
          const movieReviews = reviewsData.filter(r => r.movieId === m.id);
          let avgRating = 0;
          if (movieReviews.length > 0) {
            avgRating = parseFloat((movieReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / movieReviews.length).toFixed(1));
          }
          
          statsMap[m.id] = {
            ticketsSold: 0,
            revenue: 0,
            allTimeRevenue: 0,
            rating: avgRating
          };
        });

        tickets.forEach(ticket => {
          if (ticket.paymentStatus === 'PAID' && ticket.movieId) {
            if (statsMap[ticket.movieId]) {
              statsMap[ticket.movieId].ticketsSold += (ticket.seats?.length || 1);
              const amount = ticket.finalAmount || ticket.totalAmount || 0;
              statsMap[ticket.movieId].revenue += amount;
              statsMap[ticket.movieId].allTimeRevenue += amount;
            }
          }
        });

        const mergedMovies = allMovies.map(m => ({
          ...m,
          rating: statsMap[m.id]?.rating || 0,
          stat: statsMap[m.id] || { ticketsSold: 0, revenue: 0, allTimeRevenue: 0 }
        }));

        setApiMovies(mergedMovies);
      } catch (err) {
        console.error("Lỗi tải API top phim:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopMoviesData();
  }, []);

  // Top đang chiếu theo doanh thu
  const topNowShowing = useMemo(() =>
    apiMovies
      .filter((m) => m.status === 'now_showing')
      .sort((a, b) => b.stat.revenue - a.stat.revenue)
      .slice(0, 5),
    [apiMovies]
  );

  // Top tất cả phim theo doanh thu (dùng thay cho rating)
  const topAllRevenue = useMemo(() =>
    [...apiMovies].sort((a, b) => b.stat.revenue - a.stat.revenue).slice(0, 5),
    [apiMovies]
  );

  // Top mọi thời đại theo doanh thu
  const topAllTime = useMemo(() =>
    [...apiMovies].sort((a, b) => b.stat.allTimeRevenue - a.stat.allTimeRevenue).slice(0, 5),
    [apiMovies]
  );

  // Top tình cảm theo doanh thu
  const topRomance = useMemo(() =>
    apiMovies
      .filter((m) => m.genre.some((g) => ['Tình cảm', 'Hài', 'Gia đình'].includes(g)))
      .sort((a, b) => b.stat.revenue - a.stat.revenue)
      .slice(0, 5),
    [apiMovies]
  );

  // Top hành động theo doanh thu
  const topAction = useMemo(() =>
    apiMovies
      .filter((m) => m.genre.some((g) => ['Hành động', 'Phiêu lưu'].includes(g)))
      .sort((a, b) => b.stat.revenue - a.stat.revenue)
      .slice(0, 5),
    [apiMovies]
  );

  // Top hoạt hình theo doanh thu
  const topAnimated = useMemo(() =>
    apiMovies
      .filter((m) => m.genre.includes('Hoạt hình'))
      .sort((a, b) => b.stat.revenue - a.stat.revenue)
      .slice(0, 5),
    [apiMovies]
  );

  // Số 1 hiện tại để hiển thị hero
  const heroMovie = topNowShowing[0] || topAllRevenue[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ── Hero Banner ─────────────────────────────────────── */}
      {heroMovie && (
        <div className="relative h-[50vh] min-h-[320px] overflow-hidden">
          <img
            src={heroMovie.backdrop}
            alt={heroMovie.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = `https://placehold.co/1920x1080/1A1A24/A0A0B4?text=Top+Phim`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-black via-cinema-black/60 to-cinema-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-cinema-black/80 to-transparent" />

          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4 max-w-7xl">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">🏆</span>
                  <span className="badge bg-primary/20 border border-primary/40 text-primary font-semibold">
                    Bảng Xếp Hạng Phim
                  </span>
                </div>
                <h1 className="font-heading font-extrabold text-5xl md:text-6xl text-white mb-3">
                  Top Phim
                </h1>
                <p className="text-cinema-muted text-lg max-w-lg">
                  Bảng xếp hạng phim hot nhất – cập nhật theo doanh thu, lượt đặt vé và đánh giá từ khán giả.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tabs Navigation ──────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-cinema-dark/95 backdrop-blur-md border-b border-cinema-border">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-3" style={{ scrollbarWidth: 'none' }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary text-cinema-black font-semibold'
                    : 'text-cinema-muted hover:text-white hover:bg-cinema-surface'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────── */}
      <div className="container mx-auto px-4 max-w-7xl py-10">
        {/* Thứ hạng overview - chỉ hiện ở tab "all" */}
        {activeTab === 'all' && (
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {[
              { rank: 1, movie: topNowShowing[0] || topAllRevenue[0], label: 'Phim Hot Nhất', icon: '🥇' },
              { rank: 2, movie: topNowShowing[1] || topAllRevenue[1], label: 'Xếp Hạng 2', icon: '🥈' },
              { rank: 3, movie: topNowShowing[2] || topAllRevenue[2], label: 'Xếp Hạng 3', icon: '🥉' },
            ].map(({ rank, movie, label, icon }) => movie && (
              <motion.div
                key={rank}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: rank * 0.1 }}
                className={`relative overflow-hidden rounded-2xl border ${
                  rank === 1
                    ? 'border-yellow-500/40 bg-gradient-to-br from-yellow-500/10 to-cinema-card'
                    : rank === 2
                    ? 'border-gray-400/40 bg-gradient-to-br from-gray-400/10 to-cinema-card'
                    : 'border-amber-600/40 bg-gradient-to-br from-amber-600/10 to-cinema-card'
                }`}
              >
                <div className="p-4 flex gap-3 items-center">
                  <span className="text-4xl">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-cinema-muted text-xs mb-1">{label}</p>
                    <Link to={`/movies/${movie.id}`}>
                      <h3 className="text-white font-heading font-bold text-sm line-clamp-1 hover:text-primary transition-colors">
                        {movie.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-primary text-xs font-semibold">⭐ {movie.rating}</span>
                      <span className="text-cinema-muted text-xs">
                        {formatRevenue(movie.stat?.revenue || 0)}
                      </span>
                    </div>
                  </div>
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-12 h-[4.5rem] rounded-xl object-cover flex-shrink-0 border border-cinema-border"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Top sections theo tab */}
        {(activeTab === 'all' || activeTab === 'now_showing') && (
          <TopSection
            title="Top Phim Đang Chiếu"
            icon="🔥"
            movies={topNowShowing}
            statsMap={apiMovies.reduce((acc, m) => ({ ...acc, [m.id]: m.stat }), {})}
            showRevenue
            showTickets
          />
        )}

        {(activeTab === 'all' || activeTab === 'alltime') && (
          <TopSection
            title="Top Doanh Thu Cao Nhất"
            icon="💰"
            movies={topAllTime}
            statsMap={apiMovies.reduce((acc, m) => ({ ...acc, [m.id]: m.stat }), {})}
            showRevenue
          />
        )}

        {(activeTab === 'all' || activeTab === 'romance') && (
          <TopSection
            title="Top Phim Tình Cảm & Gia Đình"
            icon="💕"
            movies={topRomance}
            statsMap={apiMovies.reduce((acc, m) => ({ ...acc, [m.id]: m.stat }), {})}
            showTickets
          />
        )}

        {(activeTab === 'all' || activeTab === 'action') && (
          <TopSection
            title="Top Phim Hành Động & Phiêu Lưu"
            icon="⚡"
            movies={topAction}
            statsMap={apiMovies.reduce((acc, m) => ({ ...acc, [m.id]: m.stat }), {})}
            showTickets
          />
        )}

        {(activeTab === 'all' || activeTab === 'animated') && (
          <TopSection
            title="Top Phim Hoạt Hình"
            icon="🎨"
            movies={topAnimated.length > 0 ? topAnimated : topAllRevenue.filter((m) => m.rating >= 7)}
            statsMap={apiMovies.reduce((acc, m) => ({ ...acc, [m.id]: m.stat }), {})}
            showRevenue
          />
        )}

        {/* Empty state khi không có phim theo thể loại */}
        {activeTab !== 'all' && activeTab !== 'now_showing' && activeTab !== 'alltime' &&
         ((activeTab === 'animated' && topAnimated.length === 0) ||
          (activeTab === 'romance' && topRomance.length === 0) ||
          (activeTab === 'action' && topAction.length === 0)) && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-white text-xl font-heading font-bold mb-2">Chưa có dữ liệu</h3>
            <p className="text-cinema-muted">Danh sách phim thể loại này đang được cập nhật.</p>
          </div>
        )}
      </div>
    </div>
  );
}
