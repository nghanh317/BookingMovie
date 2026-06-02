import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import seatService from '../../services/seatService';
import seatLockService from '../../services/seatLockService';

// ─── Seat type meta ───────────────────────────────────────────────────
const SEAT_TYPE_META = {
  VIP: { icon: '👑', label: 'VIP', color: 'text-yellow-400', btnBase: 'bg-yellow-900/20 border-yellow-600/40 hover:bg-yellow-700/30 hover:border-yellow-400' },
  COUPLE: { icon: '💑', label: 'Ghế đôi', color: 'text-pink-400', btnBase: 'bg-pink-900/20 border-pink-600/40 hover:bg-pink-700/30 hover:border-pink-400' },
  STANDARD: { icon: '💺', label: 'Thường', color: 'text-white', btnBase: 'bg-cinema-surface/80 border-cinema-border hover:bg-primary/10 hover:border-primary/60' },
};

function getSeatMeta(seatTypeName) {
  const n = (seatTypeName || '').toUpperCase();
  if (n.includes('VIP')) return SEAT_TYPE_META.VIP;
  if (n.includes('COUPLE') || n.includes('ĐÔI') || n.includes('DOI')) return SEAT_TYPE_META.COUPLE;
  return SEAT_TYPE_META.STANDARD;
}

