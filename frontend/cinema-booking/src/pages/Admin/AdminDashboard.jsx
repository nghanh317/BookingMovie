import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MOVIES, CINEMAS, SHOWTIMES } from '../../constants/mockData';
import ticketService from '../../services/ticketService';
import movieService from '../../services/movieService';
import api from '../../services/api';

const STATS = [
  { label: 'Tổng phim', value: MOVIES.length, icon: '🎬', change: '+2 tháng này', color: 'border-blue-500/30 bg-blue-500/5' },
  { label: 'Rạp chiếu phim', value: CINEMAS.length, icon: '🏟️', change: 'Đang hoạt động', color: 'border-green-500/30 bg-green-500/5' },
  { label: 'Vé đã bán hôm nay', value: 247, icon: '🎟️', change: '+18% so hôm qua', color: 'border-primary/30 bg-primary/5' },
  { label: 'Doanh thu hôm nay', value: '24.7M', icon: '💰', change: '+12% so hôm qua', color: 'border-accent/30 bg-accent/5' },
];

const RECENT_BOOKINGS = [
  { id: 'CB2F4A9K', user: 'Nguyễn Văn An', movie: 'Avengers: Secret Wars', seats: 2, total: 260000, time: '2 phút trước' },
  { id: 'CB8B1XPZ', user: 'Trần Thị Bình', movie: 'Godzilla vs. Kong', seats: 3, total: 390000, time: '15 phút trước' },
  { id: 'CB9L2WQX', user: 'Lê Minh Châu', movie: 'Spider-Man: Beyond', seats: 2, total: 157500, time: '35 phút trước' },
  { id: 'CB3K7RNM', user: 'Phạm Thị Dung', movie: 'Venom: The Last Dance', seats: 1, total: 79250, time: '1 giờ trước' },
  { id: 'CB7M3STV', user: 'Hoàng Văn Em', movie: 'Dune: Phần Ba', seats: 2, total: 220000, time: '2 giờ trước' },
];

const REVENUE_WEEKLY = [180, 220, 195, 310, 280, 410, 247];
const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const maxRevenue = Math.max(...REVENUE_WEEKLY);

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return 'Gần đây';
  const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return Math.floor(diff / 60) + ' phút trước';
  if (diff < 86400) return Math.floor(diff / 3600) + ' giờ trước';
  return Math.floor(diff / 86400) + ' ngày trước';
};

// ── Pie chart data ─────────────────────────────────────────
const PIE_DATA = [
  { label: 'Hành động',  value: 35, color: '#F5A623' },
  { label: 'Hoạt hình',  value: 22, color: '#4A90E2' },
  { label: 'Tình cảm',   value: 18, color: '#E84393' },
  { label: 'Kinh dị',    value: 14, color: '#7B61FF' },
  { label: 'Khác',       value: 11, color: '#50C878' },
];

function PieChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;
  const cx = 80, cy = 80, r = 70;

  const slices = data.map((d) => {
    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    cumulative += d.value;
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = d.value / total > 0.5 ? 1 : 0;
    return {
      ...d,
      path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
    };
  });

  return (
    <div className="flex items-center gap-4 h-40">
      <svg width="160" height="160" viewBox="0 0 160 160" className="flex-shrink-0">
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke="#0F0F1A" strokeWidth="2"
            className="hover:opacity-80 transition-opacity cursor-pointer" />
        ))}
        {/* Center hole */}
        <circle cx={cx} cy={cy} r={32} fill="#141420" />
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">Thể loại</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#A0A0B4" fontSize="9">doanh thu</text>
      </svg>
      <div className="space-y-1.5 flex-1 min-w-0">
        {data.map((d) => (
          <div key={d.label} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
              <span className="text-cinema-muted text-xs truncate">{d.label}</span>
            </div>
            <span className="text-white text-xs font-semibold flex-shrink-0">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ stat, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className={`rounded-xl border p-5 ${stat.color}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl">{stat.icon}</div>
        <span className="text-green-400 text-xs font-medium">{stat.change}</span>
      </div>
      <p className="font-heading font-extrabold text-2xl text-white">{stat.value}</p>
      <p className="text-cinema-muted text-sm mt-0.5">{stat.label}</p>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [chartType, setChartType] = useState('bar'); // 'bar' | 'pie'
  const [topMovies, setTopMovies] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    const fetchTopMovies = async () => {
      try {
        const [res, allMovies, reviewsRes] = await Promise.all([
          ticketService.getAll({ size: 1000 }),
          movieService.getAll(),
          api.get('/v1/movie-reviews', { params: { size: 1000 } }).catch(() => ({ data: [] }))
        ]);
        const tickets = Array.isArray(res) ? res : res?.content || res?.data || [];
        
        // Xử lý danh sách Đặt vé gần đây
        const sortedBookings = [...tickets].sort((a, b) => {
          const dateA = new Date(a.ticketsDate || a.createDate || 0);
          const dateB = new Date(b.ticketsDate || b.createDate || 0);
          return dateB - dateA; // Mới nhất lên đầu
        });
        
        const formattedBookings = sortedBookings.slice(0, 5).map(t => ({
          id: t.ticketsCode || t.id,
          user: t.accountsFullName || 'Khách vãng lai',
          movie: t.movieName || 'N/A',
          seats: t.seats ? t.seats.length : 0,
          total: t.finalAmount || t.totalAmount || 0,
          time: formatTimeAgo(t.ticketsDate || t.createDate)
        }));
        setRecentBookings(formattedBookings);
        
        let reviewsData = [];
        if (reviewsRes && reviewsRes.data) {
          if (Array.isArray(reviewsRes.data)) reviewsData = reviewsRes.data;
          else if (Array.isArray(reviewsRes.data.data)) reviewsData = reviewsRes.data.data;
          else if (Array.isArray(reviewsRes.data.content)) reviewsData = reviewsRes.data.content;
          else if (Array.isArray(reviewsRes.data.data?.content)) reviewsData = reviewsRes.data.data.content;
        }

        const movieCounts = {};
        
        tickets.forEach(ticket => {
          if (ticket.paymentStatus === 'PAID') {
            const movieId = ticket.movieId;
            if (movieId) {
              if (!movieCounts[movieId]) {
                const dbMovie = allMovies.find(m => m.id === movieId);
                
                // Tính trung bình đánh giá
                const movieReviews = reviewsData.filter(r => r.movieId === movieId);
                let avgRating = 0;
                if (movieReviews.length > 0) {
                  avgRating = parseFloat((movieReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / movieReviews.length).toFixed(1));
                }

                movieCounts[movieId] = {
                  id: movieId,
                  title: ticket.movieName || 'Unknown',
                  poster: ticket.posterUrl || '',
                  ticketCount: 0,
                  totalRevenue: 0,
                  rating: avgRating
                };
              }
              // Tính số vé cho mỗi lượt đặt
              movieCounts[movieId].ticketCount += (ticket.seats?.length || 1);
              // Cộng dồn doanh thu
              movieCounts[movieId].totalRevenue += (ticket.finalAmount || ticket.totalAmount || 0);
            }
          }
        });

        // ĐỔI SORT THEO RATING thay vì doanh thu hay vé
        const sortedMovies = Object.values(movieCounts)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 4);

        setTopMovies(sortedMovies);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };

    fetchTopMovies();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-white">Dashboard</h2>
          <p className="text-cinema-muted text-sm mt-0.5">
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline text-sm px-4 py-2">📊 Xuất báo cáo</button>
          <Link to="/admin/movies" className="btn-primary text-sm px-4 py-2">+ Thêm phim</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => <StatCard key={stat.label} stat={stat} index={i} />)}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-cinema-surface rounded-xl border border-cinema-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-white">Doanh thu 7 ngày qua</h3>
              <span className="text-primary text-sm font-medium">1,842M tổng</span>
            </div>
            {/* Chart type toggle */}
            <div className="flex gap-1 bg-cinema-card rounded-lg p-1 border border-cinema-border">
              <button
                onClick={() => setChartType('bar')}
                title="Biểu đồ cột"
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                  chartType === 'bar' ? 'bg-primary text-cinema-black' : 'text-cinema-muted hover:text-white'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h4v18H3V3zm7 6h4v12h-4V9zm7-4h4v16h-4V5z"/>
                </svg>
                Cột
              </button>
              <button
                onClick={() => setChartType('pie')}
                title="Biểu đồ tròn"
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                  chartType === 'pie' ? 'bg-primary text-cinema-black' : 'text-cinema-muted hover:text-white'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a10 10 0 0 1 10 10h-10V2z" opacity=".6"/>
                  <path d="M12 2v10H2A10 10 0 0 0 12 22V12l8.66 5A10 10 0 0 1 2 12h10z"/>
                </svg>
                Tròn
              </button>
            </div>
          </div>

          {chartType === 'bar' ? (
            <div className="flex items-end gap-2 h-40">
              {REVENUE_WEEKLY.map((val, i) => {
                const heightPct = (val / maxRevenue) * 100;
                const isToday = i === REVENUE_WEEKLY.length - 1;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-cinema-muted text-[10px]">{val}M</span>
                    <div className="w-full relative">
                      <div
                        className={`w-full rounded-t-md transition-all duration-700 ${isToday ? 'bg-gradient-gold' : 'bg-cinema-card hover:bg-cinema-border'}`}
                        style={{ height: `${heightPct * 0.9}px` }}
                      />
                    </div>
                    <span className={`text-[10px] font-medium ${isToday ? 'text-primary' : 'text-cinema-muted'}`}>{DAYS[i]}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <PieChart data={PIE_DATA} />
          )}
        </div>

        {/* Top Movies */}
        <div className="bg-cinema-surface rounded-xl border border-cinema-border p-5">
          <h3 className="font-heading font-bold text-white mb-4">Phim ăn khách nhất</h3>
          <div className="space-y-3">
            {topMovies.length > 0 ? topMovies.map((movie, i) => (
              <div key={movie.id} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i === 0 ? 'bg-primary text-cinema-black' :
                  i === 1 ? 'bg-gray-400 text-cinema-black' :
                  i === 2 ? 'bg-orange-600 text-white' :
                  'bg-cinema-card text-cinema-muted'
                }`}>{i + 1}</span>
                <img src={movie.poster} alt={movie.title}
                  className="w-9 h-12 object-cover rounded flex-shrink-0"
                  onError={e => { e.target.src = 'https://placehold.co/50x70/1E1E2C/A0A0B4'; }} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate" title={movie.title}>{movie.title}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    <span className="text-primary text-xs font-semibold">{movie.rating}</span>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-cinema-muted text-xs">Chưa có dữ liệu đặt vé.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Bookings Table – không có cột trạng thái */}
      <div className="bg-cinema-surface rounded-xl border border-cinema-border">
        <div className="flex items-center justify-between p-5 border-b border-cinema-border">
          <h3 className="font-heading font-bold text-white">Đặt vé gần đây</h3>
          <Link to="/admin/users" className="text-primary text-sm hover:text-primary/80 transition-colors">Xem tất cả →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cinema-border">
                {['Mã vé', 'Khách hàng', 'Phim', 'Ghế', 'Tổng tiền', 'Thời gian'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-cinema-muted text-xs font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cinema-border/50">
              {recentBookings.length > 0 ? recentBookings.map(b => (
                <tr key={b.id} className="hover:bg-cinema-card/50 transition-colors">
                  <td className="px-4 py-3 text-primary font-mono text-xs font-bold">#{b.id}</td>
                  <td className="px-4 py-3 text-white text-sm">{b.user}</td>
                  <td className="px-4 py-3 text-cinema-text text-sm max-w-[150px] truncate">{b.movie}</td>
                  <td className="px-4 py-3 text-cinema-muted text-sm">{b.seats} ghế</td>
                  <td className="px-4 py-3 text-primary text-sm font-semibold">{b.total.toLocaleString('vi-VN')}đ</td>
                  <td className="px-4 py-3 text-cinema-muted text-xs">{b.time}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-cinema-muted text-sm">Chưa có vé nào được đặt.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
