import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';

const NavLink = ({ to, children }) => (
  <Link
    to={to}
    className="text-cinema-muted hover:text-primary transition-colors duration-200 font-medium text-sm"
  >
    {children}
  </Link>
);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ Dùng authStore thay cho mock cứng
  const { isLoggedIn, user, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const close = () => setUserMenuOpen(false);
    if (userMenuOpen) document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [userMenuOpen]);

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

  const displayName = user?.fullName || user?.name || '?';
  const initials = displayName !== '?'
    ? displayName.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase()
    : '?';
  const isAdmin = user?.role === 'admin' || user?.role === 'ADMIN';

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
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/">Trang Chủ</NavLink>
            <NavLink to="/movies">Phim</NavLink>
            <NavLink to="/offers">🎁 Ưu Đãi Của Tôi</NavLink>
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
                      <p className="text-white text-xs font-semibold leading-tight">{displayName.split(' ').pop()}</p>
                      <p className={`text-[10px] font-medium ${isAdmin ? 'text-accent' : 'text-primary'}`}>
                        {isAdmin ? '🛠️ Admin' : `⭐ ${user.level || 'Member'}`}
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
                          <p className="text-white font-semibold text-sm">{displayName}</p>
                          <p className="text-cinema-muted text-xs mt-0.5">
                            {isAdmin ? '🛠️ Quản trị viên' : `⭐ Thành viên ${user.level || ''}`}
                          </p>
                        </div>

                        {/* Links */}
                        <div className="py-1.5">
                          <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-cinema-muted hover:text-white hover:bg-cinema-surface transition-all duration-150 text-sm">
                            <span>👤</span> Hồ sơ của tôi
                          </Link>
                          <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-cinema-muted hover:text-white hover:bg-cinema-surface transition-all duration-150 text-sm">
                            <span>🎟️</span> Vé đã đặt
                          </Link>

                          {/* Chỉ admin mới thấy Admin Panel */}
                          {isAdmin && (
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
              <nav className="py-4 flex flex-col gap-4">
                <Link to="/" onClick={() => setMobileOpen(false)} className="text-cinema-muted hover:text-primary transition-colors font-medium">Trang Chủ</Link>
                <Link to="/movies" onClick={() => setMobileOpen(false)} className="text-cinema-muted hover:text-primary transition-colors font-medium">Phim</Link>
                <Link to="/offers" onClick={() => setMobileOpen(false)} className="text-cinema-muted hover:text-primary transition-colors font-medium">🎁 Ưu Đãi Của Tôi</Link>

                <div className="pt-2 border-t border-cinema-border">
                  {isLoggedIn && user ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center text-cinema-black font-heading font-bold text-sm">
                          {initials}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{displayName}</p>
                          <p className={`text-xs ${isAdmin ? 'text-accent' : 'text-primary'}`}>
                            {isAdmin ? '🛠️ Admin' : `⭐ ${user.level || ''} Member`}
                          </p>
                        </div>
                      </div>
                      <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-cinema-muted hover:text-primary transition-colors text-sm">
                        👤 Hồ sơ của tôi
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-accent hover:text-white transition-colors text-sm font-medium">
                          🛠️ Admin Panel
                        </Link>
                      )}
                      <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm">
                        🚪 Đăng xuất
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
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
