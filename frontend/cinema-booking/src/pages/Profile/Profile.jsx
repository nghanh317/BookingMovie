import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import { accountApi } from '../../api';
const MOCK_BOOKINGS = [
  {
    id: 'CB2F4A9K',
    movie: 'Avengers: Secret Wars',
    poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=120&q=80',
    cinema: 'CGV Vincom Center',
    date: '2026-03-15',
    time: '19:00',
    type: 'IMAX',
    hall: 'IMAX Hall',
    seats: ['E5', 'E6'],
    total: 260000,
    status: 'completed',
  },
  {
    id: 'CB8B1XPZ',
    movie: 'Godzilla vs. Kong',
    poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=120&q=80',
    cinema: 'Lotte Cinema Landmark',
    date: '2026-03-20',
    time: '15:30',
    type: '3D',
    hall: 'Hall A',
    seats: ['C3', 'C4', 'C5'],
    total: 390000,
    status: 'upcoming',
  },
  {
    id: 'CB3K7RNM',
    movie: 'Venom: The Last Dance',
    poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=120&q=80',
    cinema: 'CGV Vincom Center',
    date: '2026-02-20',
    time: '21:30',
    type: '2D',
    hall: 'Cinema 3',
    seats: ['F7'],
    total: 79250,
    status: 'completed',
  },
  {
    id: 'CB9L2WQX',
    movie: 'Spider-Man: Beyond the Spider-Verse',
    poster: 'https://images.unsplash.com/photo-1559163499-413811fb2344?w=120&q=80',
    cinema: 'BHD Star Cineplex',
    date: '2026-04-05',
    time: '10:00',
    type: '2D',
    hall: 'Cinema 2',
    seats: ['B4', 'B5'],
    total: 157500,
    status: 'upcoming',
  },
];

const MOCK_USER = {
  name: 'Nguyễn Văn An',
  email: 'nguyenvanan@email.com',
  phone: '0912345678',
  avatar: null,
  joinDate: '2024-09-01',
  totalBookings: 12,
  totalSpent: 1450000,
  memberLevel: 'Gold',
};

