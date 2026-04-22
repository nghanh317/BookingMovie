import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import movieApi from '../../api/movieApi';
import cinemaApi from '../../api/cinemaApi';
import { ticketApi } from '../../api';

const REVENUE_WEEKLY = [180, 220, 195, 310, 280, 410, 247]; // MOCK Triệu đồng mỗi ngày
const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const maxRevenue = Math.max(...REVENUE_WEEKLY);

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
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [moviesRes, cinemasRes, ticketsRes] = await Promise.all([
          movieApi.getAll({ size: 100 }),
          cinemaApi.getAll({ size: 100 }),
          ticketApi.getAll({ size: 100 })
        ]);
        // Backend trả về { data: [...] } hoặc { data: { content: [...] } }
        const parseList = (res) => {
          const d = res.data;
          return Array.isArray(d) ? d : (d?.data || d?.content || []);
        };
        setMovies(parseList(moviesRes));
        setCinemas(parseList(cinemasRes));
        setTickets(parseList(ticketsRes));
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute stats
  const totalTickets = tickets.length;
  const totalRevenue = tickets.reduce((sum, t) => sum + (t.finalAmount || t.totalAmount || 0), 0);
  
  const STATS = [
    { label: 'Tổng phim', value: movies.length, icon: '🎬', change: 'Tháng này', color: 'border-blue-500/30 bg-blue-500/5' },
    { label: 'Rạp chiếu phim', value: cinemas.length, icon: '🏟️', change: 'Đang hoạt động', color: 'border-green-500/30 bg-green-500/5' },
    { label: 'Tổng vé', value: totalTickets, icon: '🎟️', change: 'Đã bán', color: 'border-primary/30 bg-primary/5' },
    { label: 'Tổng doanh thu', value: `${(totalRevenue / 1000000).toFixed(1)}M`, icon: '💰', change: 'Cập nhật', color: 'border-accent/30 bg-accent/5' },
  ];

  const recentBookings = tickets.slice(0, 5).map(t => ({
    id: t.ticketsCode || t.id,
    user: t.accountsFullName || 'Khách',
    movie: t.roomName ? `Phòng ${t.roomName}` : 'Phim CGV', // Best guess from basic ticket
    seats: t.seats?.length || 1,
    total: t.finalAmount || t.totalAmount || 0,
    time: new Date(t.ticketsDate || t.createDate || Date.now()).toLocaleDateString('vi-VN'),
    status: t.paymentStatus === 'PAID' ? 'confirmed' : 'pending'
  }));

  const topMovies = [...movies].sort((a, b) => (b.viewCount || b.rating || 0) - (a.viewCount || a.rating || 0)).slice(0, 4);

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

      {loading ? (
        <div className="text-center py-20 text-cinema-muted">Đang tải Dashboard...</div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((stat, i) => <StatCard key={stat.label} stat={stat} index={i} />)}
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-cinema-surface rounded-xl border border-cinema-border p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading font-bold text-white">Doanh thu 7 ngày qua</h3>
                <span className="text-primary text-sm font-medium">Biểu đồ ước tính</span>
              </div>
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
            </div>

            {/* Top Movies */}
            <div className="bg-cinema-surface rounded-xl border border-cinema-border p-5">
              <h3 className="font-heading font-bold text-white mb-4">Phim ăn khách nhất</h3>
              <div className="space-y-3">
                {topMovies.map((movie, i) => (
                  <div key={movie.id} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      i === 0 ? 'bg-primary text-cinema-black' :
                      i === 1 ? 'bg-gray-400 text-cinema-black' :
                      i === 2 ? 'bg-orange-600 text-white' :
                      'bg-cinema-card text-cinema-muted'
                    }`}>{i + 1}</span>
                    <img src={movie.heroImage || movie.poster || 'https://placehold.co/50x70/1E1E2C/A0A0B4'} alt={movie.title || movie.name}
                      className="w-9 h-12 object-cover rounded flex-shrink-0"
                      onError={e => { e.target.src = 'https://placehold.co/50x70/1E1E2C/A0A0B4'; }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{movie.title || movie.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span className="text-primary text-xs font-semibold">{movie.rating || '5.0'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Bookings Table */}
          <div className="bg-cinema-surface rounded-xl border border-cinema-border">
            <div className="flex items-center justify-between p-5 border-b border-cinema-border">
              <h3 className="font-heading font-bold text-white">Đặt vé gần đây</h3>
              <Link to="/admin/users" className="text-primary text-sm hover:text-primary/80 transition-colors">Xem tất cả →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cinema-border">
                    {['Mã vé', 'Khách hàng', 'Phim/Suất', 'Ghế', 'Tổng tiền', 'Ngày', 'Trạng thái'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-cinema-muted text-xs font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cinema-border/50">
                  {recentBookings.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-6 text-cinema-muted">Không có dữ liệu</td>
                    </tr>
                  )}
                  {recentBookings.map(b => (
                    <tr key={b.id} className="hover:bg-cinema-card/50 transition-colors">
                      <td className="px-4 py-3 text-primary font-mono text-xs font-bold">#{b.id}</td>
                      <td className="px-4 py-3 text-white text-sm">{b.user}</td>
                      <td className="px-4 py-3 text-cinema-text text-sm max-w-[150px] truncate">{b.movie}</td>
                      <td className="px-4 py-3 text-cinema-muted text-sm">{b.seats} ghế</td>
                      <td className="px-4 py-3 text-primary text-sm font-semibold">{b.total.toLocaleString('vi-VN')}đ</td>
                      <td className="px-4 py-3 text-cinema-muted text-xs">{b.time}</td>
                      <td className="px-4 py-3">
                        <span className={`badge text-xs font-semibold border ${
                          b.status === 'confirmed' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                          b.status === 'pending' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' :
                          'bg-red-500/20 border-red-500/30 text-red-400'
                        }`}>
                          {b.status === 'confirmed' ? 'Xác nhận' : b.status === 'pending' ? 'Chờ' : 'Huỷ'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
