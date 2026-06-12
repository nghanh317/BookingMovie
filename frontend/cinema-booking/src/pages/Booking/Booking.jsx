import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useLocationStore from '../../store/locationStore';
import movieService from '../../services/movieService';
import slotService from '../../services/slotService';
import provinceService from '../../services/provinceService';

// Generate 7 days from today
const DATES = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return {
    value: d.toISOString().split('T')[0],
    day: d.toLocaleDateString('vi-VN', { weekday: 'short' }),
    date: d.getDate(),
    month: d.getMonth() + 1,
    isToday: i === 0,
  };
});

const FORMAT_STYLE = {
  '2D':   'border-cinema-border text-cinema-muted hover:border-primary hover:text-primary',
  '3D':   'border-blue-500/40 text-blue-400 hover:border-blue-400',
  'IMAX': 'border-purple-500/40 text-purple-400 hover:border-purple-400',
};
const FORMAT_ACTIVE = {
  '2D':   'border-primary bg-primary/10 text-primary',
  '3D':   'border-blue-400 bg-blue-400/10 text-blue-400',
  'IMAX': 'border-purple-400 bg-purple-400/10 text-purple-400',
};

function StepIndicator({ current }) {
  const steps = ['Chọn tỉnh/thành phố', 'Chọn ngày', 'Chọn rạp & suất chiếu', 'Chọn ghế & bỏng nước', 'Thanh toán'];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            i + 1 === current ? 'bg-primary text-cinema-black'
            : i + 1 < current ? 'text-primary' : 'text-cinema-muted'
          }`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
              i + 1 <= current ? 'bg-primary border-primary text-cinema-black' : 'border-cinema-border'
            }`}>
              {i + 1 < current ? '✓' : i + 1}
            </span>
            {step}
          </div>
          {i < steps.length - 1 && (
            <div className={`w-8 h-0.5 ${i + 1 < current ? 'bg-primary' : 'bg-cinema-border'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// Chuyển showTime string/Date -> { date: 'YYYY-MM-DD', time: 'HH:mm' }
function parseShowTime(showTime) {
  if (!showTime) return { date: '', time: '', rawDate: null };
  // Hỗ trợ format "yyyy-MM-dd HH:mm:ss" hoặc ISO hoặc timestamp
  const str = typeof showTime === 'string'
    ? showTime.replace(' ', 'T')
    : new Date(showTime).toISOString();
  const d = new Date(str);
  if (isNaN(d.getTime())) return { date: '', time: '', rawDate: null };
  const date = d.toISOString().split('T')[0];
  const time = d.toTimeString().substring(0, 5);
  return { date, time, rawDate: d };
}

export default function Booking() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { selectedProvince, setProvince } = useLocationStore();

  const [movie, setMovie] = useState(null);
  const [slots, setSlots] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);

  const [province, setLocalProvince] = useState(selectedProvince || '');
  const [selectedDate, setSelectedDate] = useState(selectedProvince ? DATES[0].value : null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      movieService.getById(movieId),
      slotService.getAll({ movieId, size: 500 }),
      provinceService.getAll(),
    ]).then(([movieData, slotsData, provData]) => {
      setMovie(movieData);
      const rawSlots = Array.isArray(slotsData) ? slotsData : (slotsData?.content || slotsData?.data || []);
      setSlots(rawSlots);
      const provList = Array.isArray(provData) ? provData : (provData?.content || provData?.data || []);
      setProvinces(provList);
    }).catch(err => console.error('[Booking] fetch error:', err))
      .finally(() => setLoading(false));
  }, [movieId]);

  // Normalize slots -> thêm date/time/hall/type và lọc các suất chiếu đã qua
  const normalizedSlots = useMemo(() => {
    const now = new Date();
    return slots.map(s => {
      const { date, time, rawDate } = parseShowTime(s.showTime);
      return {
        ...s,
        date,
        time,
        rawDate,
        hall: s.roomName || '',
        type: '2D',
        availableSeats: s.emptySeats || 0,
        price: Number(s.price) || 0,
      };
    }).filter(s => s.rawDate && s.rawDate > now);
  }, [slots]);

  // Province names từ API provinceService + slots (Hiển thị TẤT CẢ các tỉnh)
  const allProvinces = useMemo(() => {
    const fromApi = provinces.map(p => p.provinceName || p.name).filter(Boolean);
    const fromSlots = normalizedSlots.map(s => s.provinceName).filter(Boolean);
    return [...new Set([...fromApi, ...fromSlots])];
  }, [provinces, normalizedSlots]);

  // Tự động chọn Tỉnh đầu tiên CÓ SUẤT CHIẾU (chỉ chạy 1 lần khi load xong data)
  useEffect(() => {
    if (!loading) {
      const provincesWithShowtimes = [...new Set(normalizedSlots.map(s => s.provinceName).filter(Boolean))];
      // Nếu tỉnh đang chọn không có suất chiếu, nhảy sang tỉnh có suất chiếu (nếu có)
      if (provincesWithShowtimes.length > 0 && !provincesWithShowtimes.includes(province)) {
        setLocalProvince(provincesWithShowtimes[0]);
        setProvince(provincesWithShowtimes[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Lọc slots theo province đã chọn
  const slotsInProvince = useMemo(() => {
    if (!province) return normalizedSlots;
    return normalizedSlots.filter(s => s.provinceName === province);
  }, [normalizedSlots, province]);

  // Dates có suất chiếu
  const datesWithShowtimes = useMemo(() =>
    [...new Set(slotsInProvince.map(s => s.date).filter(Boolean))].sort(),
  [slotsInProvince]);

  // Tự động chọn ngày đầu tiên có suất chiếu nếu ngày đang chọn không có suất
  useEffect(() => {
    if (datesWithShowtimes.length > 0 && !datesWithShowtimes.includes(selectedDate)) {
      setSelectedDate(datesWithShowtimes[0]);
      setSelectedShowtime(null);
    }
  }, [datesWithShowtimes, selectedDate]);

  // Group theo cinemaName cho ngày đã chọn
  const groupedShowtimes = useMemo(() => {
    if (!selectedDate) return {};
    const filtered = slotsInProvince.filter(s => s.date === selectedDate);
    const grouped = {};
    filtered.forEach(s => {
      const key = s.cinemaName || 'Không xác định';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(s);
    });
    return grouped;
  }, [slotsInProvince, selectedDate]);

  const handleProvinceSelect = (p) => {
    setLocalProvince(p);
    setProvince(p);
    setSelectedShowtime(null);
    if (!p) {
      setSelectedDate(null);
    } else if (!selectedDate) {
      setSelectedDate(DATES[0].value);
    }
  };

  const handleProceed = () => {
    if (!selectedShowtime) return;
    navigate(`/booking/${movieId}/seats`, {
      state: {
        movie,
        showtime: selectedShowtime,
        cinema: { name: selectedShowtime.cinemaName, id: null },
        slotId: selectedShowtime.id,
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">Không tìm thấy phim</p>
          <Link to="/movies" className="btn-primary mt-4 inline-block">Quay lại</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <StepIndicator current={!province ? 1 : !selectedDate ? 2 : 3} />

        {/* Movie Summary */}
        <div className="card p-4 flex gap-4 mb-8">
          <img src={movie.poster} alt={movie.title}
            className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
            onError={e => { e.target.src = `https://placehold.co/100x150/1E1E2C/A0A0B4`; }} />
          <div>
            <h1 className="font-heading font-bold text-white text-xl mb-1">{movie.title}</h1>
            <div className="flex flex-wrap gap-3 text-sm text-cinema-muted">
              <span>⭐ {movie.rating || 'N/A'}</span>
              <span>•</span>
              <span>⏱ {movie.duration} phút</span>
              <span>•</span>
              <span>{Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">

            {/* Step 1: Chọn tỉnh */}
            <section>
              <h2 className="font-heading font-bold text-white text-lg mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-cinema-black flex items-center justify-center text-xs font-bold">1</span>
                Chọn Tỉnh / Thành Phố
              </h2>
              <select
                value={province}
                onChange={(e) => handleProvinceSelect(e.target.value)}
                className="input-field py-2.5 text-sm font-medium w-full max-w-xs cursor-pointer bg-cinema-surface"
              >
                <option value="">Chọn thành phố</option>
                {allProvinces.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </section>

            {/* Step 2: Chọn ngày */}
            <section>
              <h2 className="font-heading font-bold text-white text-lg mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-cinema-black flex items-center justify-center text-xs font-bold">2</span>
                Chọn Ngày
              </h2>
              {!province ? (
                <div className="bg-cinema-surface border border-cinema-border rounded-xl p-4 text-center text-cinema-muted text-sm">
                  Vui lòng chọn Tỉnh / Thành Phố để xem ngày chiếu
                </div>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {DATES.map(d => {
                    const hasShowtime = datesWithShowtimes.includes(d.value);
                    return (
                      <button key={d.value} 
                        onClick={() => { setSelectedDate(d.value); setSelectedShowtime(null); }}
                        disabled={!hasShowtime}
                        className={`relative flex-shrink-0 flex flex-col items-center p-3 rounded-xl border min-w-[62px] transition-all duration-200 ${
                          selectedDate === d.value
                            ? 'border-primary bg-primary text-cinema-black'
                            : hasShowtime
                            ? 'border-primary/40 bg-primary/5 text-primary hover:border-primary hover:bg-primary/10'
                            : 'border-cinema-border bg-cinema-surface text-cinema-muted opacity-40 cursor-not-allowed'
                        }`}
                      >
                        {hasShowtime && selectedDate !== d.value && (
                          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                        <span className="text-[11px] font-medium">{d.isToday ? 'Hôm nay' : d.day}</span>
                        <span className="text-lg font-bold font-heading">{d.date}</span>
                        <span className="text-[11px]">T.{d.month}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Step 3: Rạp + Suất chiếu */}
            <section>
              <h2 className="font-heading font-bold text-white text-lg mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-cinema-black flex items-center justify-center text-xs font-bold">3</span>
                Chọn Rạp & Suất Chiếu
              </h2>

              {normalizedSlots.length === 0 ? (
                <div className="bg-cinema-surface border border-cinema-border rounded-xl p-6 text-center text-cinema-muted">
                  <p className="text-4xl mb-3">🎬</p>
                  <p className="font-semibold">Phim hiện chưa có lịch chiếu</p>
                  <p className="text-sm mt-1">Vui lòng quay lại sau khi rạp cập nhật lịch chiếu mới nhé.</p>
                </div>
              ) : !province ? (
                <div className="bg-cinema-surface border border-cinema-border rounded-xl p-6 text-center text-cinema-muted">
                  <p className="text-4xl mb-3">📍</p>
                  <p className="font-semibold">Chưa chọn khu vực</p>
                  <p className="text-sm mt-1">Vui lòng chọn Tỉnh/Thành phố ở bước 1.</p>
                </div>
              ) : !selectedDate ? (
                <div className="bg-cinema-surface border border-cinema-border rounded-xl p-6 text-center text-cinema-muted">
                  <p className="text-4xl mb-3">📅</p>
                  <p className="font-semibold">Chưa chọn ngày</p>
                  <p className="text-sm mt-1">Vui lòng chọn Ngày xem phim ở bước 2.</p>
                </div>
              ) : Object.keys(groupedShowtimes).length === 0 ? (
                <div className="bg-cinema-surface border border-cinema-border rounded-xl p-6 text-center text-cinema-muted">
                  <p className="text-4xl mb-3">🎬</p>
                  <p className="font-semibold">Không có suất chiếu</p>
                  <p className="text-sm mt-1">Thử chọn ngày khác hoặc tỉnh thành khác.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedShowtimes).map(([cinemaName, cinemaSlots]) => (
                    <motion.div key={cinemaName}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-cinema-surface border border-cinema-border rounded-xl p-4 hover:border-cinema-muted transition-colors"
                    >
                      <div className="mb-3">
                        <h3 className="text-white font-semibold">{cinemaName}</h3>
                        <p className="text-cinema-muted text-xs mt-0.5">{cinemaSlots[0]?.provinceName}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {cinemaSlots
                          .sort((a, b) => a.time.localeCompare(b.time))
                          .map(st => (
                            <button key={st.id}
                              onClick={() => setSelectedShowtime(st)}
                              disabled={st.availableSeats === 0}
                              className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                                selectedShowtime?.id === st.id
                                  ? FORMAT_ACTIVE[st.type] || FORMAT_ACTIVE['2D']
                                  : st.availableSeats === 0
                                  ? 'border-cinema-border/30 text-cinema-border cursor-not-allowed opacity-40'
                                  : FORMAT_STYLE[st.type] || FORMAT_STYLE['2D']
                              }`}
                            >
                              <div className="font-bold text-base">{st.time}</div>
                              <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                                <span className="px-1 py-0.5 rounded bg-black/30 font-semibold">{st.type}</span>
                                <span className="opacity-70">{st.hall}</span>
                              </div>
                              <div className="text-[10px] mt-0.5 opacity-60">
                                {st.availableSeats > 0 ? `${st.availableSeats} ghế` : 'Hết chỗ'}
                              </div>
                              {st.price > 0 && (
                                <div className="text-[10px] mt-0.5 text-primary font-semibold">
                                  {new Intl.NumberFormat('vi-VN').format(st.price)}đ
                                </div>
                              )}
                            </button>
                          ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right: Summary */}
          <div>
            <div className="card p-5 sticky top-24">
              <h3 className="font-heading font-bold text-white mb-4">Tóm tắt</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-cinema-muted">Phim</span>
                  <span className="text-white font-medium text-right max-w-[150px]">{movie.title}</span>
                </div>
                {province && (
                  <div className="flex justify-between">
                    <span className="text-cinema-muted">Tỉnh/TP</span>
                    <span className="text-white font-medium">{province}</span>
                  </div>
                )}
                {selectedDate && (
                  <div className="flex justify-between">
                    <span className="text-cinema-muted">Ngày</span>
                    <span className="text-white font-medium">
                      {new Date(selectedDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                )}
                {selectedShowtime && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-cinema-muted">Rạp</span>
                      <span className="text-white font-medium text-right max-w-[150px]">
                        {selectedShowtime.cinemaName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cinema-muted">Suất chiếu</span>
                      <span className="text-primary font-bold">{selectedShowtime.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cinema-muted">Phòng</span>
                      <span className="text-white font-medium">{selectedShowtime.hall} ({selectedShowtime.type})</span>
                    </div>
                    {selectedShowtime.price > 0 && (
                      <div className="flex justify-between">
                        <span className="text-cinema-muted">Giá vé</span>
                        <span className="text-primary font-bold">
                          {new Intl.NumberFormat('vi-VN').format(selectedShowtime.price)}đ
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="border-t border-cinema-border mt-4 pt-4">
                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={handleProceed} disabled={!selectedShowtime}
                  className={`w-full py-3 rounded-xl font-heading font-bold text-sm transition-all duration-200 ${
                    selectedShowtime ? 'btn-primary' : 'bg-cinema-surface text-cinema-muted cursor-not-allowed border border-cinema-border'
                  }`}
                >
                  {selectedShowtime ? '💺 Chọn Ghế →' : 'Vui lòng chọn suất chiếu'}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
