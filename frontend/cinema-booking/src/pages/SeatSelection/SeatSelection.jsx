import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SEAT_ROWS, SEAT_COLS, SEAT_TYPES } from '../../constants/mockData';
import useSeatHoldStore, { HOLD_DURATION_MS } from '../../store/seatHoldStore';
import useAuthStore from '../../store/authStore';

// Pre-defined unavailable seats for demo
const UNAVAILABLE = new Set([
  'A3','A4','A5','B2','B3','C7','C8','D1','D9','D10',
  'E5','E6','F4','F5','G3','G8','H6','H7','H8',
]);

const VIP_ROWS = ['E', 'F', 'G'];
const COUPLE_COLS = [9, 10];
const COUPLE_ROW = 'H';

function getSeatType(row, col) {
  if (row === COUPLE_ROW && COUPLE_COLS.includes(col)) return 'couple';
  if (VIP_ROWS.includes(row)) return 'vip';
  return 'standard';
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
              i + 1 < current ? 'bg-primary border-primary text-cinema-black' :
              i + 1 === current ? 'bg-primary border-primary text-cinema-black' :
              'border-cinema-border'
            }`}>{i + 1 < current ? '✓' : i + 1}</span>
            {step}
          </div>
          {i < steps.length - 1 && <div className={`w-6 h-0.5 ${i + 1 < current ? 'bg-primary' : 'bg-cinema-border'}`} />}
        </div>
      ))}
    </div>
  );
}

/** Hiển thị đồng hồ đếm ngược */
function CountdownTimer({ remainingMs, onExpired }) {
  const [ms, setMs] = useState(remainingMs);
  const intervalRef = useRef(null);

  useEffect(() => {
    setMs(remainingMs);
    if (remainingMs <= 0) { onExpired?.(); return; }
    intervalRef.current = setInterval(() => {
      setMs(prev => {
        const next = prev - 1000;
        if (next <= 0) {
          clearInterval(intervalRef.current);
          onExpired?.();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [remainingMs]);

  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const isUrgent = ms < 60000; // dưới 1 phút

  return (
    <div className={`rounded-xl border p-3 text-center transition-colors ${
      isUrgent
        ? 'bg-red-500/10 border-red-500/30'
        : 'bg-primary/10 border-primary/30'
    }`}>
      <p className="text-xs text-cinema-muted mb-1">⏱ Ghế được giữ trong</p>
      <p className={`font-heading font-bold text-2xl tabular-nums ${isUrgent ? 'text-red-400' : 'text-primary'}`}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </p>
      <p className="text-xs text-cinema-muted mt-1">
        {isUrgent ? '⚠️ Sắp hết thời gian!' : 'Hoàn tất thanh toán trước khi hết hạn'}
      </p>
    </div>
  );
}

export default function SeatSelection() {
  const { movieId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { movie, showtime, cinema } = location.state || {};
  const { user } = useAuthStore();
  const { holdSeats, releaseSeats, getHeldSeats, getRemainingTime, _forceUpdate } = useSeatHoldStore();

  const [selected, setSelected] = useState(new Set());
  const [holdError, setHoldError] = useState('');
  const [holdExpired, setHoldExpired] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);
  const [heldByOthers, setHeldByOthers] = useState({}); // { seatId: { remainingMs } }
  const pollRef = useRef(null);

  const showtimeId = showtime?.id;
  const userId = user?.id || user?.userId || 'guest';

  // Poll held seats từ localStorage mỗi 8s
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
    // Cập nhật thời gian còn lại của chính mình
    const myRemaining = getRemainingTime(showtimeId, userId);
    setRemainingMs(myRemaining);
  }, [showtimeId, userId, getHeldSeats, getRemainingTime]);

  useEffect(() => {
    refreshHeldSeats();
    pollRef.current = setInterval(refreshHeldSeats, 5000);
    return () => {
      clearInterval(pollRef.current);
      // Release khi rời trang (nếu user không tiếp tục)
    };
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

  const toggleSeat = (seatId, type) => {
    if (UNAVAILABLE.has(seatId)) return;
    if (heldByOthers[seatId]) {
      setHoldError(`Ghế ${seatId} đang được người khác giữ. Vui lòng chọn ghế khác.`);
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

      // Gọi holdSeats với danh sách mới
      const newSeats = [...next];
      if (newSeats.length > 0) {
        const result = holdSeats(showtimeId, newSeats, userId);
        if (!result.success) {
          setHoldError(result.message);
          setTimeout(() => setHoldError(''), 4000);
          return prev; // Rollback
        }
        // Cập nhật remaining time
        setTimeout(() => {
          const rem = getRemainingTime(showtimeId, userId);
          setRemainingMs(rem);
        }, 100);
      } else {
        // Không còn ghế nào → release
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

  const totalPrice = [...selected].reduce((sum, seatId) => {
    const row = seatId[0];
    const col = parseInt(seatId.slice(1));
    const type = getSeatType(row, col);
    return sum + SEAT_TYPES[type].price;
  }, 0);

  const handleProceed = () => {
    if (selected.size === 0) return;
    navigate(`/booking/${movieId}/snacks`, {
      state: {
        movie, showtime, cinema,
        seats: [...selected],
        totalPrice,
        showtimeId,
      }
    });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <StepIndicator current={4} />

        {/* Hold error */}
        <AnimatePresence>
          {holdError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2"
            >
              ⚠️ {holdError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hold expired */}
        <AnimatePresence>
          {holdExpired && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl text-orange-400 text-sm"
            >
              <p className="font-semibold mb-1">⏰ Thời gian giữ ghế đã hết!</p>
              <p className="text-xs opacity-80">Các ghế bạn chọn đã được giải phóng. Vui lòng chọn lại và hoàn tất thanh toán trong 5 phút.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Screen label - căn chính giữa toàn bộ sơ đồ ghế */}
        <div className="mb-6 flex flex-col items-center">
          <div className="w-full max-w-[480px]">
            <div className="h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full mb-0.5 opacity-70" />
            <div className="h-8 bg-gradient-to-b from-primary/25 to-transparent rounded-t-[60%] w-full" />
          </div>
          <p className="text-cinema-muted text-[11px] mt-1.5 tracking-[0.2em] uppercase font-medium">Màn hình</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Seat Map */}
          <div className="flex-1 overflow-x-auto">
            <div className="inline-block min-w-full">
              {SEAT_ROWS.map(row => (
                <div key={row} className="flex items-center gap-1 mb-1.5 justify-center">
                  <span className="text-cinema-muted text-xs w-5 text-right font-mono flex-shrink-0">{row}</span>
                  <div className="flex gap-1">
                    {Array.from({ length: SEAT_COLS }, (_, i) => {
                      const col = i + 1;
                      const seatId = `${row}${col}`;
                      const type = getSeatType(row, col);
                      const isUnavailable = UNAVAILABLE.has(seatId);
                      const isSelected = selected.has(seatId);
                      const isHeldByOther = !!heldByOthers[seatId];
                      const otherRemMin = isHeldByOther
                        ? Math.ceil((heldByOthers[seatId].remainingMs || 0) / 60000)
                        : 0;
                      const isCouple = type === 'couple';

                      // — Icon đại diện cho từng trạng thái ghế —
                      let icon;
                      let btnClass;

                      if (isUnavailable) {
                        icon = <span className="text-[13px] leading-none opacity-50">✕</span>;
                        btnClass = 'cursor-not-allowed opacity-50 bg-cinema-border/20 border-cinema-border/20';
                      } else if (isHeldByOther) {
                        icon = <span className="text-[14px] leading-none">🔒</span>;
                        btnClass = 'cursor-not-allowed bg-orange-500/15 border-orange-500/40';
                      } else if (isSelected) {
                        icon = <span className="text-[14px] leading-none">✅</span>;
                        btnClass = 'bg-green-500/20 border-green-400 shadow-md shadow-green-500/20 scale-110';
                      } else if (type === 'vip') {
                        icon = <span className="text-[13px] leading-none">👑</span>;
                        btnClass = 'bg-yellow-900/20 border-yellow-600/40 hover:bg-yellow-700/30 hover:border-yellow-400 cursor-pointer hover:scale-110 transition-transform';
                      } else if (type === 'couple') {
                        icon = <span className="text-[13px] leading-none">💑</span>;
                        btnClass = 'bg-pink-900/20 border-pink-600/40 hover:bg-pink-700/30 hover:border-pink-400 cursor-pointer hover:scale-110 transition-transform';
                      } else {
                        icon = <span className="text-[13px] leading-none">💺</span>;
                        btnClass = 'bg-cinema-surface/80 border-cinema-border hover:bg-primary/10 hover:border-primary/60 cursor-pointer hover:scale-110 transition-transform';
                      }

                      const tooltipText = isHeldByOther
                        ? `${seatId} - Đang được giữ (~${otherRemMin} phút)`
                        : isUnavailable
                        ? `${seatId} - Đã đặt`
                        : `${seatId} - ${SEAT_TYPES[type].label} - ${SEAT_TYPES[type].price.toLocaleString('vi-VN')}đ`;

                      return (
                        <motion.button
                          key={seatId}
                          whileTap={(!isUnavailable && !isHeldByOther) ? { scale: 0.88 } : {}}
                          onClick={() => toggleSeat(seatId, type)}
                          disabled={isUnavailable || isHeldByOther}
                          title={tooltipText}
                          className={`${
                            isCouple ? 'w-10' : 'w-8'
                          } h-8 rounded-lg border flex items-center justify-center transition-all duration-150 ${btnClass}`}
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
          </div>

          {/* Right Panel */}
          <div className="lg:w-64 flex-shrink-0">
            {/* Legend */}
            <div className="card p-4 mb-4">
              <h3 className="font-heading font-bold text-white text-sm mb-3">Chú thích</h3>
              <div className="space-y-2.5 text-xs">
                {[
                  { icon: '💺', label: 'Ghế thường', price: '75.000đ' },
                  { icon: '👑', label: 'VIP', price: '110.000đ' },
                  { icon: '💑', label: 'Ghế đôi', price: '200.000đ' },
                  { icon: '✅', label: 'Đang chọn', price: '' },
                  { icon: '🔒', label: 'Đang được giữ', price: '' },
                  { icon: '✕', label: 'Đã đặt', price: '' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base w-6 text-center">{item.icon}</span>
                      <span className="text-cinema-muted">{item.label}</span>
                    </div>
                    {item.price && <span className="text-cinema-muted">{item.price}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="card p-4">
              <h3 className="font-heading font-bold text-white text-sm mb-3">Ghế đã chọn</h3>
              {selected.size > 0 ? (
                <>
                  {/* Countdown */}
                  {remainingMs > 0 && (
                    <div className="mb-3">
                      <CountdownTimer
                        remainingMs={remainingMs}
                        onExpired={handleHoldExpired}
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1 mb-3">
                    {[...selected].sort().map(seat => (
                      <span key={seat} className="badge bg-primary text-cinema-black font-bold text-xs">{seat}</span>
                    ))}
                  </div>
                  <div className="border-t border-cinema-border pt-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-cinema-muted">Số ghế:</span>
                      <span className="text-white font-bold">{selected.size}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-cinema-muted">Tổng tiền:</span>
                      <span className="text-primary font-bold text-base">
                        {totalPrice.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                  <button onClick={handleProceed} className="w-full btn-primary text-sm py-2.5">
                    Thanh Toán →
                  </button>
                </>
              ) : (
                <p className="text-cinema-muted text-sm text-center py-4">Chưa chọn ghế nào</p>
              )}
            </div>

            {/* Thông tin ghế giữ */}
            {Object.keys(heldByOthers).length > 0 && (
              <div className="card p-3 mt-3">
                <p className="text-xs text-orange-400 font-medium mb-1.5">🔒 Ghế đang được giữ</p>
                <div className="flex flex-wrap gap-1">
                  {Object.keys(heldByOthers).sort().map(s => (
                    <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 border border-orange-500/30 text-orange-400">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-cinema-muted mt-1.5">Các ghế này sẽ tự động giải phóng khi người dùng khác không hoàn tất thanh toán.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
