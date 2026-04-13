import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MOVIES } from '../../constants/mockData';
import { movieApi } from '../../api';
import MovieCard from '../../components/movie/MovieCard';

/**
 * Chuyển đổi MovieDTO từ backend sang format frontend
 */
function mapMovieDTO(dto) {
  return {
    id: dto.id,
    title: dto.title || 'Không có tên',
    originalTitle: dto.title,
    poster: dto.posterUrl || `https://placehold.co/300x450/1E1E2C/A0A0B4?text=${encodeURIComponent(dto.title || 'Movie')}`,
    backdrop: dto.posterUrl || `https://placehold.co/1920x1080/1A1A24/A0A0B4?text=${encodeURIComponent(dto.title || 'Movie')}`,
    rating: 8.0,
    genre: dto.genre ? dto.genre.split(',').map(g => g.trim()) : ['Chưa phân loại'],
    duration: dto.duration || 0,
    language: dto.language || 'N/A',
    releaseDate: dto.releaseDate,
    director: dto.director || 'N/A',
    cast: dto.cast ? dto.cast.split(',').map(c => c.trim()) : [],
    description: dto.description || '',
    trailer: dto.trailerUrl || '',
    status: dto.status === 'NOW_SHOWING' ? 'now_showing' : dto.status === 'COMING_SOON' ? 'coming_soon' : (dto.status || 'now_showing').toLowerCase(),
    ageRating: 'T13',
  };
}

