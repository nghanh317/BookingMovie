import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useSeatHoldStore from '../../store/seatHoldStore';
import useAuthStore from '../../store/authStore';
import seatService from '../../services/seatService';

// Màu / icon theo loại ghế
const SEAT_TYPE_META = {
  VIP:      { icon: '👑', label: 'VIP',       color: 'text-yellow-400', btnBase: 'bg-yellow-900/20 border-yellow-600/40 hover:bg-yellow-700/30 hover:border-yellow-400' },
  COUPLE:   { icon: '💑', label: 'Ghế đôi',  color: 'text-pink-400',   btnBase: 'bg-pink-900/20 border-pink-600/40 hover:bg-pink-700/30 hover:border-pink-400' },
  STANDARD: { icon: '💺', label: 'Thường',    color: 'text-white',      btnBase: 'bg-cinema-surface/80 border-cinema-border hover:bg-primary/10 hover:border-primary/60' },
};

function getSeatMeta(seatTypeName) {
  const name = (seatTypeName || '').toUpperCase();
  if (name.includes('VIP')) return SEAT_TYPE_META.VIP;
  if (name.includes('COUPLE') || name.includes('ĐÔI') || name.includes('DOI')) return SEAT_TYPE_META.COUPLE;
  return SEAT_TYPE_META.STANDARD;
}

function StepIndicator({ current }) {
  const steps = ['Chọn tỉnh/thành phố', 'Chọn ngày', 'Chọn rạp & suất chiếu', 'Chọn ghế & bỏng nước', 'Thanh toán'];
  return (
    <div className="flex items-center justify-center gap-0 mb-8 flex-wrap gap-y-2">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
            i + 1 === current ? 'bg-primary text-cinema-black' :
            i + 1 < current ? 'text-primary' : 'text-cinema-muted'
          }`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
              i + 1 <= current ? 'bg-primary border-primary text-cinema-black' : 'border-cinema-border'
            }`}>{i + 1 < current ? '✓' : i + 1}</span>
            {step}
          </div>
          {i < steps.length - 1 && <div className={`w-6 h-0.5 ${i + 1 < current ? 'bg-primary' : 'bg-cinema-border'}`} />}
        </div>
      ))}
    </div>
  );
}

