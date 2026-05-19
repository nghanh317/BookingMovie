import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOVIES, CINEMAS, CINEMA_ROOMS, SHOWTIMES } from '../../constants/mockData';
import DatePickerInput from '../../components/ui/DatePickerInput';

// ── Dữ liệu mock vé theo từng loại ghế cho mỗi suất chiếu
// seatStats: { standard: { total, sold }, vip: { total, sold }, couple: { total, sold } }
function buildSeatStats(room) {
  const total = room?.totalSeats || 100;
  // Phân bổ ghế: ~60% thường, 30% VIP, 10% đôi (theo cặp)
  const stdTotal  = Math.round(total * 0.6);
  const vipTotal  = Math.round(total * 0.3);
  const cplTotal  = Math.floor((total - stdTotal - vipTotal) / 2) * 2; // chẵn cặp
  return {
    standard: { total: stdTotal,  sold: 0 },
    vip:      { total: vipTotal,  sold: 0 },
    couple:   { total: cplTotal,  sold: 0 },
  };
}

// Seed mock "already sold" từ availableSeats
function seedSold(seatStats, room, availableSeats) {
  const totalSeats = room?.totalSeats || 100;
  const totalSold  = totalSeats - availableSeats;
  if (totalSold <= 0) return seatStats;

  // Phân bổ số đã bán tỉ lệ ~ giống phân bổ ghế
  const stdSold = Math.min(Math.round(totalSold * 0.6), seatStats.standard.total);
  const vipSold = Math.min(Math.round(totalSold * 0.3), seatStats.vip.total);
  const cplSold = Math.min(
    Math.floor((totalSold - stdSold - vipSold) / 2) * 2,
    seatStats.couple.total
  );
  return {
    standard: { ...seatStats.standard, sold: stdSold },
    vip:      { ...seatStats.vip,      sold: vipSold },
    couple:   { ...seatStats.couple,   sold: cplSold },
  };
}

const SEAT_META = {
  standard: { label: 'Ghế thường', icon: '🪑', color: 'text-white',        bar: 'bg-blue-500' },
  vip:      { label: 'Ghế VIP',    icon: '⭐', color: 'text-yellow-400',   bar: 'bg-yellow-500' },
  couple:   { label: 'Ghế đôi',    icon: '💑', color: 'text-pink-400',     bar: 'bg-pink-500' },
};

function fmtDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// ── Ticket Card ──────────────────────────────────────────────
function TicketCard({ showtime, room, seatStats }) {
  const movie = MOVIES.find(m => m.id === showtime.movieId);
  const totalAll  = Object.values(seatStats).reduce((s, v) => s + v.total, 0);
  const soldAll   = Object.values(seatStats).reduce((s, v) => s + v.sold,  0);
  const leftAll   = totalAll - soldAll;
  const pctSold   = totalAll > 0 ? (soldAll / totalAll) * 100 : 0;

  return (
    <div className="bg-cinema-dark rounded-xl border border-cinema-border hover:border-primary/40 transition-colors p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="text-white text-sm font-semibold truncate" title={movie?.title}>{movie?.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-primary text-xs font-bold">{showtime.time}</span>
            <span className="text-cinema-muted text-[10px]">({fmtDate(showtime.date)})</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-cinema-surface text-cinema-muted border border-cinema-border">{showtime.type}</span>
          </div>
        </div>
        {/* Tổng quan */}
        <div className="text-right flex-shrink-0">
          <p className={`text-xs font-bold ${leftAll === 0 ? 'text-red-400' : leftAll < 10 ? 'text-orange-400' : 'text-green-400'}`}>
            {leftAll === 0 ? '🔴 Hết vé' : leftAll < 10 ? `⚠️ Còn ${leftAll}` : `✅ Còn ${leftAll}`}
          </p>
          <p className="text-[10px] text-cinema-muted">{soldAll}/{totalAll} đã bán</p>
        </div>
      </div>

      {/* Progress tổng */}
      <div className="h-1.5 bg-cinema-surface rounded-full overflow-hidden mb-3">
        <div className="h-full bg-gradient-gold rounded-full transition-all duration-500"
          style={{ width: `${pctSold}%` }} />
      </div>

      {/* Chi tiết từng loại ghế */}
      <div className="space-y-2">
        {Object.entries(seatStats).map(([type, stat]) => {
          const meta  = SEAT_META[type];
          const left  = stat.total - stat.sold;
          const pct   = stat.total > 0 ? (stat.sold / stat.total) * 100 : 0;
          return (
            <div key={type}>
              <div className="flex items-center justify-between text-[11px] mb-0.5">
                <span className={`flex items-center gap-1 ${meta.color}`}>
                  {meta.icon} {meta.label}
                </span>
                <div className="flex items-center gap-2 text-cinema-muted">
                  <span>Tổng: <b className="text-white">{stat.total}</b></span>
                  <span>Bán: <b className="text-red-400">{stat.sold}</b></span>
                  <span>Còn: <b className={left === 0 ? 'text-red-400' : 'text-green-400'}>{left}</b></span>
                </div>
              </div>
              <div className="h-1 bg-cinema-surface rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${meta.bar}`}
                  style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────
export default function AdminTickets() {
  const [search, setSearch]           = useState('');
  const [dateFilter, setDateFilter]   = useState('');
  const [formatFilter, setFormatFilter] = useState('all');
  const [suggestions, setSuggestions] = useState([]);
  const searchRef = useRef(null);

  // Init seat stats từ SHOWTIMES
  const [seatStatsMap, setSeatStatsMap] = useState(() => {
    const map = {};
    SHOWTIMES.forEach(st => {
      const room  = CINEMA_ROOMS.find(r => r.cinemaId === st.cinemaId && r.name === st.hall);
      const base  = buildSeatStats(room);
      map[st.id]  = seedSold(base, room, st.availableSeats);
    });
    return map;
  });

  // Khi kết nối backend: cập nhật seatStatsMap qua API/WebSocket (không xử lý thủ công)

  // Search suggestions
  const allSuggestions = useMemo(() => {
    const titles  = MOVIES.map(m => m.title);
    const cinemas = CINEMAS.map(c => c.name);
    return [...new Set([...titles, ...cinemas])];
  }, []);

  const handleSearchChange = (val) => {
    setSearch(val);
    if (val.trim().length < 2) { setSuggestions([]); return; }
    setSuggestions(allSuggestions.filter(s => s.toLowerCase().includes(val.toLowerCase())).slice(0, 6));
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handler = e => { if (searchRef.current && !searchRef.current.contains(e.target)) setSuggestions([]); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Group by province -> cinema -> room
  const groupedData = useMemo(() => {
    const tree = {};
    CINEMAS.forEach(cinema => {
      const p = cinema.province;
      if (!tree[p]) tree[p] = {};
      if (!tree[p][cinema.id]) tree[p][cinema.id] = { cinema, rooms: [] };
    });
    CINEMA_ROOMS.forEach(room => {
      const c = CINEMAS.find(c => c.id === room.cinemaId);
      if (c && tree[c.province]?.[c.id]) tree[c.province][c.id].rooms.push(room);
    });
    return tree;
  }, []);

  // Filter showtimes
  const filteredShowtimes = useMemo(() => {
    return SHOWTIMES.filter(st => {
      const movie  = MOVIES.find(m => m.id === st.movieId);
      const cinema = CINEMAS.find(c => c.id === st.cinemaId);
      const matchSearch = !search ||
        (movie?.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (cinema?.name || '').toLowerCase().includes(search.toLowerCase());
      const matchDate   = !dateFilter || st.date === dateFilter;
      const matchFormat = formatFilter === 'all' || st.type === formatFilter;
      return matchSearch && matchDate && matchFormat;
    });
  }, [search, dateFilter, formatFilter]);


  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-white">Quản lý Vé</h2>
          <p className="text-cinema-muted text-sm mt-0.5">Theo dõi tình trạng vé theo từng loại ghế cho mỗi suất chiếu — số liệu cập nhật từ hệ thống đặt vé</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-xs" ref={searchRef}>
          <input
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="🔍 Tìm theo phim hoặc rạp..."
            className="input-field w-full"
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
        <div className="relative max-w-[180px]">
          <DatePickerInput value={dateFilter} onChange={iso => setDateFilter(iso)} placeholder="📅 Lọc theo ngày" className="input-field" />
        </div>
        <div className="flex gap-1 bg-cinema-surface rounded-lg p-1 border border-cinema-border">
          {[{v:'all',l:'Tất cả'},{v:'2D',l:'2D'},{v:'3D',l:'3D'},{v:'IMAX',l:'IMAX'}].map(tab => (
            <button key={tab.v} onClick={() => setFormatFilter(tab.v)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${formatFilter===tab.v?'bg-primary text-cinema-black':'text-cinema-muted hover:text-white'}`}>
              {tab.l}
            </button>
          ))}
        </div>
      </div>

      {/* List grouped */}
      <div className="space-y-8">
        {Object.entries(groupedData).map(([province, cinemasMap]) => (
          <div key={province}>
            <h3 className="font-heading font-bold text-white text-xl mb-4 pl-2 border-l-4 border-primary">{province}</h3>
            <div className="space-y-5">
              {Object.values(cinemasMap).map(({ cinema, rooms }) => {
                const cinemaShowtimes = filteredShowtimes.filter(st => st.cinemaId === cinema.id);
                if ((search || dateFilter || formatFilter !== 'all') && cinemaShowtimes.length === 0) return null;
                return (
                  <div key={cinema.id} className="bg-cinema-surface border border-cinema-border rounded-xl p-4">
                    <h4 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                      🍿 {cinema.name}
                      <span className="text-cinema-muted text-xs font-normal">({cinemaShowtimes.length} suất chiếu)</span>
                    </h4>
                    <div className={rooms.length > 3 ? 'flex gap-4 overflow-x-auto pb-2' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}>
                      {rooms.map(room => {
                        const roomShowtimes = cinemaShowtimes.filter(st => st.hall === room.name);
                        if ((search || dateFilter || formatFilter !== 'all') && roomShowtimes.length === 0) return null;
                        return (
                          <div key={room.id} className={`${rooms.length > 3 ? 'flex-shrink-0 w-72' : ''}`}>
                            <div className="bg-cinema-card rounded-lg border border-cinema-border p-3 mb-2">
                              <h5 className="font-semibold text-white text-sm">
                                Phòng: {room.name}
                                <span className="text-cinema-muted text-xs font-normal ml-1">({room.totalSeats} ghế · {room.format})</span>
                              </h5>
                            </div>
                            {roomShowtimes.length === 0 ? (
                              <p className="text-cinema-muted text-xs italic px-1">Chưa có suất chiếu</p>
                            ) : (
                              <div className="space-y-3">
                                {roomShowtimes
                                  .sort((a, b) => new Date(a.date+'T'+a.time) - new Date(b.date+'T'+b.time))
                                  .map(st => (
                                    <TicketCard
                                      key={st.id}
                                      showtime={st}
                                      room={room}
                                      seatStats={seatStatsMap[st.id] || buildSeatStats(room)}
                                    />
                                  ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
