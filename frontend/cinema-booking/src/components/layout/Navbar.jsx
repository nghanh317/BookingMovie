import { Link, NavLink as RNavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import cinemaService from '../../services/cinemaService';

// NavLink với hiệu ứng active: vàng nếu đang ở trang đó
const NavLink = ({ to, children, end }) => (
  <RNavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `font-medium text-sm transition-colors duration-200 ${
        isActive
          ? 'text-primary font-semibold'
          : 'text-cinema-muted hover:text-primary'
      }`
    }
  >
    {children}
  </RNavLink>
);

/** Dropdown item rạp phim */
function CinemaDropdownItem({ cinema, onClick }) {
  return (
    <Link
      to={`/cinemas/${cinema.id}`}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 text-cinema-muted hover:text-white hover:bg-cinema-surface transition-all duration-150 group"
    >
      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium group-hover:text-white truncate">{cinema.name}</p>
        <p className="text-xs text-cinema-muted truncate">{cinema.city} · {(cinema.rooms || []).length || cinema.screens || 0} phòng</p>
      </div>
      {cinema.rating > 0 && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span className="text-primary text-xs font-semibold">{cinema.rating}</span>
        </div>
      )}
    </Link>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cinemaDropdownOpen, setCinemaDropdownOpen] = useState(false);
  const [cinemas, setCinemas] = useState([]);
  const [cinemasLoading, setCinemasLoading] = useState(false);
  const [mobileCinemaOpen, setMobileCinemaOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const cinemaDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);
  const navigate = useNavigate();

  const { isLoggedIn, user, logout } = useAuthStore();
  const { notifications, getUnreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const unreadCount = getUnreadCount();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Đóng user menu khi click ngoài
  useEffect(() => {
    const close = () => setUserMenuOpen(false);
    if (userMenuOpen) document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [userMenuOpen]);

  // Đóng cinema dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cinemaDropdownRef.current && !cinemaDropdownRef.current.contains(e.target)) {
        setCinemaDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadCinemasWithRating = async () => {
    if (cinemas.length > 0) return;
    setCinemasLoading(true);
    try {
      const { default: api } = await import('../../services/api');
      const [cinemasData, reviewsRes] = await Promise.all([
        cinemaService.getAll(),
        api.get('/v1/cinema-reviews', { params: { size: 1000 } }).catch(() => ({ data: [] }))
      ]);

      let cReviewsData = [];
      if (Array.isArray(reviewsRes.data)) cReviewsData = reviewsRes.data;
      else if (Array.isArray(reviewsRes.data?.data)) cReviewsData = reviewsRes.data.data;
      else if (Array.isArray(reviewsRes.data?.content)) cReviewsData = reviewsRes.data.content;
      else if (Array.isArray(reviewsRes.data?.data?.content)) cReviewsData = reviewsRes.data.data.content;

      const rawCinemas = Array.isArray(cinemasData) ? cinemasData : [];
      const enrichedCinemas = rawCinemas.map(c => {
        const cReviews = cReviewsData.filter(r => r.cinemaId === c.id);
        let avg = 0;
        if (cReviews.length > 0) {
          avg = cReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / cReviews.length;
        }
        return { ...c, rating: avg > 0 ? Number(avg.toFixed(1)) : 0, reviewCount: cReviews.length };
      });
      setCinemas(enrichedCinemas);
    } catch (err) {
      console.error('Error loading cinemas in navbar:', err);
    } finally {
      setCinemasLoading(false);
    }
  };

  // Load danh sách rạp khi hover vào "Rạp Phim"
  const handleCinemaHover = () => {
    loadCinemasWithRating();
    setCinemaDropdownOpen(true);
  };

  // Load cinemas cho mobile menu
  const handleMobileCinemaToggle = () => {
    loadCinemasWithRating();
    setMobileCinemaOpen(!mobileCinemaOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const displayName = user?.fullName || user?.userName || '';
  const initials = displayName
    ? displayName.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase()
    : '?';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-cinema-dark/95 backdrop-blur-md border-b border-cinema-border shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center shadow-glow-gold group-hover:scale-110 transition-transform duration-200">
              <span className="text-cinema-black font-heading font-bold text-sm">C</span>
            </div>
            <span className="font-heading font-bold text-xl text-white">
              Cinema<span className="text-primary">Book</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7">
            <NavLink to="/" end>Trang Chủ</NavLink>
            <NavLink to="/movies">Phim</NavLink>

            {/* Rạp Phim Dropdown */}
            <div
              ref={cinemaDropdownRef}
              className="relative"
              onMouseEnter={handleCinemaHover}
              onMouseLeave={() => setCinemaDropdownOpen(false)}
            >
              <button
                onClick={() => { handleCinemaHover(); setCinemaDropdownOpen(!cinemaDropdownOpen); }}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 ${
                  cinemaDropdownOpen ? 'text-primary' : 'text-cinema-muted hover:text-primary'
                }`}
              >
                Rạp Phim
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${cinemaDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Panel */}
              <AnimatePresence>
                {cinemaDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full mt-2 w-72 bg-cinema-card border border-cinema-border rounded-2xl shadow-card-hover overflow-hidden z-50"
                  >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-cinema-border bg-cinema-surface flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold text-sm">Hệ Thống Rạp Phim</p>
                        <p className="text-cinema-muted text-xs mt-0.5">Chọn rạp để xem lịch chiếu</p>
                      </div>
                      <Link to="/cinemas" onClick={() => setCinemaDropdownOpen(false)} className="text-primary text-xs font-medium hover:underline">
                        Xem tất cả
                      </Link>
                    </div>

                    {/* Cinema List */}
                    <div className="py-1.5 max-h-72 overflow-y-auto">
                      {cinemasLoading ? (
                        <div className="py-6 text-center">
                          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          <p className="text-cinema-muted text-xs">Đang tải...</p>
                        </div>
                      ) : cinemas.length > 0 ? (
                        cinemas.map((cinema) => (
                          <CinemaDropdownItem
                            key={cinema.id}
                            cinema={cinema}
                            onClick={() => setCinemaDropdownOpen(false)}
                          />
                        ))
                      ) : (
                        <div className="py-6 text-center text-cinema-muted text-sm">
                          Không tìm thấy rạp nào
                        </div>
                      )}
                    </div>
                    {/* Footer link to all cinemas */}
                    <div className="px-4 py-2 border-t border-cinema-border">
                      <Link to="/cinemas" onClick={() => setCinemaDropdownOpen(false)}
                        className="flex items-center justify-center gap-1.5 text-primary text-xs font-semibold hover:underline py-1">
                        🏟️ Xem toàn bộ rạp phim →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Top Phim */}
            <NavLink to="/top-movies">🏆 Top Phim</NavLink>
            {/* Tin tức & Khuyến mãi */}
            <NavLink to="/news">📰 Tin tức & KM</NavLink>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-cinema-muted hover:text-primary transition-colors duration-200 rounded-lg hover:bg-cinema-surface"
              aria-label="Tìm kiếm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Notifications */}
            {isLoggedIn && user && (
              <div className="relative hidden md:block" ref={notifDropdownRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="p-2 relative text-cinema-muted hover:text-white transition-colors duration-200 rounded-lg hover:bg-cinema-surface"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-cinema-dark" />
                  )}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 bg-cinema-card border border-cinema-border rounded-xl shadow-card-hover overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-cinema-border bg-cinema-surface flex items-center justify-between">
                        <span className="text-white font-semibold text-sm">Thông báo</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllAsRead} className="text-primary text-xs hover:underline">
                            Đánh dấu đã đọc
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.filter(n => !n.isAdmin).length > 0 ? notifications.filter(n => !n.isAdmin).map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => !n.read && markAsRead(n.id)}
                            className={`px-4 py-3 border-b border-cinema-border/50 hover:bg-cinema-surface/50 cursor-pointer transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                          >
                            <p className={`text-sm mb-0.5 ${!n.read ? 'text-white font-medium' : 'text-cinema-muted'}`}>{n.title}</p>
                            <p className="text-xs text-cinema-muted line-clamp-2 leading-relaxed">{n.message}</p>
                            <p className="text-[10px] text-cinema-muted/50 mt-1.5">
                              {new Date(n.date).toLocaleDateString('vi-VN')} lúc {new Date(n.date).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                        )) : (
                          <div className="p-6 text-center text-cinema-muted text-sm">
                            <span className="text-2xl mb-2 block">📭</span>
                            Không có thông báo nào
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Desktop: Avatar dropdown OR Login/Register */}
            <div className="hidden md:flex items-center gap-2">
              {isLoggedIn && user ? (
                <div className="relative" onClick={e => e.stopPropagation()}>
                  {/* Avatar button */}
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl border border-cinema-border bg-cinema-surface hover:border-primary transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center text-cinema-black font-heading font-bold text-xs">
                      {initials}
                    </div>
                    <div className="text-left">
                      <p className="text-white text-xs font-semibold leading-tight">{displayName.split(' ').pop() || user?.userName}</p>
                      <p className={`text-[10px] font-medium ${(user.role || '').toUpperCase() === 'ADMIN' ? 'text-accent' : 'text-primary'}`}>
                        {(user.role || '').toUpperCase() === 'ADMIN' ? '🛠️ Admin' : '⭐ Thành viên'}
                      </p>
                    </div>
                    <svg className={`w-3.5 h-3.5 text-cinema-muted transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-cinema-card border border-cinema-border rounded-xl shadow-card-hover overflow-hidden z-50"
                      >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-cinema-border bg-cinema-surface">
                          <p className="text-white font-semibold text-sm">{displayName || user?.userName}</p>
                          <p className="text-cinema-muted text-xs mt-0.5">
                            {(user.role || '').toUpperCase() === 'ADMIN' ? '🛠️ Quản trị viên' : '⭐ Thành viên'}
                          </p>
                        </div>

                        {/* Links */}
                        <div className="py-1.5">
                          <Link to="/profile?tab=overview" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-cinema-muted hover:text-white hover:bg-cinema-surface transition-all duration-150 text-sm">
                            <span>👤</span> Hồ sơ của tôi
                          </Link>
                          <Link to="/profile?tab=bookings" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-cinema-muted hover:text-white hover:bg-cinema-surface transition-all duration-150 text-sm">
                            <span>🎟️</span> Vé đã đặt
                          </Link>
                          <Link to="/profile?tab=favorites" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-cinema-muted hover:text-white hover:bg-cinema-surface transition-all duration-150 text-sm">
                            <span>❤️</span> Phim yêu thích
                          </Link>
                          <Link to="/profile?tab=offers" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-cinema-muted hover:text-white hover:bg-cinema-surface transition-all duration-150 text-sm">
                            <span>🎁</span> Ưu đãi của tôi
                          </Link>

                          {(user.role || '').toUpperCase() === 'ADMIN' && (
                            <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-accent hover:text-white hover:bg-cinema-surface transition-all duration-150 text-sm font-medium">
                              <span>🛠️</span> Admin Panel
                            </Link>
                          )}
                        </div>

                        {/* Logout */}
                        <div className="border-t border-cinema-border py-1.5">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition-all duration-150 text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Đăng xuất
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link to="/login" className="btn-outline text-sm px-4 py-2">Đăng Nhập</Link>
                  <Link to="/register" className="btn-primary text-sm px-4 py-2">Đăng Ký</Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-cinema-muted hover:text-white transition-colors rounded-lg hover:bg-cinema-surface"
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-cinema-border overflow-hidden"
            >
              <form onSubmit={handleSearch} className="py-3 flex gap-2">
                <input autoFocus type="text" value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm phim..." className="input-field" />
                <button type="submit" className="btn-primary px-4 py-2 text-sm whitespace-nowrap">Tìm</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-cinema-border overflow-hidden"
            >
              <nav className="py-4 flex flex-col gap-1">
                <RNavLink
                  to="/"
                  end
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                      isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-cinema-muted hover:text-primary hover:bg-cinema-surface'
                    }`
                  }
                >
                  Trang Chủ
                </RNavLink>
                <RNavLink
                  to="/movies"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                      isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-cinema-muted hover:text-primary hover:bg-cinema-surface'
                    }`
                  }
                >
                  Phim
                </RNavLink>

                {/* Mobile: Rạp Phim collapsible */}
                <div>
                  <button
                    onClick={handleMobileCinemaToggle}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-cinema-muted hover:text-primary hover:bg-cinema-surface transition-colors font-medium text-sm"
                  >
                    <span>🎪 Rạp Phim</span>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${mobileCinemaOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <AnimatePresence>
                    {mobileCinemaOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden ml-3 mt-1 border-l-2 border-primary/20 pl-3"
                      >
                        {cinemasLoading ? (
                          <div className="py-3 text-center">
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                          </div>
                        ) : (
                          cinemas.map((cinema) => (
                            <Link
                              key={cinema.id}
                              to={`/cinemas/${cinema.id}`}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-2 py-2 text-cinema-muted hover:text-primary transition-colors text-sm"
                            >
                              <span className="text-primary text-xs">▸</span>
                              <div>
                                <p className="font-medium">{cinema.name}</p>
                                <p className="text-xs text-cinema-muted/70">{cinema.city}</p>
                              </div>
                            </Link>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <RNavLink
                  to="/top-movies"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                      isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-cinema-muted hover:text-primary hover:bg-cinema-surface'
                    }`
                  }
                >
                  🏆 Top Phim
                </RNavLink>

                <RNavLink
                  to="/news"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                      isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-cinema-muted hover:text-primary hover:bg-cinema-surface'
                    }`
                  }
                >
                  📰 Tin tức & KM
                </RNavLink>

                <div className="pt-2 border-t border-cinema-border mt-2">
                  {isLoggedIn && user ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center text-cinema-black font-heading font-bold text-sm">
                          {initials}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{displayName || user?.userName}</p>
                          <p className={`text-xs ${(user.role || '').toUpperCase() === 'ADMIN' ? 'text-accent' : 'text-primary'}`}>
                            {(user.role || '').toUpperCase() === 'ADMIN' ? '🛠️ Admin' : '⭐ Thành viên'}
                          </p>
                        </div>
                      </div>
                      <Link to="/profile?tab=overview" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-cinema-muted hover:text-primary transition-colors text-sm">
                        👤 Hồ sơ của tôi
                      </Link>
                      <Link to="/profile?tab=favorites" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-cinema-muted hover:text-primary transition-colors text-sm">
                        ❤️ Phim yêu thích
                      </Link>
                      <Link to="/profile?tab=offers" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-cinema-muted hover:text-primary transition-colors text-sm">
                        🎁 Ưu đãi của tôi
                      </Link>
                      {(user.role || '').toUpperCase() === 'ADMIN' && (
                        <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-accent hover:text-white transition-colors text-sm font-medium">
                          🛠️ Admin Panel
                        </Link>
                      )}
                      <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 transition-colors text-sm w-full">
                        🚪 Đăng xuất
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 px-3">
                      <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 btn-outline text-sm py-2 text-center">Đăng Nhập</Link>
                      <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 btn-primary text-sm py-2 text-center">Đăng Ký</Link>
                    </div>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
