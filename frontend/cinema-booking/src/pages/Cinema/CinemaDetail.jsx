import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CINEMA_DETAILS } from '../../constants/mockData';
import cinemaService from '../../services/cinemaService';
import movieService from '../../services/movieService';
import slotService from '../../services/slotService';
import useAuthStore from '../../store/authStore';

const TYPE_COLORS = {
  IMAX: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  '4DX': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  '3D': 'bg-green-500/20 text-green-400 border-green-500/30',
  '2D': 'bg-cinema-surface text-cinema-muted border-cinema-border',
};

function CinemaStarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const half = !filled && rating >= star - 0.5;
        return (
          <svg key={star} className={`w-4 h-4 ${filled || half ? 'text-primary' : 'text-cinema-border'}`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
      })}
      <span className="text-white font-semibold ml-1">{rating}</span>
      <span className="text-cinema-muted text-xs">/5</span>
    </div>
  );
}

/** Lấy N ngày kế tiếp từ hôm nay */
function getNextDays(n = 7) {
  const days = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      value: d.toISOString().split('T')[0],
      label: i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : d.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' }),
    });
  }
  return days;
}

function formatCurrency(n) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

// ─── Interactive Star Picker ─────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const labels = ['', 'Tệ', 'Khá', 'Tốt', 'Rất tốt', 'Xuất sắc'];
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-125 focus:outline-none"
          >
            <svg
              className={`w-9 h-9 transition-colors duration-150 ${
                (hovered || value) >= star ? 'text-primary drop-shadow-[0_0_6px_rgba(255,195,0,0.6)]' : 'text-cinema-border'
              }`}
              fill="currentColor" viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </button>
        ))}
      </div>
      {(hovered || value) > 0 && (
        <span className="text-primary text-sm font-semibold animate-fade-in">
          {labels[hovered || value]}
        </span>
      )}
    </div>
  );
}

