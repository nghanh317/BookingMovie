import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { movieService, slotService, cinemaService, provinceService } from '../../services';
import useLocationStore from '../../store/locationStore';

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

export default function Booking() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { selectedProvince, setProvince } = useLocationStore();

  const [movie, setMovie] = useState(null);
  const [slotsData, setSlotsData] = useState([]);
  const [cinemasData, setCinemasData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allProvinces, setAllProvinces] = useState([]);

  const [province, setLocalProvince] = useState(selectedProvince || '');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [movieRes, slotsRes, cinemasRes, provincesRes] = await Promise.all([
          movieService.getById(movieId),
          slotService.getAll({ movieId, size: 1000 }),
          cinemaService.getAll(),
          provinceService.getAll({ size: 100 })
        ]);
        setMovie(movieRes);
        const slotsContent = slotsRes?.data || slotsRes?.content || (Array.isArray(slotsRes) ? slotsRes : []);
        setSlotsData(slotsContent);
        setCinemasData(cinemasRes);
        
        const provincesContent = provincesRes?.data || provincesRes?.content || (Array.isArray(provincesRes) ? provincesRes : []);
        
        setAllProvinces(provincesContent.filter(p => p && (typeof p === 'object' || typeof p === 'string')));

        console.log('[Booking] Movie ID:', movieId);
        console.log('[Booking] Slots Data:', slotsContent);
      } catch (err) {
        console.error("Failed to fetch booking data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [movieId]);

  const showtimes = useMemo(() => {
    if (!Array.isArray(slotsData)) return [];
    return slotsData.map(s => {
      const showTimeStr = s.showTime || '';
      let datePart = showTimeStr.split(' ')[0] || ''; 
      const timePart = showTimeStr.includes(' ') 
        ? showTimeStr.split(' ')[1] 
        : (showTimeStr.includes('T') ? showTimeStr.split('T')[1] : '');
      const time = timePart ? timePart.slice(0, 5) : '';
      
      if (datePart.includes('-')) {
        const parts = datePart.split('-');
        if (parts[0].length === 2) {
          datePart = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }

      const type = s.roomName?.includes('IMAX') ? 'IMAX' : (s.roomName?.includes('3D') ? '3D' : '2D');
      return {
        id: s.id,
        movieId: s.movieId,
        cinemaName: s.cinemaName,
        provinceName: s.provinceName,
        date: datePart,
        time: time,
        hall: s.roomName,
        type: type,
        availableSeats: s.emptySeats || 0,
        price: s.price,
        raw: s
      };
    });
  }, [slotsData]);

  const dates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const defaultDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${dayNum}`;
    });

    const showtimeDates = [...new Set(showtimes.map(s => s.date))].filter(Boolean);
    const allUniqueDates = [...new Set([...defaultDates, ...showtimeDates])].sort();

    return allUniqueDates.map(dateStr => {
      const d = new Date(dateStr);
      const isToday = dateStr === defaultDates[0];
      return {
        value: dateStr,
        day: d.toLocaleDateString('vi-VN', { weekday: 'short' }),
        date: d.getDate(),
        month: d.getMonth() + 1,
        isToday
      };
    });
  }, [showtimes]);

  useEffect(() => {
    if (!selectedDate && dates.length > 0 && province) {
      const firstAvailableDate = dates.find(d => showtimes.some(s => s.date === d.value && s.provinceName === province));
      if (firstAvailableDate) {
        setSelectedDate(firstAvailableDate.value);
      } else {
        setSelectedDate(dates[0].value);
      }
    }
  }, [dates, province, selectedDate, showtimes]);

  const availableProvinces = useMemo(() => {
    const provs = showtimes.map(s => s.provinceName).filter(Boolean);
    return [...new Set(provs)];
  }, [showtimes]);

  // Dates that have showtimes for this movie in the selected province
  const datesWithShowtimes = useMemo(() => {
    let relevant = showtimes;
    if (province) {
      relevant = relevant.filter(s => {
        const sProv = (s.provinceName || '').trim().toLowerCase();
        const selProv = (province || '').trim().toLowerCase();
        return sProv.includes(selProv) || selProv.includes(sProv);
      });
    }
    return [...new Set(relevant.map(s => s.date))];
  }, [showtimes, province]);

  // Showtimes grouped by cinemaName for selected date & province
  const groupedShowtimes = useMemo(() => {
    if (!province || !selectedDate) return {};
    
    const sts = showtimes.filter(s => {
      const sProv = (s.provinceName || '').trim().toLowerCase();
      const selProv = (province || '').trim().toLowerCase();
      const provMatch = sProv.includes(selProv) || selProv.includes(sProv);
      return provMatch && s.date === selectedDate;
    });
    const grouped = {};
    sts.forEach(s => {
      if (!grouped[s.cinemaName]) grouped[s.cinemaName] = [];
      grouped[s.cinemaName].push(s);
    });
    return grouped;
  }, [showtimes, province, selectedDate]);

  const handleProvinceSelect = (p) => {
    setLocalProvince(p);
    setProvince(p);
    setSelectedShowtime(null);
    if (!p) {
      setSelectedDate(null);
    } else if (!selectedDate && dates.length > 0) {
      setSelectedDate(dates[0].value);
    }
  };

  const handleProceed = () => {
    if (!selectedShowtime) return;
    // Find cinema from fetched list
    const cinemaDetails = cinemasData.find(c => c.name === selectedShowtime.cinemaName) || { name: selectedShowtime.cinemaName };
    navigate(`/booking/${movieId}/seats`, {
      state: {
        movie,
        showtime: selectedShowtime,
        cinema: cinemaDetails,
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-cinema-muted">Đang tải thông tin suất chiếu...</p>
        </div>
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
          <img src={movie.poster || movie.image} alt={movie.title || movie.name}
            className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
            onError={e => { e.target.src = `https://placehold.co/100x150/1E1E2C/A0A0B4`; }} />
          <div>
            <h1 className="font-heading font-bold text-white text-xl mb-1">{movie.title || movie.name}</h1>
            <div className="flex flex-wrap gap-3 text-sm text-cinema-muted">
              <span>⭐ {movie.rating || 'N/A'}</span>
              <span>•</span>
              <span>⏱ {movie.duration} phút</span>
              <span>•</span>
              <span>{Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre || 'Phim rạp'}</span>
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
              <div className="flex flex-wrap gap-2">
                <select
                  value={province}
                  onChange={(e) => handleProvinceSelect(e.target.value)}
                  className="input-field py-2.5 text-sm font-medium w-full max-w-xs cursor-pointer bg-cinema-surface"
                >
                  <option value="">Chọn thành phố</option>
                  {allProvinces.map((p, idx) => {
                    const id = p.id || idx;
                    const name = p.provinceName || p;
                    return (
                      <option key={id} value={name}>{name}</option>
                    );
                  })}
                </select>
                {allProvinces.length === 0 && (
                  <p className="text-cinema-muted text-sm mt-2 w-full">Đang tải danh sách thành phố...</p>
                )}
              </div>
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
                  {dates.map(d => {
                    const hasShowtime = datesWithShowtimes.includes(d.value);
                    return (
                      <button key={d.value} onClick={() => { setSelectedDate(d.value); setSelectedShowtime(null); }}
                        className={`relative flex-shrink-0 flex flex-col items-center p-3 rounded-xl border min-w-[62px] transition-all duration-200 ${
                          selectedDate === d.value
                            ? 'border-primary bg-primary text-cinema-black'
                            : hasShowtime
                            ? 'border-primary/40 bg-primary/5 text-primary hover:border-primary hover:bg-primary/10'
                            : 'border-cinema-border bg-cinema-surface text-cinema-muted hover:border-cinema-muted opacity-60'
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

            {/* Step 3: Rạp + Suất chiếu nhóm theo rạp */}
            <section>
              <h2 className="font-heading font-bold text-white text-lg mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-cinema-black flex items-center justify-center text-xs font-bold">3</span>
                Chọn Rạp & Suất Chiếu
              </h2>

              {!province ? (
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
                  {Object.entries(groupedShowtimes).map(([cinemaName, showtimes]) => {
                    const cinema = cinemasData.find(c => c.name === cinemaName) || { name: cinemaName, address: cinemaName, rating: 0 };
                    return (
                      <motion.div key={cinemaName}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-cinema-surface border border-cinema-border rounded-xl p-4 hover:border-cinema-muted transition-colors"
                      >
                        {/* Cinema info */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-white font-semibold">{cinema.name}</h3>
                            <p className="text-cinema-muted text-xs mt-0.5 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                              </svg>
                              {cinema.address}
                            </p>
                          </div>
                          {cinema.rating > 0 && (
                            <span className="flex items-center gap-1 text-primary text-xs font-semibold">
                              ⭐ {cinema.rating}
                            </span>
                          )}
                        </div>
                        {/* Showtimes */}
                        <div className="flex flex-wrap gap-2">
                          {showtimes.map(st => (
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
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
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
                  <span className="text-white font-medium text-right max-w-[150px]">{movie.title || movie.name}</span>
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