// ─── Step Indicator ───────────────────────────────────────────────────
function StepIndicator({ current }) {
  const steps = ['Chọn tỉnh/thành phố', 'Chọn ngày', 'Chọn rạp & suất chiếu', 'Chọn ghế & bỏng nước', 'Thanh toán'];
  return (
    <div className="flex items-center justify-center gap-0 mb-8 flex-wrap gap-y-2">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${i + 1 === current ? 'bg-primary text-cinema-black' :
              i + 1 < current ? 'text-primary' : 'text-cinema-muted'
            }`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${i + 1 <= current ? 'bg-primary border-primary text-cinema-black' : 'border-cinema-border'
              }`}>{i + 1 < current ? '✓' : i + 1}</span>
            {step}
          </div>
          {i < steps.length - 1 && <div className={`w-6 h-0.5 ${i + 1 < current ? 'bg-primary' : 'bg-cinema-border'}`} />}
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────
export default function SeatSelection() {
  const { movieId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { movie, showtime, cinema, slotId } = location.state || {};
  const { user } = useAuthStore();

  // ── State ──
  const [seats, setSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [selected, setSelected] = useState(new Set()); // IDs of seats user wants to pick
  const [lockLoading, setLockLoading] = useState(false);
  const [error, setError] = useState('');

  const pollRef = useRef(null);
  const showtimeId = slotId || showtime?.id;
  const accountId = user?.id || user?.userId;

  // ── Fetch trạng thái toàn bộ ghế từ 1 API ──
  const fetchSeatStatus = useCallback(async (isInitial = false) => {
    if (!showtimeId) return;
    if (isInitial) setLoadingSeats(true);
    
    try {
      const data = await seatService.getSlotStatus(showtimeId, accountId || '');
      // Sắp xếp ghế
      data.sort((a, b) => {
        const r = (a.seatRow || '').localeCompare(b.seatRow || '');
        return r !== 0 ? r : (a.seatNumber || 0) - (b.seatNumber || 0);
      });
      setSeats(data);
    } catch (err) {
      console.error('[SeatSelection] fetch seat status error:', err);
    } finally {
      if (isInitial) setLoadingSeats(false);
    }
  }, [showtimeId, accountId]);

  useEffect(() => {
    fetchSeatStatus(true);
    pollRef.current = setInterval(() => fetchSeatStatus(false), 5000);
    return () => clearInterval(pollRef.current);
  }, [fetchSeatStatus]);

  // ── Khi trang đóng / rời đi: giải phóng lock ──
  useEffect(() => {
    if (!accountId || !showtimeId) return;
    const release = () => {
      // Gửi beacon khi trang đóng (best-effort)
      seatLockService.releaseSeats(accountId, showtimeId).catch(() => { });
    };
    window.addEventListener('beforeunload', release);
    return () => {
      window.removeEventListener('beforeunload', release);
    };
  }, [accountId, showtimeId]);

  // ── Guard: chưa chọn suất chiếu ──
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

  // ── Derived ──
  const seatsByRow = seats.reduce((acc, seat) => {
    const row = seat.seatRow || '?';
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {});
  const rows = Object.keys(seatsByRow).sort();

  const pricePerSeat = showtime?.price || 0;
  
  // Những ghế đang nằm trong Set selected hoặc đã bị account này lock trên db
  const selectedSeatObjects = seats.filter(s => selected.has(s.seatId) || s.lockedByMe);
  
  const totalPrice = selectedSeatObjects.reduce((sum, seat) => {
    const meta = getSeatMeta(seat.seatTypeName);
    if (meta === SEAT_TYPE_META.VIP) return sum + pricePerSeat * 1.3;
    if (meta === SEAT_TYPE_META.COUPLE) return sum + pricePerSeat * 1.8;
    return sum + pricePerSeat;
  }, 0);

  // ── Toggle ghế ──
  const toggleSeat = (seatId) => {
    const seat = seats.find(s => s.seatId === seatId);
    if (!seat) return;
    
    // Nếu ghế đã book chính thức
    if (seat.status === 'booked') return;
    
    // Nếu ghế đang bị lock bởi người khác
    if (seat.status === 'locked' && !seat.lockedByMe) {
      const label = `${seat.seatRow}${seat.seatNumber}`;
      setError(`Ghế ${label} đang được người khác giữ. Vui lòng chọn ghế khác.`);
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    // Nếu ghế do chính mình lock trên server, nhưng mình muốn bỏ tick
    // Chỗ này hơi tricky, cứ allow bỏ chọn local, lúc bấm Tiếp tục server sẽ đè lên
    
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(seatId) || seat.lockedByMe) {
        next.delete(seatId);
        // Nếu nó đang lockedByMe trên server, việc delete này chỉ tác dụng local (sẽ bị reset sau 5s nếu server vẫn trả về lockedByMe).
        // Tốt nhất nếu nó đã lock, user nhấn vào sẽ nhả ghế khỏi DB luôn
        if (seat.lockedByMe) {
          seatLockService.releaseSeats(accountId, showtimeId).catch(()=>{});
        }
      } else {
        next.add(seatId);
      }
      return next;
    });
    setError('');
  };

  // ── "Tiếp tục" — Khoá ghế vào DB (best-effort), luôn navigate sang Snacks ──
  const handleProceed = async () => {
    const idsToLock = selectedSeatObjects.map(s => s.seatId);
    if (idsToLock.length === 0) return;

    setLockLoading(true);
    setError('');

    let lockExpiresAt = null;

    if (accountId && showtimeId) {
      try {
        const result = await seatLockService.lockSeats(accountId, showtimeId, idsToLock);
        if (result?.success) {
          lockExpiresAt = result.expiresAt;
        }
      } catch {
        // Silent
      }
    }

    setLockLoading(false);

    navigate(`/booking/${movieId}/snacks`, {
      state: {
        movie, showtime, cinema,
        seats: selectedSeatObjects.map(s => ({
          id: s.seatId,
          label: `${s.seatRow}${s.seatNumber}`,
          seatRow: s.seatRow,
          seatNumber: s.seatNumber,
          seatTypeName: s.seatTypeName,
        })),
        totalPrice,
        showtimeId,
        slotId,
        lockExpiresAt,
      }
    });
  };

  // Dùng để filter những ghế bị khoá bởi người khác cho UI "Ghế đang được giữ"
  const lockedByOthersList = seats.filter(s => s.status === 'locked' && !s.lockedByMe);

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
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              ⚠️ {error}
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
              </div>
            ) : (
              <div className="inline-block min-w-full">
                {rows.map(row => (
                  <div key={row} className="flex items-center gap-1 mb-1.5 justify-center">
                    <span className="text-cinema-muted text-xs w-5 text-right font-mono flex-shrink-0">{row}</span>
                    <div className="flex gap-1 flex-wrap">
                      {seatsByRow[row].map(seat => {
                        const seatId = seat.seatId;
                        const meta = getSeatMeta(seat.seatTypeName);
                        
                        const isBooked = seat.status === 'booked';
                        const isLockedOther = seat.status === 'locked' && !seat.lockedByMe;
                        const isSelected = selected.has(seatId) || seat.lockedByMe;
                        const label = `${seat.seatRow}${seat.seatNumber}`;

                        let icon, btnClass;
                        if (isBooked) {
                          icon = <span className="text-[18px] leading-none font-bold text-red-500/80">✕</span>;
                          btnClass = 'cursor-not-allowed opacity-30 bg-cinema-border/5 border-cinema-border/10';
                        } else if (isLockedOther) {
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
                          : isLockedOther
                            ? `${label} - Đang được giữ`
                            : `${label} - ${seat.seatTypeName || 'Thường'} - ${pricePerSeat > 0 ? pricePerSeat.toLocaleString('vi-VN') + 'đ' : ''}`;

                        return (
                          <motion.button
                            key={seatId}
                            whileTap={(!isBooked && !isLockedOther) ? { scale: 0.88 } : {}}
                            onClick={() => toggleSeat(seatId)}
                            disabled={isBooked || isLockedOther}
                            title={tooltip}
                            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-150 ${btnClass}`}
                          >{icon}</motion.button>
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
                  { icon: '✕', label: 'Đã đặt' },
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
              {selectedSeatObjects.length > 0 ? (
                <>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {selectedSeatObjects
                      .sort((a, b) => `${a.seatRow}${a.seatNumber}`.localeCompare(`${b.seatRow}${b.seatNumber}`))
                      .map(seat => (
                        <span key={seat.seatId} className="badge bg-primary text-cinema-black font-bold text-xs">
                          {seat.seatRow}{seat.seatNumber}
                        </span>
                      ))}
                  </div>
                  <div className="border-t border-cinema-border pt-3 mb-4 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-cinema-muted">Số ghế:</span>
                      <span className="text-white font-bold">{selectedSeatObjects.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-cinema-muted">Tổng tiền:</span>
                      <span className="text-primary font-bold text-base">
                        {Math.round(totalPrice).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleProceed}
                    disabled={lockLoading}
                    className="w-full btn-primary text-sm py-2.5 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {lockLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-cinema-black border-t-transparent rounded-full animate-spin" />
                        Đang giữ ghế...
                      </>
                    ) : 'Tiếp tục →'}
                  </button>
                </>
              ) : (
                <p className="text-cinema-muted text-sm text-center py-4">Chưa chọn ghế nào</p>
              )}
            </div>

            {/* Ghế bị lock bởi người khác */}
            {lockedByOthersList.length > 0 && (
              <div className="card p-3 mt-3">
                <p className="text-xs text-orange-400 font-medium mb-1.5">🔒 Ghế đang được giữ</p>
                <div className="flex flex-wrap gap-1">
                  {lockedByOthersList.map(seat => (
                    <span key={seat.seatId} className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 border border-orange-500/30 text-orange-400">
                      {seat.seatRow}{seat.seatNumber}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