// --- Hero Carousel ---
function HeroBanner({ movies }) {
  const featured = movies.filter(m => m.status === 'now_showing').slice(0, 3);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (featured.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % featured.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (featured.length === 0) return null;
  const movie = featured[current];

  return (
    <div className="relative h-[85vh] min-h-[500px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div key={movie.id} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="absolute inset-0">
          <img src={movie.backdrop} alt={movie.title} className="w-full h-full object-cover"
            onError={(e) => { e.target.src = `https://placehold.co/1920x1080/1A1A24/A0A0B4?text=${encodeURIComponent(movie.title)}`; }} />
          <div className="absolute inset-0 bg-gradient-to-r from-cinema-black via-cinema-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-black via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 container mx-auto px-4 max-w-7xl h-full flex items-center">
        <AnimatePresence mode="wait">
          <motion.div key={movie.id} initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.6 }} className="max-w-xl">
            <span className="badge bg-accent text-white text-xs font-semibold mb-4 inline-block">● ĐANG CHIẾU</span>
            <h1 className="font-heading font-extrabold text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-4">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="text-primary font-bold text-lg">{movie.rating}</span>
              </div>
              <span className="text-cinema-muted">•</span>
              <span className="text-cinema-muted">{movie.duration} phút</span>
              <span className="text-cinema-muted">•</span>
              <span className="text-cinema-muted">{movie.language}</span>
              <span className="bg-cinema-surface border border-cinema-border text-cinema-muted text-xs px-2 py-0.5 rounded">{movie.ageRating}</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-5">
              {movie.genre.map(g => (
                <span key={g} className="badge bg-white/10 border border-white/20 text-white/80 text-xs">{g}</span>
              ))}
            </div>
            <p className="text-cinema-muted text-sm leading-relaxed mb-8 line-clamp-3">{movie.description}</p>
            <div className="flex flex-wrap gap-3">
              <Link to={`/booking/${movie.id}`} className="btn-accent px-8 py-3 text-base">🎟️ Đặt Vé Ngay</Link>
              <Link to={`/movies/${movie.id}`} className="btn-outline px-8 py-3 text-base flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Chi Tiết
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {featured.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`transition-all duration-300 rounded-full ${i === current ? 'w-8 h-2 bg-primary' : 'w-2 h-2 bg-white/30 hover:bg-white/60'}`} />
        ))}
      </div>
      <button onClick={() => setCurrent((current - 1 + featured.length) % featured.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-cinema-surface/80 border border-cinema-border text-white flex items-center justify-center hover:bg-cinema-card hover:border-primary transition-all duration-200">‹</button>
      <button onClick={() => setCurrent((current + 1) % featured.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-cinema-surface/80 border border-cinema-border text-white flex items-center justify-center hover:bg-cinema-card hover:border-primary transition-all duration-200">›</button>
    </div>
  );
}

// --- Section Header ---
function SectionHeader({ title, subtitle, linkTo, linkText }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="text-cinema-muted text-sm mt-2">{subtitle}</p>}
      </div>
      {linkTo && (
        <Link to={linkTo} className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1 transition-colors">
          {linkText}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );
}

// --- Stats Bar ---
function StatsBar() {
  const stats = [
    { icon: '🎬', value: '200+', label: 'Phim được chiếu' },
    { icon: '🏟️', value: '50+', label: 'Rạp chiếu phim' },
    { icon: '🎟️', value: '1M+', label: 'Vé đã bán' },
    { icon: '⭐', value: '4.8', label: 'Đánh giá trung bình' },
  ];
  return (
    <div className="bg-cinema-surface border-y border-cinema-border">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-cinema-border">
          {stats.map((stat) => (
            <div key={stat.label} className="py-6 px-4 text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="font-heading font-bold text-2xl text-primary">{stat.value}</div>
              <div className="text-cinema-muted text-xs mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Promo Banner ---
function PromoBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent/20 via-cinema-surface to-primary/20 border border-cinema-border p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -top-10 -left-10 w-60 h-60 rounded-full bg-accent blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-60 h-60 rounded-full bg-primary blur-3xl" />
      </div>
      <div className="relative text-center md:text-left">
        <span className="badge bg-accent text-white text-xs mb-3 inline-block">🔥 ƯU ĐÃI ĐẶC BIỆT</span>
        <h3 className="font-heading font-bold text-2xl md:text-3xl text-white mb-2">Giảm 30% cho lần đặt vé đầu tiên</h3>
        <p className="text-cinema-muted">Đăng ký thành viên ngay hôm nay và nhận ngay ưu đãi hấp dẫn!</p>
      </div>
      <div className="relative flex-shrink-0">
        <Link to="/register" className="btn-primary px-8 py-3 text-base shadow-glow-gold">Đăng Ký Ngay</Link>
      </div>
    </div>
  );
}

// --- Main Home Page ---
export default function Home() {
  const [movies, setMovies] = useState(MOVIES); // fallback: mock data
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const { data } = await movieApi.getAll({ page: 0, size: 50 });
        // Spring Data Page trả về { content: [...], totalPages, ... }
        const list = data.content || data.data || data;
        if (Array.isArray(list) && list.length > 0) {
          setMovies(list.map(mapMovieDTO));
        }
      } catch (err) {
        console.warn('⚠️ Không kết nối được backend, dùng mock data:', err.message);
        // Giữ nguyên MOVIES mock
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const nowShowing = movies.filter(m => m.status === 'now_showing');
  const comingSoon = movies.filter(m => m.status === 'coming_soon');

  return (
    <div className="animate-fade-in">
      <HeroBanner movies={movies} />
      <StatsBar />

      <div className="container mx-auto px-4 max-w-7xl py-12 space-y-16">
        {/* Now Showing */}
        <section>
          <SectionHeader title="Đang Chiếu" subtitle="Những bộ phim đang hot nhất hiện tại"
            linkTo="/movies?status=now_showing" linkText="Xem tất cả" />
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {nowShowing.map((movie, i) => <MovieCard key={movie.id} movie={movie} index={i} />)}
            </div>
          )}
        </section>

        <PromoBanner />

        {/* Coming Soon */}
        <section>
          <SectionHeader title="Sắp Chiếu" subtitle="Những bom tấn sắp ra mắt – Đặt vé sớm để không lỡ!"
            linkTo="/movies?status=coming_soon" linkText="Xem tất cả" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {comingSoon.map((movie, i) => <MovieCard key={movie.id} movie={movie} index={i} />)}
          </div>
        </section>

        {/* How it works */}
        <section>
          <SectionHeader title="Đặt Vé Dễ Dàng" subtitle="Chỉ 3 bước đơn giản" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: '🎬', title: 'Chọn Phim', desc: 'Duyệt qua hàng trăm bộ phim đang chiếu và sắp chiếu, chọn phim bạn yêu thích.' },
              { step: '02', icon: '💺', title: 'Chọn Ghế', desc: 'Chọn suất chiếu, rạp và ghế ngồi theo ý muốn trên sơ đồ ghế trực quan.' },
              { step: '03', icon: '🎟️', title: 'Thanh Toán', desc: 'Thanh toán nhanh chóng qua MoMo, ZaloPay, VNPay hoặc thẻ tín dụng.' },
            ].map((item) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} className="card p-6 text-center group hover:border-primary/50">
                <div className="relative inline-block mb-4">
                  <span className="text-5xl">{item.icon}</span>
                  <span className="absolute -top-2 -right-4 font-heading font-bold text-xs text-primary/50">{item.step}</span>
                </div>
                <h4 className="font-heading font-bold text-white text-lg mb-2 group-hover:text-primary transition-colors">{item.title}</h4>
                <p className="text-cinema-muted text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
