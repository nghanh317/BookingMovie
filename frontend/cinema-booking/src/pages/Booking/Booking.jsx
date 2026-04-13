import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MOVIES, CINEMAS, SHOWTIMES } from '../../constants/mockData';
import { movieApi, slotApi, cinemaApi } from '../../api';

const DATES = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return {
    value: d.toISOString().split('T')[0],
    day: d.toLocaleDateString('vi-VN', { weekday: 'short' }),
    date: d.getDate(),
    month: d.getMonth() + 1,
  };
});

const TYPE_STYLE = {
  '2D':   'border-cinema-border text-cinema-muted hover:border-primary hover:text-primary',
  '3D':   'border-blue-500/40 text-blue-400 hover:border-blue-400',
  'IMAX': 'border-purple-500/40 text-purple-400 hover:border-purple-400',
};

const TYPE_ACTIVE = {
  '2D':   'border-primary bg-primary/10 text-primary',
  '3D':   'border-blue-400 bg-blue-400/10 text-blue-400',
  'IMAX': 'border-purple-400 bg-purple-400/10 text-purple-400',
};

function StepIndicator({ current }) {
  const steps = ['Chọn suất chiếu', 'Chọn ghế', 'Thanh toán'];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            i + 1 === current
              ? 'bg-primary text-cinema-black'
              : i + 1 < current
              ? 'text-primary'
              : 'text-cinema-muted'
          }`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
              i + 1 < current ? 'bg-primary border-primary text-cinema-black' :
              i + 1 === current ? 'bg-primary border-primary text-cinema-black' :
              'border-cinema-border'
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

  const [movie, setMovie] = useState(null);
  const [cinemas, setCinemas] = useState(CINEMAS);
  const [showtimes, setShowtimes] = useState(SHOWTIMES);
  const [loading, setLoading] = useState(true);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [selectedDate, setSelectedDate] = useState(DATES[0].value);
  const [selectedShowtime, setSelectedShowtime] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy phim
        const movieRes = await movieApi.getById(Number(movieId));
        const dto = movieRes.data;
        setMovie({
          id: dto.id,
          title: dto.title || 'Không có tên',
          poster: dto.posterUrl || `https://placehold.co/100x150/1E1E2C/A0A0B4`,
          rating: 8.0,
          duration: dto.duration || 0,
          genre: dto.genre ? dto.genre.split(',').map(g => g.trim()) : [],
        });

        // Lấy suất chiếu theo phim
        try {
          const slotRes = await slotApi.getAll({ page: 0, size: 200, movieId: Number(movieId) });
          const slotList = slotRes.data.content || slotRes.data.data || slotRes.data;
          if (Array.isArray(slotList) && slotList.length > 0) {
            const mapped = slotList.map(s => {
              const showDate = s.showTime ? new Date(s.showTime) : new Date();
              return {
                id: s.id,
                movieId: s.movieId,
                cinemaId: s.roomId, // dùng roomId làm key
                cinemaName: s.cinemaName,
                date: showDate.toISOString().split('T')[0],
                time: showDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                hall: s.roomName || 'N/A',
                type: '2D',
                availableSeats: s.emptySeats || 50,
                price: s.price,
              };
            });
            setShowtimes(mapped);
          }
        } catch { /* keep mock showtimes */ }

        // Lấy danh sách rạp
        try {
          const cinemaRes = await cinemaApi.getAll({ page: 0, size: 50 });
          const cinemaList = cinemaRes.data.content || cinemaRes.data.data || cinemaRes.data;
          if (Array.isArray(cinemaList) && cinemaList.length > 0) {
            setCinemas(cinemaList.map(c => ({
              id: c.id,
              name: c.cinemaName || c.name,
              address: c.address || '',
              rating: 4.5,
            })));
          }
        } catch { /* keep mock cinemas */ }
      } catch (err) {
        console.warn('⚠️ Dùng mock data:', err.message);
        const mockMovie = MOVIES.find(m => m.id === Number(movieId));
        setMovie(mockMovie || null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [movieId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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

  const availableShowtimes = showtimes.filter(
    s => s.movieId === movie.id && s.date === selectedDate &&
    (selectedCinema ? s.cinemaId === selectedCinema : true)
  );

  const handleProceed = () => {
    if (!selectedShowtime) return;
    navigate(`/booking/${movieId}/seats`, {
      state: { movie, showtime: selectedShowtime, cinema: cinemas.find(c => c.id === selectedShowtime.cinemaId) || { name: selectedShowtime.cinemaName } }
    });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <StepIndicator current={1} />

        {/* Movie Summary */}
        <div className="card p-4 flex gap-4 mb-8">
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
            onError={e => { e.target.src = `https://placehold.co/100x150/1E1E2C/A0A0B4`; }}
          />
          <div>
            <h1 className="font-heading font-bold text-white text-xl mb-1">{movie.title}</h1>
            <div className="flex flex-wrap gap-3 text-sm text-cinema-muted">
              <span>⭐ {movie.rating}</span>
              <span>•</span>
              <span>⏱ {movie.duration} phút</span>
              <span>•</span>
              <span>{movie.genre.join(', ')}</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: Cinema + Date + Showtime selection */}
          <div className="md:col-span-2 space-y-6">
            {/* Choose Cinema */}
            <section>
              <h2 className="font-heading font-bold text-white text-lg mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-cinema-black flex items-center justify-center text-xs font-bold">1</span>
                Chọn Rạp
              </h2>
              <div className="space-y-2">
                {cinemas.map(cinema => (
                  <button
                    key={cinema.id}
                    onClick={() => { setSelectedCinema(cinema.id); setSelectedShowtime(null); }}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                      selectedCinema === cinema.id
                        ? 'border-primary bg-primary/10'
                        : 'border-cinema-border bg-cinema-surface hover:border-cinema-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-semibold text-sm ${selectedCinema === cinema.id ? 'text-primary' : 'text-white'}`}>
                          {cinema.name}
                        </p>
                        <p className="text-cinema-muted text-xs mt-0.5">{cinema.address}</p>
                      </div>
                      <div className="flex items-center gap-1 text-primary text-xs">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        {cinema.rating}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Choose Date */}
            <section>
              <h2 className="font-heading font-bold text-white text-lg mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-cinema-black flex items-center justify-center text-xs font-bold">2</span>
                Chọn Ngày
              </h2>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {DATES.map(d => (
                  <button
                    key={d.value}
                    onClick={() => { setSelectedDate(d.value); setSelectedShowtime(null); }}
                    className={`flex-shrink-0 flex flex-col items-center p-3 rounded-xl border min-w-[60px] transition-all duration-200 ${
                      selectedDate === d.value
                        ? 'border-primary bg-primary text-cinema-black'
                        : 'border-cinema-border bg-cinema-surface text-cinema-muted hover:border-cinema-muted'
                    }`}
                  >
                    <span className="text-xs font-medium">{d.day}</span>
                    <span className="text-lg font-bold font-heading">{d.date}</span>
                    <span className="text-xs">T.{d.month}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Choose Showtime */}
            <section>
              <h2 className="font-heading font-bold text-white text-lg mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-cinema-black flex items-center justify-center text-xs font-bold">3</span>
                Chọn Suất Chiếu
              </h2>
              {availableShowtimes.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {availableShowtimes.map(st => (
                    <button
                      key={st.id}
                      onClick={() => setSelectedShowtime(st)}
                      disabled={st.availableSeats === 0}
                      className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                        selectedShowtime?.id === st.id
                          ? TYPE_ACTIVE[st.type] || 'border-primary bg-primary/10 text-primary'
                          : st.availableSeats === 0
                          ? 'border-cinema-border/50 text-cinema-border cursor-not-allowed opacity-40'
                          : TYPE_STYLE[st.type] || 'border-cinema-border text-cinema-muted hover:border-primary hover:text-primary'
                      }`}
                    >
                      <div className="font-bold text-base">{st.time}</div>
                      <div className="flex items-center gap-2 text-xs mt-0.5">
                        <span className="px-1.5 py-0.5 rounded bg-cinema-black/40 font-semibold">{st.type}</span>
                        <span>{st.hall}</span>
                      </div>
                      <div className="text-xs mt-1 opacity-70">
                        {st.availableSeats > 0 ? `${st.availableSeats} ghế trống` : 'Hết chỗ'}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-cinema-surface border border-cinema-border rounded-xl p-6 text-center text-cinema-muted">
                  <p>Không có suất chiếu cho ngày và rạp đã chọn.</p>
                  <p className="text-sm mt-1">Thử chọn ngày khác hoặc rạp khác.</p>
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
                {selectedCinema && (
                  <div className="flex justify-between">
                    <span className="text-cinema-muted">Rạp</span>
                    <span className="text-white font-medium text-right max-w-[150px]">
                      {cinemas.find(c => c.id === selectedCinema)?.name}
                    </span>
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
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleProceed}
                  disabled={!selectedShowtime}
                  className={`w-full py-3 rounded-xl font-heading font-bold text-sm transition-all duration-200 ${
                    selectedShowtime
                      ? 'btn-primary'
                      : 'bg-cinema-surface text-cinema-muted cursor-not-allowed border border-cinema-border'
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