// ─── Rating Section Component ────────────────────────────────────
function CinemaRatingSection({ cinemaId, cinemaName }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('../../services/api').then(({ default: api }) => {
      api.get('/v1/cinema-reviews', { params: { size: 1000 } })
        .then(res => {
          let cReviewsData = [];
          if (Array.isArray(res.data)) cReviewsData = res.data;
          else if (Array.isArray(res.data?.data)) cReviewsData = res.data.data;
          else if (Array.isArray(res.data?.content)) cReviewsData = res.data.content;
          else if (Array.isArray(res.data?.data?.content)) cReviewsData = res.data.data.content;
          
          const filtered = cReviewsData.filter(r => r.cinemaId === cinemaId);
          const mapped = filtered.map(r => ({
            id: r.id,
            author: r.accountFullName || 'Khán giả',
            rating: r.rating || 5,
            comment: r.comment,
            date: r.createDate ? new Date(r.createDate).toLocaleDateString('vi-VN') : 'Mới đây'
          })).reverse();
          
          setReviews(mapped);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    });
  }, [cinemaId]);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.35 }}
      className="bg-cinema-card border border-cinema-border rounded-2xl p-5"
    >
      {/* Header + avg */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-heading font-bold flex items-center gap-2">
          <span className="text-primary">⭐</span> Đánh Giá Rạp
        </h3>
        <div className="text-right">
          <p className="text-primary font-extrabold text-xl leading-none">{avgRating}</p>
          <p className="text-cinema-muted text-[10px]">/ 5 · {reviews.length} đg</p>
        </div>
      </div>

      {/* Review list */}
      {loading ? (
        <div className="text-center py-5 text-cinema-muted text-xs">Đang tải đánh giá...</div>
      ) : reviews.length > 0 ? (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
          {reviews.map(r => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-cinema-surface rounded-xl p-3"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-white text-xs font-semibold">{r.author}</span>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} className={`w-3 h-3 ${r.rating >= s ? 'text-primary' : 'text-cinema-border'}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
              </div>
              {r.comment && <p className="text-cinema-muted text-xs leading-relaxed">{r.comment}</p>}
              <p className="text-cinema-muted/50 text-[10px] mt-1">{r.date}</p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5 text-cinema-muted text-xs bg-cinema-surface rounded-xl">
          Chưa có đánh giá nào cho rạp này.
        </div>
      )}
    </motion.div>
  );
}

export default function CinemaDetail() {
  const { id } = useParams();
  const cinemaId = Number(id);

  const [cinema, setCinema] = useState(null);
  const [allMovies, setAllMovies] = useState([]);
  const [allShowtimes, setAllShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getNextDays(1)[0].value);

  const days = getNextDays(7);
  const details = CINEMA_DETAILS[cinemaId] || {};

  useEffect(() => {
    setLoading(true);
    Promise.all([
      cinemaService.getById(cinemaId),
      movieService.getAll({ size: 100 }),
      slotService.getAll({ size: 1000 })
    ]).then(([cinemaData, movieRes, slotRes]) => {
      setCinema(cinemaData);
      
      const mList = Array.isArray(movieRes) ? movieRes : (movieRes?.content || movieRes?.data || []);
      setAllMovies(mList);

      const sList = Array.isArray(slotRes) ? slotRes : (slotRes?.content || slotRes?.data || []);
      setAllShowtimes(sList);
    }).catch(err => {
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  }, [cinemaId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cinema-muted">Đang tải thông tin rạp...</p>
        </div>
      </div>
    );
  }

  if (!cinema) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎪</div>
          <h2 className="text-white text-2xl font-heading font-bold mb-2">Không tìm thấy rạp</h2>
          <Link to="/" className="btn-primary mt-4 inline-block">Về Trang Chủ</Link>
        </div>
      </div>
    );
  }

  const heroImage = details.image || cinema.image;

  const parseShowTime = (stStr) => {
    if (!stStr) return '';
    const isIsoFormat = /^\d{4}-\d{2}-\d{2}/.test(stStr);
    const isVnFormat = /^\d{2}-\d{2}-\d{4}/.test(stStr);
    if (isIsoFormat) return stStr.substring(0, 10);
    if (isVnFormat) return stStr.substring(6,10) + '-' + stStr.substring(3,5) + '-' + stStr.substring(0,2);
    return stStr.substring(0, 10);
  }

  const getTimeOnly = (stStr) => {
    if (!stStr) return '';
    return stStr.substring(11, 16);
  }

  // Lịch chiếu theo ngày + rạp
  const showtimesOfDay = allShowtimes.filter((s) => {
    if (s.cinemaName !== cinema?.name) return false;
    const stDate = parseShowTime(s.showTime);
    return stDate === selectedDate;
  });

  // Group theo movieId
  const groupedByMovie = showtimesOfDay.reduce((acc, s) => {
    if (!acc[s.movieId]) acc[s.movieId] = [];
    acc[s.movieId].push(s);
    return acc;
  }, {});

  const moviesShowing = Object.entries(groupedByMovie).map(([movieId, showtimes]) => ({
    movie: allMovies.find((m) => m.id === Number(movieId)),
    showtimes: showtimes.sort((a,b) => getTimeOnly(a.showTime).localeCompare(getTimeOnly(b.showTime))),
  })).filter((item) => item.movie);

  return (
    <div className="min-h-screen animate-fade-in">
      {/* ── Hero Banner ─────────────────────────────────────── */}
      <div className="relative h-[55vh] min-h-[380px] overflow-hidden">
        <img
          src={heroImage}
          alt={cinema.name}
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            e.target.src = `https://placehold.co/1600x900/1A1A24/A0A0B4?text=${encodeURIComponent(cinema.name)}`;
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-black via-cinema-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-black/60 to-transparent" />

        {/* Content trên hero */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto max-w-7xl">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="badge bg-primary/20 border border-primary/40 text-primary text-xs font-semibold">
                  🎬 Rạp Chiếu Phim
                </span>
                <span className="badge bg-cinema-surface border border-cinema-border text-cinema-muted text-xs">
                  {cinema.city}
                </span>
              </div>
              <h1 className="font-heading font-extrabold text-4xl md:text-5xl text-white mb-2 drop-shadow-lg">
                {cinema.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-cinema-muted text-sm">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {cinema.address}
                </span>
                {cinema.rating > 0 && (
                  <div className="flex items-center gap-1.5 border-l border-cinema-border pl-4">
                    <CinemaStarRating rating={cinema.rating} />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────── */}
      <div className="container mx-auto px-4 max-w-7xl py-10">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">

          {/* Left: Lịch chiếu */}
          <div>
            {/* Date picker */}
            <div className="mb-8">
              <h2 className="section-title mb-4">📅 Lịch Chiếu Phim</h2>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                {days.map((day) => (
                  <button
                    key={day.value}
                    onClick={() => setSelectedDate(day.value)}
                    className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                      selectedDate === day.value
                        ? 'bg-primary border-primary text-cinema-black'
                        : 'bg-cinema-surface border-cinema-border text-cinema-muted hover:border-primary hover:text-primary'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Showtimes grouped by movie */}
            {moviesShowing.length > 0 ? (
              <div className="space-y-6">
                {moviesShowing.map(({ movie, showtimes }, i) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-cinema-card border border-cinema-border rounded-2xl p-5 hover:border-primary/30 transition-colors duration-200"
                  >
                    <div className="flex gap-4">
                      {/* Poster nhỏ */}
                      <Link to={`/movies/${movie.id}`} className="flex-shrink-0">
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="w-16 h-24 object-cover rounded-xl border border-cinema-border hover:opacity-80 transition-opacity"
                          onError={(e) => {
                            e.target.src = `https://placehold.co/64x96/1E1E2C/A0A0B4?text=${encodeURIComponent(movie.title[0])}`;
                          }}
                        />
                      </Link>

                      {/* Movie info + showtimes */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div>
                            <Link to={`/movies/${movie.id}`}>
                              <h3 className="text-white font-heading font-bold text-base hover:text-primary transition-colors line-clamp-1">
                                {movie.title}
                              </h3>
                            </Link>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {movie.genre.slice(0, 3).map((g) => (
                                <span key={g} className="badge bg-cinema-surface border border-cinema-border text-cinema-muted text-[10px]">{g}</span>
                              ))}
                              <span className="badge bg-cinema-surface border border-cinema-border text-cinema-muted text-[10px]">
                                {movie.duration} phút
                              </span>
                            </div>
                          </div>
                          <span className={`badge text-xs font-semibold flex-shrink-0 ${
                            movie.status === 'now_showing' ? 'bg-accent text-white' : 'bg-cinema-surface border border-cinema-border text-cinema-muted'
                          }`}>
                            {movie.status === 'now_showing' ? '● Đang chiếu' : '⏳ Sắp chiếu'}
                          </span>
                        </div>

                        {/* Showtime buttons */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {showtimes.map((s) => (
                            <Link
                              key={s.id}
                              to={`/booking/${movie.id}/seats`}
                              state={{
                                movie: movie,
                                showtime: {
                                  ...s,
                                  date: parseShowTime(s.showTime),
                                  time: getTimeOnly(s.showTime),
                                  cinemaName: cinema.name,
                                  hall: s.roomName,
                                  price: s.price,
                                  vipPrice: s.vipPrice,
                                  couplePrice: s.couplePrice
                                },
                                cinema: { name: cinema.name, id: cinema.id },
                                slotId: s.id,
                              }}
                              className="group flex flex-col items-center px-3 py-2 rounded-xl border border-cinema-border bg-cinema-surface hover:border-primary hover:bg-primary/10 transition-all duration-200 min-w-[70px]"
                            >
                              <span className="text-white font-bold text-sm group-hover:text-primary transition-colors">
                                {getTimeOnly(s.showTime)}
                              </span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md border mt-1 ${TYPE_COLORS['2D']}`}>
                                {s.roomName}
                              </span>
                              <span className="text-cinema-muted text-[10px] mt-1">
                                {s.availableSeats} ghế
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-cinema-card border border-cinema-border rounded-2xl">
                <div className="text-5xl mb-4">🎬</div>
                <h3 className="text-white font-heading font-bold text-xl mb-2">Không có suất chiếu</h3>
                <p className="text-cinema-muted text-sm">Ngày này chưa có lịch chiếu tại rạp. Vui lòng chọn ngày khác.</p>
              </div>
            )}
          </div>

          {/* Right: Thông tin rạp */}
          <div className="space-y-5">
            {/* Info card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-cinema-card border border-cinema-border rounded-2xl p-5"
            >
              <h3 className="text-white font-heading font-bold mb-4 flex items-center gap-2">
                <span className="text-primary">ℹ️</span> Thông Tin Rạp
              </h3>

              {details.description && (
                <p className="text-cinema-muted text-sm leading-relaxed mb-4">{details.description}</p>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-cinema-muted text-xs mb-0.5">Địa chỉ</p>
                    <p className="text-white">{cinema.address}</p>
                  </div>
                </div>

                {details.phone && (
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <p className="text-cinema-muted text-xs mb-0.5">Điện thoại</p>
                      <p className="text-white">{details.phone}</p>
                    </div>
                  </div>
                )}

                {details.openHours && (
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeWidth={2}/>
                      <path strokeLinecap="round" strokeWidth={2} d="M12 6v6l4 2"/>
                    </svg>
                    <div>
                      <p className="text-cinema-muted text-xs mb-0.5">Giờ mở cửa</p>
                      <p className="text-white">{details.openHours}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                  <div>
                    <p className="text-cinema-muted text-xs mb-0.5">Số phòng chiếu</p>
                    <p className="text-white">{(cinema.rooms || []).length || cinema.screens || 0} phòng</p>
                  </div>
                </div>

                {cinema.rating > 0 && (
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <div>
                      <p className="text-cinema-muted text-xs mb-0.5">Đánh giá</p>
                      <p className="text-white font-semibold">{cinema.rating}/5</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Tiện ích */}
            {details.amenities && details.amenities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-cinema-card border border-cinema-border rounded-2xl p-5"
              >
                <h3 className="text-white font-heading font-bold mb-4 flex items-center gap-2">
                  <span className="text-primary">✨</span> Tiện Ích & Công Nghệ
                </h3>
                <div className="flex flex-wrap gap-2">
                  {details.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Cinema Rating Section */}
            <CinemaRatingSection cinemaId={cinemaId} cinemaName={cinema.name} />

            {/* Quick stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 rounded-2xl p-5"
            >
              <h3 className="text-white font-heading font-bold mb-4">📊 Hôm Nay Tại Rạp</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-cinema-black/30 rounded-xl p-3 text-center">
                  <p className="text-primary text-2xl font-extrabold">{moviesShowing.length}</p>
                  <p className="text-cinema-muted text-xs mt-1">Phim đang chiếu</p>
                </div>
                <div className="bg-cinema-black/30 rounded-xl p-3 text-center">
                  <p className="text-primary text-2xl font-extrabold">{showtimesOfDay.length}</p>
                  <p className="text-cinema-muted text-xs mt-1">Suất chiếu</p>
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <Link to="/movies" className="flex items-center justify-center gap-2 w-full btn-primary py-3">
              🎬 Xem Tất Cả Phim
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