const STATUS_CONFIG = {
  upcoming: { label: 'Sắp tới', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  completed: { label: 'Đã xem', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  cancelled: { label: 'Đã huỷ', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

function Avatar({ name, size = 'lg' }) {
  const initials = name.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase();
  const sizeClass = size === 'lg' ? 'w-24 h-24 text-3xl' : 'w-10 h-10 text-sm';
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-gold flex items-center justify-center font-heading font-bold text-cinema-black shadow-glow-gold`}>
      {initials}
    </div>
  );
}

function BookingCard({ booking }) {
  const status = STATUS_CONFIG[booking.status];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 flex gap-4 hover:border-cinema-muted/50 transition-colors"
    >
      {/* Poster */}
      <div className="flex-shrink-0 w-16 h-24 rounded-lg overflow-hidden">
        <img src={booking.poster} alt={booking.movie} className="w-full h-full object-cover"
          onError={e => { e.target.src = 'https://placehold.co/80x120/1E1E2C/A0A0B4'; }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <h4 className="font-heading font-bold text-white text-sm leading-snug truncate">{booking.movie}</h4>
          <span className={`badge border text-xs font-semibold flex-shrink-0 ${status.color}`}>{status.label}</span>
        </div>
        <div className="mt-1.5 space-y-0.5 text-xs text-cinema-muted">
          <p className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {booking.cinema}
          </p>
          <p className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(booking.date).toLocaleDateString('vi-VN')} lúc {booking.time} · {booking.type}
          </p>
          <p className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            Ghế: {booking.seats.join(', ')}
          </p>
        </div>
      </div>

      {/* Price & Actions */}
      <div className="flex-shrink-0 text-right flex flex-col justify-between">
        <p className="text-primary font-heading font-bold text-sm">
          {booking.total.toLocaleString('vi-VN')}đ
        </p>
        <div className="flex flex-col gap-1 mt-2">
          <span className="text-cinema-muted text-[10px] font-mono">#{booking.id}</span>
          {booking.status === 'upcoming' && (
            <button className="text-red-400 hover:text-red-300 text-xs transition-colors">
              Huỷ vé
            </button>
          )}
          {booking.status === 'completed' && (
            <button className="text-primary hover:text-primary/80 text-xs transition-colors">
              Xem lại
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const TABS = [
  { id: 'overview', label: 'Tổng quan', icon: '👤' },
  { id: 'bookings', label: 'Vé của tôi', icon: '🎟️' },
  { id: 'settings', label: 'Cài đặt', icon: '⚙️' },
];

export default function Profile() {
  const { user: authUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editMode, setEditMode] = useState(false);
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);

  // Tạo userData từ auth store (hỗ trợ cả mock & backend user)
  const defaultUserData = {
    name: authUser?.fullName || authUser?.name || MOCK_USER.name,
    email: authUser?.email || MOCK_USER.email,
    phone: authUser?.phone || MOCK_USER.phone,
    avatar: null,
    joinDate: authUser?.createDate || MOCK_USER.joinDate,
    totalBookings: 0,
    totalSpent: 0,
    memberLevel: 'Gold',
  };

  const [userData, setUserData] = useState(defaultUserData);
  const [formData, setFormData] = useState({ ...defaultUserData });

  // Fetch thông tin chi tiết tài khoản (kèm vé) từ backend
  useEffect(() => {
    const fetchAccountDetail = async () => {
      if (!authUser?.id) return;
      try {
        const { data } = await accountApi.getById(authUser.id);
        const updated = {
          ...defaultUserData,
          name: data.fullName || defaultUserData.name,
          email: data.email || defaultUserData.email,
          phone: data.phone || defaultUserData.phone,
          joinDate: data.createDate || defaultUserData.joinDate,
          totalBookings: data.tickets?.length || 0,
          totalSpent: data.tickets?.reduce((sum, t) => sum + (t.finalAmount || 0), 0) || 0,
        };
        setUserData(updated);
        setFormData({ ...updated });

        // Map tickets vào bookings
        if (data.tickets && data.tickets.length > 0) {
          const mapped = data.tickets.map(t => ({
            id: t.ticketsCode || t.id,
            movie: 'Vé #' + (t.ticketsCode || t.id),
            poster: 'https://placehold.co/80x120/1E1E2C/A0A0B4',
            cinema: '-',
            date: new Date().toISOString().split('T')[0],
            time: '-',
            type: '-',
            hall: '-',
            seats: [],
            total: t.finalAmount || t.totalAmount || 0,
            status: t.status === 'ACTIVE' ? 'upcoming' : t.status === 'CANCELLED' ? 'cancelled' : 'completed',
          }));
          setBookings(mapped);
        }
      } catch (err) {
        console.warn('⚠️ Không lấy được thông tin tài khoản, dùng mock:', err.message);
      }
    };
    fetchAccountDetail();
  }, [authUser?.id]);

  const filteredBookings = filterStatus === 'all'
    ? bookings
    : bookings.filter(b => b.status === filterStatus);

  const handleSaveProfile = () => {
    setUserData({ ...formData });
    setEditMode(false);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-5"
        >
          <Avatar name={userData.name} size="lg" />

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
              <h1 className="font-heading font-extrabold text-2xl text-white">{userData.name}</h1>
              <span className={`badge inline-flex self-center sm:self-auto text-xs font-bold px-2.5 py-1 ${
                userData.memberLevel === 'Gold' ? 'bg-primary/20 border border-primary/40 text-primary' :
                userData.memberLevel === 'Silver' ? 'bg-gray-400/20 border border-gray-400/40 text-gray-300' :
                'bg-orange-500/20 border border-orange-500/40 text-orange-400'
              }`}>
                {userData.memberLevel === 'Gold' ? '⭐' : '🥈'} {userData.memberLevel} Member
              </span>
            </div>
            <p className="text-cinema-muted text-sm mb-3">{userData.email} · {userData.phone}</p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-6">
              <div>
                <p className="text-primary font-heading font-bold text-xl">{userData.totalBookings}</p>
                <p className="text-cinema-muted text-xs">Vé đã đặt</p>
              </div>
              <div>
                <p className="text-primary font-heading font-bold text-xl">
                  {(userData.totalSpent / 1000000).toFixed(1)}M
                </p>
                <p className="text-cinema-muted text-xs">Tổng chi tiêu</p>
              </div>
              <div>
                <p className="text-primary font-heading font-bold text-xl">
                  {new Date(userData.joinDate).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short' })}
                </p>
                <p className="text-cinema-muted text-xs">Ngày tham gia</p>
              </div>
            </div>
          </div>

          <Link to="/" className="btn-outline text-sm px-4 py-2 self-start">
            ← Trang chủ
          </Link>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-cinema-surface rounded-xl p-1 border border-cinema-border mb-6">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-cinema-card border border-cinema-border text-white shadow'
                  : 'text-cinema-muted hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 gap-5"
            >
              {/* Recent Bookings */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-bold text-white">Vé gần đây</h3>
                  <button onClick={() => setActiveTab('bookings')} className="text-primary text-xs hover:text-primary/80 transition-colors">
                    Xem tất cả →
                  </button>
                </div>
                <div className="space-y-3">
                  {bookings.slice(0, 2).map(b => (
                    <div key={b.id} className="flex gap-3 items-center">
                      <img src={b.poster} alt={b.movie} className="w-10 h-14 object-cover rounded-lg flex-shrink-0"
                        onError={e => { e.target.src = 'https://placehold.co/60x84/1E1E2C/A0A0B4'; }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{b.movie}</p>
                        <p className="text-cinema-muted text-xs">{new Date(b.date).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <span className={`badge border text-xs ${STATUS_CONFIG[b.status].color}`}>
                        {STATUS_CONFIG[b.status].label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vouchers / Benefits */}
              <div className="card p-5">
                <h3 className="font-heading font-bold text-white mb-4">Ưu đãi của tôi</h3>
                <div className="space-y-3">
                  {[
                    { code: 'GOLD20', desc: 'Giảm 20% cho lần đặt vé tiếp theo', exp: '31/03/2026', color: 'border-primary/40 bg-primary/5' },
                    { code: 'WEEKEND15', desc: 'Giảm 15% vào cuối tuần', exp: '15/04/2026', color: 'border-blue-500/40 bg-blue-500/5' },
                  ].map(v => (
                    <div key={v.code} className={`rounded-xl border p-3 ${v.color}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-primary text-sm">{v.code}</span>
                        <button className="text-xs text-cinema-muted hover:text-white transition-colors border border-cinema-border px-2 py-0.5 rounded">
                          Sao chép
                        </button>
                      </div>
                      <p className="text-cinema-text text-xs">{v.desc}</p>
                      <p className="text-cinema-muted text-[10px] mt-1">HSD: {v.exp}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Loyalty Progress */}
              <div className="card p-5 md:col-span-2">
                <h3 className="font-heading font-bold text-white mb-4">Điểm thành viên</h3>
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-center">
                    <p className="text-primary font-heading font-extrabold text-3xl">2,450</p>
                    <p className="text-cinema-muted text-xs mt-0.5">điểm hiện tại</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-cinema-muted">Gold (2,000đ)</span>
                      <span className="text-cinema-muted">Platinum (5,000đ)</span>
                    </div>
                    <div className="h-3 bg-cinema-surface rounded-full overflow-hidden border border-cinema-border">
                      <div
                        className="h-full bg-gradient-gold rounded-full transition-all duration-1000"
                        style={{ width: `${(2450 / 5000) * 100}%` }}
                      />
                    </div>
                    <p className="text-cinema-muted text-xs mt-1.5">Còn 2,550 điểm để lên hạng <span className="text-white font-semibold">Platinum</span></p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'bookings' && (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Filter */}
              <div className="flex gap-2 mb-5 flex-wrap">
                {[
                  { value: 'all', label: 'Tất cả' },
                  { value: 'upcoming', label: '🕐 Sắp tới' },
                  { value: 'completed', label: '✅ Đã xem' },
                  { value: 'cancelled', label: '❌ Đã huỷ' },
                ].map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFilterStatus(f.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                      filterStatus === f.value
                        ? 'bg-primary border-primary text-cinema-black'
                        : 'border-cinema-border text-cinema-muted hover:border-cinema-muted hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Booking list */}
              <div className="space-y-3">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map(b => <BookingCard key={b.id} booking={b} />)
                ) : (
                  <div className="text-center py-16">
                    <div className="text-5xl mb-3">🎟️</div>
                    <p className="text-white font-semibold mb-1">Chưa có vé nào</p>
                    <p className="text-cinema-muted text-sm mb-4">Đặt vé ngay để trải nghiệm điện ảnh!</p>
                    <Link to="/movies" className="btn-primary inline-block px-6 py-2.5 text-sm">Xem phim ngay</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 gap-5"
            >
              {/* Edit Profile */}
              <div className="card p-6 md:col-span-2">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-heading font-bold text-white">Thông tin cá nhân</h3>
                  {!editMode ? (
                    <button onClick={() => setEditMode(true)} className="btn-outline text-sm px-4 py-2">
                      ✏️ Chỉnh sửa
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => { setEditMode(false); setFormData({ ...userData }); }} className="btn-outline text-sm px-4 py-2">Huỷ</button>
                      <button onClick={handleSaveProfile} className="btn-primary text-sm px-4 py-2">Lưu</button>
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { key: 'name', label: 'Họ và tên', type: 'text' },
                    { key: 'phone', label: 'Số điện thoại', type: 'tel' },
                    { key: 'email', label: 'Email', type: 'email' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-cinema-muted text-xs mb-1.5">{field.label}</label>
                      {editMode ? (
                        <input
                          type={field.type}
                          value={formData[field.key]}
                          onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                          className="input-field"
                        />
                      ) : (
                        <p className="text-white py-3 px-4 bg-cinema-surface rounded-lg border border-cinema-border text-sm">
                          {userData[field.key]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Change Password */}
              <div className="card p-6">
                <h3 className="font-heading font-bold text-white mb-4">Đổi mật khẩu</h3>
                <div className="space-y-3">
                  {['Mật khẩu hiện tại', 'Mật khẩu mới', 'Xác nhận mật khẩu mới'].map(label => (
                    <div key={label}>
                      <label className="block text-cinema-muted text-xs mb-1.5">{label}</label>
                      <input type="password" placeholder="••••••••" className="input-field" />
                    </div>
                  ))}
                  <button className="btn-primary w-full py-2.5 mt-2 text-sm">Cập nhật mật khẩu</button>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="card p-6">
                <h3 className="font-heading font-bold text-white mb-4">Thông báo</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Email xác nhận đặt vé', checked: true },
                    { label: 'Thông báo phim mới', checked: true },
                    { label: 'Ưu đãi và khuyến mãi', checked: false },
                    { label: 'Nhắc nhở trước suất chiếu', checked: true },
                  ].map(item => (
                    <label key={item.label} className="flex items-center justify-between cursor-pointer group">
                      <span className="text-cinema-text text-sm group-hover:text-white transition-colors">{item.label}</span>
                      <div className="relative">
                        <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                        <div className="w-11 h-6 bg-cinema-border rounded-full peer-checked:bg-primary transition-colors cursor-pointer" />
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="card p-6 border-red-500/20 bg-red-500/5 md:col-span-2">
                <h3 className="font-heading font-bold text-red-400 mb-2">Vùng nguy hiểm</h3>
                <p className="text-cinema-muted text-sm mb-4">Các thao tác này không thể hoàn tác. Hãy cân nhắc kỹ trước khi thực hiện.</p>
                <div className="flex flex-wrap gap-3">
                  <button className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-all">
                    Xoá lịch sử đặt vé
                  </button>
                  <button className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-all">
                    Đăng xuất tất cả thiết bị
                  </button>
                  <button className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/20 text-sm transition-all font-medium">
                    Xoá tài khoản
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
