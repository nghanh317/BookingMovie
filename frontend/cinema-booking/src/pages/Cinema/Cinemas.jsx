import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PROVINCES } from '../../constants/mockData';
import { movieService, cinemaService } from '../../services';
import useLocationStore from '../../store/locationStore';

const FORMAT_COLORS = {
  IMAX: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  '4DX': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  '3D':  'bg-green-500/20 text-green-400 border-green-500/30',
  '2D':  'bg-cinema-surface text-cinema-muted border-cinema-border',
};

function getMoviesAtCinema(cinema, moviesData) {
  if (!cinema.rooms) return [];
  
  const allSlots = cinema.rooms.flatMap(room => 
    (room.slots || []).map(slot => ({
      ...slot,
      roomName: room.roomName,
      roomType: room.roomType
    }))
  );

  if (allSlots.length === 0) return [];

  // Group by movie
  const movieGroups = allSlots.reduce((acc, slot) => {
    const movieId = slot.moviesId;
    if (!movieId) return acc;
    if (!acc[movieId]) acc[movieId] = [];
    acc[movieId].push(slot);
    return acc;
  }, {});

  return Object.entries(movieGroups).map(([id, slots]) => {
    const movie = moviesData.find(m => m.id === Number(id));
    return {
      movie,
      showtimes: slots.map(s => {
        // Parse showTime (dd-MM-yyyy HH:mm:ss) to HH:mm
        const timeMatch = s.showTime?.match(/\d{2}:\d{2}/);
        return {
          id: s.id,
          time: timeMatch ? timeMatch[0] : '00:00',
          type: s.roomType || '2D',
          price: s.price
        };
      })
    };
  }).filter(x => x.movie);
}