function CountdownTimer({ remainingMs, onExpired }) {
  const [ms, setMs] = useState(remainingMs);
  const intervalRef = useRef(null);

  useEffect(() => {
    setMs(remainingMs);
    if (remainingMs <= 0) { onExpired?.(); return; }
    intervalRef.current = setInterval(() => {
      setMs(prev => {
        const next = prev - 1000;
        if (next <= 0) { clearInterval(intervalRef.current); onExpired?.(); return 0; }
        return next;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [remainingMs]);

  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const isUrgent = ms < 60000;

  return (
    <div className={`rounded-xl border p-3 text-center transition-colors ${isUrgent ? 'bg-red-500/10 border-red-500/30' : 'bg-primary/10 border-primary/30'}`}>
      <p className="text-xs text-cinema-muted mb-1">⏱ Ghế được giữ trong</p>
      <p className={`font-heading font-bold text-2xl tabular-nums ${isUrgent ? 'text-red-400' : 'text-primary'}`}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </p>
      <p className="text-xs text-cinema-muted mt-1">{isUrgent ? '⚠️ Sắp hết thời gian!' : 'Hoàn tất thanh toán trước khi hết hạn'}</p>
    </div>
  );
}

export default function SeatSelection() {
  const { movieId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { movie, showtime, cinema, slotId } = location.state || {};
  const { user } = useAuthStore();
  const { holdSeats, releaseSeats, getHeldSeats, getRemainingTime } = useSeatHoldStore();

  // Seats từ API
  const [seats, setSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(false);

  const [selected, setSelected] = useState(new Set()); // Set<seatId (number)>
  const [holdError, setHoldError] = useState('');
  const [holdExpired, setHoldExpired] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);
  const [heldByOthers, setHeldByOthers] = useState({});
  const pollRef = useRef(null);

  const showtimeId = slotId || showtime?.id;
  const roomId = showtime?.roomId;
  const userId = user?.id || user?.userId || 'guest';

  // Fetch seats của phòng chiếu
  useEffect(() => {
    if (!roomId) return;
    setLoadingSeats(true);
    seatService.getAll({ roomId, size: 500 })
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.content || data?.data || []);
        // Sắp xếp: theo row -> col
        list.sort((a, b) => {
          const rowCmp = (a.seatRow || '').localeCompare(b.seatRow || '');
          if (rowCmp !== 0) return rowCmp;
          return (a.seatNumber || 0) - (b.seatNumber || 0);
        });
        setSeats(list);
      })
      .catch(err => console.error('[SeatSelection] fetch seats error:', err))
      .finally(() => setLoadingSeats(false));
  }, [roomId]);

  // Group seats theo row
  const seatsByRow = seats.reduce((acc, seat) => {
    const row = seat.seatRow || '?';
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {});
  const rows = Object.keys(seatsByRow).sort();

  // Ghế đã đặt (BOOKED) từ backend
  const bookedIds = new Set(
    seats.filter(s => s.status?.toString().toUpperCase() === 'BOOKED').map(s => s.id)
  );

  // Poll held seats từ localStorage
  const refreshHeldSeats = useCallback(() => {
    if (!showtimeId) return;
    const held = getHeldSeats(showtimeId);
    const byOthers = {};
    held.forEach(({ seatId, userId: heldUserId, remainingMs: rem }) => {
      if (String(heldUserId) !== String(userId)) {
        byOthers[seatId] = { remainingMs: rem };
      }
    });
    setHeldByOthers(byOthers);
    const myRemaining = getRemainingTime(showtimeId, userId);
    setRemainingMs(myRemaining);
  }, [showtimeId, userId, getHeldSeats, getRemainingTime]);

  useEffect(() => {
    refreshHeldSeats();
    pollRef.current = setInterval(refreshHeldSeats, 5000);
    return () => clearInterval(pollRef.current);
  }, [refreshHeldSeats]);

  if (!movie || !showtime) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Vui lòng chọn suất chiếu trước</p>
          <Link to={`/booking/${movieId}`} className="btn-primary">Quay lại chọn suất chiếu</Link>
        </div>
      </div>
    );
  }

  const toggleSeat = (seatId) => {
    if (bookedIds.has(seatId)) return;
    if (heldByOthers[seatId]) {
      const seat = seats.find(s => s.id === seatId);
      const label = seat ? `${seat.seatRow}${seat.seatNumber}` : seatId;
      setHoldError(`Ghế ${label} đang được người khác giữ. Vui lòng chọn ghế khác.`);
      setTimeout(() => setHoldError(''), 3000);
      return;
    }

    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(seatId)) {
        next.delete(seatId);
      } else {
        next.add(seatId);
      }

      const newSeats = [...next];
      if (newSeats.length > 0) {
        const result = holdSeats(showtimeId, newSeats, userId);
        if (!result.success) {
          setHoldError(result.message);
          setTimeout(() => setHoldError(''), 4000);
          return prev;
        }
        setTimeout(() => {
          const rem = getRemainingTime(showtimeId, userId);
          setRemainingMs(rem);
        }, 100);
      } else {
        releaseSeats(showtimeId, userId);
        setRemainingMs(0);
        setHoldExpired(false);
      }
      return next;
    });
    setHoldError('');
  };

  const handleHoldExpired = () => {
    setHoldExpired(true);
    setSelected(new Set());
    releaseSeats(showtimeId, userId);
    setRemainingMs(0);
  };

  // Tính tổng tiền từ showtime.price (price per seat từ SlotDTO)
  const pricePerSeat = showtime?.price || 0;

  // Thu thập thông tin ghế đã chọn
  const selectedSeatObjects = seats.filter(s => selected.has(s.id));

  const totalPrice = selectedSeatObjects.reduce((sum, seat) => {
    const meta = getSeatMeta(seat.seatTypeName);
    // VIP +30%, Couple +80%, Standard giá gốc
    if (meta === SEAT_TYPE_META.VIP) return sum + pricePerSeat * 1.3;
    if (meta === SEAT_TYPE_META.COUPLE) return sum + pricePerSeat * 1.8;
    return sum + pricePerSeat;
  }, 0);

  const handleProceed = () => {
    if (selected.size === 0) return;
    navigate(`/booking/${movieId}/snacks`, {
      state: {
        movie, showtime, cinema,
        seats: selectedSeatObjects.map(s => ({
          id: s.id,
          label: `${s.seatRow}${s.seatNumber}`,
          seatRow: s.seatRow,
          seatNumber: s.seatNumber,
          seatTypeName: s.seatTypeName,
        })),
        totalPrice,
        showtimeId,
        slotId,
      }
    });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <StepIndicator current={4} />

        {/* Movie + showtime info */}
        <div className="card p-3 flex gap-3 mb-5 text-sm">
          <img src={movie.poster} alt={movie.title} className="w-10 h-14 object-cover rounded flex-shrink-0"
            onError={e => { e.target.src = 'https://placehold.co/100x150/1E1E2C/A0A0B4'; }} />
          <div className="flex flex-wrap gap-x-4 gap-y-1 items-center">
            <span className="text-white font-semibold">{movie.title}</span>
            <span className="text-cinema-muted">📅 {showtime.date}</span>
            <span className="text-primary font-bold">🕐 {showtime.time}</span>
            <span className="text-cinema-muted">🏛 {showtime.cinemaName || cinema?.name}</span>
            <span className="text-cinema-muted">🎬 {showtime.hall}</span>
          </div>
        </div>

        {/* Errors */}
        <AnimatePresence>
          {holdError && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              ⚠️ {holdError}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {holdExpired && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl text-orange-400 text-sm">
              <p className="font-semibold mb-1">⏰ Thời gian giữ ghế đã hết!</p>
              <p className="text-xs opacity-80">Các ghế bạn chọn đã được giải phóng. Vui lòng chọn lại.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Screen */}
        <div className="mb-6 flex flex-col items-center">
          <div className="w-full max-w-[540px]">
            <div className="h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full mb-0.5 opacity-70" />
            <div className="h-8 bg-gradient-to-b from-primary/25 to-transparent rounded-t-[60%] w-full" />
          </div>
          <p className="text-cinema-muted text-[11px] mt-1.5 tracking-[0.2em] uppercase font-medium">Màn hình</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Seat Map */}
          <div className="flex-1 overflow-x-auto">
            {loadingSeats ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                <span className="text-cinema-muted ml-3">Đang tải sơ đồ ghế...</span>
              </div>
            ) : seats.length === 0 ? (
              <div className="text-center py-16 text-cinema-muted">
                <p className="text-4xl mb-3">💺</p>
                <p className="font-semibold">Phòng này chưa có ghế nào</p>
                <p className="text-sm mt-1">Vui lòng liên hệ admin.</p>
              </div>
            ) : (
              <div className="inline-block min-w-full">
                {rows.map(row => (
                  <div key={row} className="flex items-center gap-1 mb-1.5 justify-center">
                    <span className="text-cinema-muted text-xs w-5 text-right font-mono flex-shrink-0">{row}</span>
                    <div className="flex gap-1 flex-wrap">
                      {seatsByRow[row].map(seat => {
                        const seatId = seat.id;
                        const meta = getSeatMeta(seat.seatTypeName);
                        const isBooked = bookedIds.has(seatId);
                        const isSelected = selected.has(seatId);
                        const isHeldByOther = !!heldByOthers[seatId];
                        const label = `${seat.seatRow}${seat.seatNumber}`;

                        let icon, btnClass;
                        if (isBooked) {
                          icon = <span className="text-[13px] leading-none opacity-50">✕</span>;
                          btnClass = 'cursor-not-allowed opacity-50 bg-cinema-border/20 border-cinema-border/20';
                        } else if (isHeldByOther) {
                          icon = <span className="text-[14px] leading-none">🔒</span>;
                          btnClass = 'cursor-not-allowed bg-orange-500/15 border-orange-500/40';
                        } else if (isSelected) {
                          icon = <span className="text-[14px] leading-none">✅</span>;
                          btnClass = 'bg-green-500/20 border-green-400 shadow-md shadow-green-500/20 scale-110';
                        } else {
                          icon = <span className="text-[13px] leading-none">{meta.icon}</span>;
                          btnClass = `${meta.btnBase} cursor-pointer hover:scale-110 transition-transform`;
                        }

                        const tooltip = isBooked
                          ? `${label} - Đã đặt`
                          : isHeldByOther
                          ? `${label} - Đang được giữ`
                          : `${label} - ${seat.seatTypeName || 'Thường'} - ${pricePerSeat > 0 ? pricePerSeat.toLocaleString('vi-VN') + 'đ' : ''}`;

                        return (
                          <motion.button
                            key={seatId}
                            whileTap={(!isBooked && !isHeldByOther) ? { scale: 0.88 } : {}}
                            onClick={() => toggleSeat(seatId)}
                            disabled={isBooked || isHeldByOther}
                            title={tooltip}
                            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-150 ${btnClass}`}
                          >
                            {icon}
                          </motion.button>
                        );
                      })}
                    </div>
                    <span className="text-cinema-muted text-xs w-5 font-mono flex-shrink-0">{row}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="lg:w-64 flex-shrink-0">
            {/* Legend */}
            <div className="card p-4 mb-4">
              <h3 className="font-heading font-bold text-white text-sm mb-3">Chú thích</h3>
              <div className="space-y-2.5 text-xs">
                {[
                  { icon: '💺', label: 'Ghế thường' },
                  { icon: '👑', label: 'VIP' },
                  { icon: '💑', label: 'Ghế đôi' },
                  { icon: '✅', label: 'Đang chọn' },
                  { icon: '🔒', label: 'Đang được giữ' },
                  { icon: '✕',  label: 'Đã đặt' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-base w-6 text-center">{item.icon}</span>
                    <span className="text-cinema-muted">{item.label}</span>
                  </div>
                ))}
              </div>
              {pricePerSeat > 0 && (
                <div className="mt-3 pt-3 border-t border-cinema-border text-xs text-cinema-muted">
                  <p>Giá vé cơ bản: <span className="text-primary font-bold">{pricePerSeat.toLocaleString('vi-VN')}đ</span></p>
                  <p className="mt-0.5">VIP: x1.3 · Đôi: x1.8</p>
                </div>
              )}
            </div>

            {/* Selected summary */}
            <div className="card p-4">
              <h3 className="font-heading font-bold text-white text-sm mb-3">Ghế đã chọn</h3>
              {selected.size > 0 ? (
                <>
                  {remainingMs > 0 && (
                    <div className="mb-3">
                      <CountdownTimer remainingMs={remainingMs} onExpired={handleHoldExpired} />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {selectedSeatObjects
                      .sort((a, b) => `${a.seatRow}${a.seatNumber}`.localeCompare(`${b.seatRow}${b.seatNumber}`))
                      .map(seat => (
                        <span key={seat.id} className="badge bg-primary text-cinema-black font-bold text-xs">
                          {seat.seatRow}{seat.seatNumber}
                        </span>
                      ))}
                  </div>
                  <div className="border-t border-cinema-border pt-3 mb-4 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-cinema-muted">Số ghế:</span>
                      <span className="text-white font-bold">{selected.size}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-cinema-muted">Tổng tiền:</span>
                      <span className="text-primary font-bold text-base">
                        {Math.round(totalPrice).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                  <button onClick={handleProceed} className="w-full btn-primary text-sm py-2.5">
                    Tiếp tục →
                  </button>
                </>
              ) : (
                <p className="text-cinema-muted text-sm text-center py-4">Chưa chọn ghế nào</p>
              )}
            </div>

            {/* Held by others */}
            {Object.keys(heldByOthers).length > 0 && (
              <div className="card p-3 mt-3">
                <p className="text-xs text-orange-400 font-medium mb-1.5">🔒 Ghế đang được giữ</p>
                <div className="flex flex-wrap gap-1">
                  {Object.keys(heldByOthers).sort().map(sid => {
                    const seat = seats.find(s => s.id === Number(sid));
                    return (
                      <span key={sid} className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 border border-orange-500/30 text-orange-400">
                        {seat ? `${seat.seatRow}${seat.seatNumber}` : sid}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