function CinemaCard({ cinema, index, moviesData }) {
  const [expanded, setExpanded] = useState(false);
  const moviesNow = useMemo(() => getMoviesAtCinema(cinema, moviesData), [cinema, moviesData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="bg-cinema-card border border-cinema-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all duration-300 group"
    >
      {/* Cinema Header */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={cinema.image}
          alt={cinema.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = `https://placehold.co/800x300/1A1A24/A0A0B4?text=${encodeURIComponent(cinema.name)}`; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-black via-cinema-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="badge bg-primary/20 border border-primary/40 text-primary text-xs font-semibold">
              🎬 {cinema.screens} phòng chiếu
            </span>
            <span className="badge bg-cinema-black/60 border border-cinema-border text-cinema-muted text-xs">
              {cinema.province}
            </span>
          </div>
          <h2 className="font-heading font-bold text-white text-lg leading-tight">{cinema.name}</h2>
        </div>
        {cinema.rating > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-cinema-black/70 backdrop-blur-sm px-2.5 py-1 rounded-lg">
            <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span className="text-primary font-bold text-sm">{cinema.rating}</span>
          </div>
        )}
      </div>

      {/* Info Row */}
      <div className="p-4 border-b border-cinema-border/50">
        <div className="flex items-start gap-2 text-cinema-muted text-sm">
          <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span className="line-clamp-2">{cinema.address}</span>
        </div>
      </div>

      {/* Now Showing Summary */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white font-semibold text-sm">
            Hôm nay chiếu{' '}
            <span className="text-primary font-bold">{moviesNow.length}</span> phim
          </p>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-primary text-xs font-medium hover:underline flex items-center gap-1"
          >
            {expanded ? 'Thu gọn' : 'Xem lịch chiếu'}
            <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
        </div>

        {/* Quick poster row */}
        {!expanded && moviesNow.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {moviesNow.slice(0, 5).map(({ movie }) => (
              <Link key={movie.id} to={`/movies/${movie.id}`} className="flex-shrink-0 group/poster">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-12 h-[72px] object-cover rounded-lg border border-cinema-border group-hover/poster:border-primary transition-colors"
                  onError={e => { e.target.src = `https://placehold.co/48x72/1E1E2C/A0A0B4?text=${encodeURIComponent(movie.title[0])}`; }}
                />
              </Link>
            ))}
            {moviesNow.length === 0 && (
              <p className="text-cinema-muted text-xs py-2">Chưa có lịch chiếu hôm nay</p>
            )}
          </div>
        )}

        {/* Expanded showtimes */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {moviesNow.length > 0 ? (
                <div className="space-y-3 pt-1">
                  {moviesNow.map(({ movie, showtimes }) => (
                    <div key={movie.id} className="flex gap-3">
                      <Link to={`/movies/${movie.id}`} className="flex-shrink-0">
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="w-12 h-[72px] object-cover rounded-lg border border-cinema-border hover:border-primary transition-colors"
                          onError={e => { e.target.src = `https://placehold.co/48x72/1E1E2C/A0A0B4?text=${encodeURIComponent(movie.title[0])}`; }}
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/movies/${movie.id}`}>
                          <p className="text-white text-sm font-semibold hover:text-primary transition-colors line-clamp-1 mb-1">
                            {movie.title}
                          </p>
                        </Link>
                        <div className="flex flex-wrap gap-1.5">
                          {showtimes.map(s => (
                            <Link
                              key={s.id}
                              to={`/booking/${movie.id}`}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-cinema-border bg-cinema-surface hover:border-primary hover:bg-primary/10 transition-all duration-150 group/st"
                            >
                              <span className="text-white text-xs font-bold group-hover/st:text-primary transition-colors">{s.time}</span>
                              <span className={`text-[9px] px-1 py-0.5 rounded border ${FORMAT_COLORS[s.type] || FORMAT_COLORS['2D']}`}>{s.type}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-cinema-muted text-sm">
                  <p className="text-3xl mb-2">🎬</p>
                  Chưa có lịch chiếu hôm nay
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <div className="flex gap-2 mt-4">
          <Link
            to={`/cinemas/${cinema.id}`}
            className="flex-1 py-2 text-center text-sm font-semibold rounded-xl border border-primary text-primary hover:bg-primary hover:text-cinema-black transition-all duration-200"
          >
            Xem lịch chiếu
          </Link>
          <Link
            to={`/movies`}
            className="px-4 py-2 text-sm font-semibold rounded-xl border border-cinema-border text-cinema-muted hover:border-cinema-muted hover:text-white transition-all duration-200"
          >
            Đặt vé
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function Cinemas() {
  const { selectedProvince, setProvince, clearProvince } = useLocationStore();
  const [localProvince, setLocalProvince] = useState(selectedProvince || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllProvinces, setShowAllProvinces] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [moviesData, setMoviesData] = useState([]);
  const [cinemasData, setCinemasData] = useState([]);
  const provincesContainerRef = useRef(null);

  useEffect(() => {
    movieService.getAll().then(setMoviesData);
    cinemaService.getAll().then(setCinemasData);
  }, []);

  const availableProvinces = useMemo(() => {
    if (!cinemasData.length) return [];
    const cities = [...new Set(cinemasData.map(c => c.province))].filter(Boolean);
    return cities.map(name => ({ id: name, name }));
  }, [cinemasData]);

  useEffect(() => {
    const checkOverflow = () => {
      if (provincesContainerRef.current) {
        setHasOverflow(provincesContainerRef.current.scrollHeight > 50);
      }
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [availableProvinces]);

  const filtered = useMemo(() => {
    let result = cinemasData;
    const province = localProvince || selectedProvince;
    if (province) result = result.filter(c => c.province === province);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q));
    }
    return result;
  }, [cinemasData, localProvince, selectedProvince, searchQuery]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(c => {
      if (!map[c.province]) map[c.province] = [];
      map[c.province].push(c);
    });
    return map;
  }, [filtered]);

  const handleProvinceChange = (p) => {
    setLocalProvince(p);
    if (p) setProvince(p); else clearProvince();
  };

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-cinema-dark via-cinema-surface to-cinema-dark border-b border-cinema-border overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-primary blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4 max-w-7xl py-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="badge bg-primary/20 border border-primary/40 text-primary text-xs font-semibold mb-3 inline-block">
              🎪 Hệ Thống Rạp Phim
            </span>
            <h1 className="font-heading font-extrabold text-4xl md:text-5xl text-white mb-2">
              Bạn đang muốn tìm rạp nào?
            </h1>
            <p className="text-cinema-muted text-lg">
              Có {filtered.length} rạp chiếu phim {(localProvince || selectedProvince) ? `tại thành phố ${localProvince || selectedProvince}` : 'trên toàn quốc'}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row items-start gap-3 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cinema-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm tên rạp, địa chỉ..."
              className="input-field pl-9"
            />
          </div>

          {/* Province filter */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <div 
                ref={provincesContainerRef}
                className={`flex gap-2 flex-wrap ${!showAllProvinces ? 'max-h-[42px] overflow-hidden' : ''} ${!showAllProvinces && hasOverflow ? 'pr-12' : ''}`}
              >
                <button
                  onClick={() => handleProvinceChange('')}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    !localProvince && !selectedProvince
                      ? 'bg-primary border-primary text-cinema-black'
                      : 'border-cinema-border text-cinema-muted hover:border-primary hover:text-primary'
                  }`}
                >
                  Tất cả
                </button>
                {availableProvinces.map(p => (
                  <button
                    key={p}
                    onClick={() => handleProvinceChange(p)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      (localProvince || selectedProvince) === p
                        ? 'bg-primary border-primary text-cinema-black'
                        : 'border-cinema-border text-cinema-muted hover:border-primary hover:text-primary'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              
              {!showAllProvinces && hasOverflow && (
                <button
                  onClick={() => setShowAllProvinces(true)}
                  className="absolute right-0 top-0 h-[42px] px-3 bg-cinema-surface border border-cinema-border rounded-xl text-white font-bold hover:text-primary flex items-center justify-center z-10"
                  style={{ boxShadow: '-10px 0 15px rgba(30, 30, 44, 1)' }}
                  title="Xem thêm"
                >
                  ...
                </button>
              )}
            </div>
            {showAllProvinces && hasOverflow && (
              <div className="mt-2 text-right">
                <button 
                  onClick={() => setShowAllProvinces(false)} 
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Thu gọn
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats row */}
        {(!localProvince && !selectedProvince) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: '🏟️', value: cinemasData.length, label: 'Tổng rạp' },
            { icon: '📍', value: availableProvinces.length, label: 'Tỉnh thành' },
            { icon: '🎬', value: cinemasData.reduce((a, c) => a + c.screens, 0), label: 'Phòng chiếu' },
            { icon: '⭐', value: cinemasData.length ? (cinemasData.reduce((a, c) => a + c.rating, 0) / cinemasData.length).toFixed(1) : 0, label: 'Đánh giá TB' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="bg-cinema-surface border border-cinema-border rounded-xl p-4 text-center"
            >
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-heading font-bold text-xl text-primary">{s.value}</div>
              <div className="text-cinema-muted text-xs mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </div>
        )}

        {/* Cinema list grouped by province */}
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎪</div>
            <h3 className="text-white font-heading font-bold text-xl mb-2">Không tìm thấy rạp</h3>
            <p className="text-cinema-muted">Thử chọn tỉnh thành khác hoặc xóa bộ lọc</p>
          </div>
        ) : (
          Object.entries(grouped).map(([province, cinemas]) => (
            <div key={province} className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <h2 className="font-heading font-bold text-white text-xl">{province}</h2>
                </div>
                <span className="badge bg-primary/10 border border-primary/20 text-primary text-xs">
                  {cinemas.length} rạp
                </span>
                <div className="flex-1 h-px bg-cinema-border" />
              </div>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {cinemas.map((cinema, i) => (
                  <CinemaCard key={cinema.id} cinema={cinema} index={i} moviesData={moviesData} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
