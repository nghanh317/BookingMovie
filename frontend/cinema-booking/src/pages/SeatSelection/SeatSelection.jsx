import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import seatService from '../../services/seatService';
import seatLockService from '../../services/seatLockService';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

// Base URL cho WebSocket
const WEBSOCKET_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace('/api', '/ws');

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
  const [isSocketConnected, setIsSocketConnected] = useState(true);

  const stompClientRef = useRef(null);
  const showtimeId = slotId || showtime?.id;
  const accountId = user?.id || user?.userId;

  const selectedRef = useRef(selected);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

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
    if (!showtimeId) return;

    fetchSeatStatus(true);

    const client = new Client({
      webSocketFactory: () => new SockJS(WEBSOCKET_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        setIsSocketConnected(true);
        // Có mạng lại -> Nạp lại ghế để tránh bị lọt tin nhắn lúc offline
        fetchSeatStatus(false);

        client.subscribe(`/topic/slot/${showtimeId}`, (message) => {
          if (message.body) {
            const data = JSON.parse(message.body);
            setSeats(prevSeats => prevSeats.map(seat => {
              if (seat.seatId === data.seatId) {
                const isMine = String(data.userId) === String(accountId);
                if (data.action === 'LOCKED_SUCCESS') {
                  return { ...seat, status: 'locked', lockedByMe: isMine };
                } else if (data.action === 'UNLOCKED_SUCCESS') {
                  return { ...seat, status: 'available', lockedByMe: false };
                } else if (data.action === 'BOOKED_SUCCESS') {
                  return { ...seat, status: 'booked', lockedByMe: false };
                }
              }
              return seat;
            }));

            // Nếu người khác khoanh trúng lúc mình đang định khoanh
            if (data.action === 'LOCKED_FAILED' && String(data.userId) === String(accountId)) {
              setError(data.message || 'Ghế này vừa bị người khác nhanh tay chọn mất!');
              setTimeout(() => setError(''), 4000);
              setSelected(prev => {
                const next = new Set(prev);
                next.delete(data.seatId);
                return next;
              });
              setSeats(prevSeats => prevSeats.map(seat =>
                seat.seatId === data.seatId ? { ...seat, status: 'locked', lockedByMe: false } : seat
              ));
            }
          }
        });
      },
      onWebSocketClose: () => setIsSocketConnected(false),
      onStompError: () => setIsSocketConnected(false)
    });

    client.activate();
    stompClientRef.current = client;

    // Cleanup khi thoát trang: Chỉ ngắt kết nối socket, KHÔNG gửi UNLOCK vì nếu họ đang chuyển sang màn Snacks thì ta không được huỷ lock của họ
    return () => {
      if (client.connected) {
        client.deactivate();
      }
    };
  }, [showtimeId, accountId, fetchSeatStatus]);

  // ── Khi trang đóng (F5/đóng tab) ──
  useEffect(() => {
    if (!accountId || !showtimeId) return;
    const release = () => {
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

  // Những ghế đang nằm trong Set selected (ghế mới chọn trong giao dịch này)
  const selectedSeatObjects = seats.filter(s => selected.has(s.seatId));

  const totalPrice = selectedSeatObjects.reduce((sum, seat) => {
    const meta = getSeatMeta(seat.seatTypeName);
    if (meta === SEAT_TYPE_META.VIP) return sum + (showtime?.vipPrice || pricePerSeat * 1.3);
    if (meta === SEAT_TYPE_META.COUPLE) return sum + (showtime?.couplePrice || pricePerSeat * 1.8);
    return sum + pricePerSeat;
  }, 0);

  // ── Toggle ghế ──
  const toggleSeat = (seatId) => {
    const seat = seats.find(s => s.seatId === seatId);
    if (!seat) return;

    // Nếu ghế đã book chính thức
    if (seat.status === 'booked') return;

    // Nếu ghế đang bị lock từ DB (đã bấm Tiếp tục / Thanh toán trước đó)
    // Phân biệt với ghế vừa chọn ở local bằng cách kiểm tra selected.has(seatId)
    if (seat.status === 'locked' && !selected.has(seatId)) {
      const label = `${seat.seatRow}${seat.seatNumber}`;
      if (seat.lockedByMe) {
        setError(`Ghế ${label} đang được bạn giữ ở một giao dịch chờ thanh toán. Vui lòng huỷ vé trong mục Vé của tôi để chọn lại.`);
      } else {
        setError(`Ghế ${label} đang được người khác giữ. Vui lòng chọn ghế khác.`);
      }
      setTimeout(() => setError(''), 4000);
      return;
    }

    const isCurrentlySelected = selected.has(seatId) || seat.lockedByMe;

    if (isCurrentlySelected) {
      // Bỏ chọn
      setSelected(prev => {
        const next = new Set(prev);
        next.delete(seatId);
        return next;
      });
      setSeats(prev => prev.map(s => s.seatId === seatId ? { ...s, status: 'available', lockedByMe: false } : s));
    } else {
      // Chọn ghế (Chỉ chọn ở local - Draft Selection)
      setSelected(prev => {
        const next = new Set(prev);
        next.add(seatId);
        return next;
      });
      setSeats(prev => prev.map(s => s.seatId === seatId ? { ...s, status: 'locked', lockedByMe: true } : s));
    }
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
          // Tránh lỗi timezone khi parse LocalDateTime của Spring Boot, ta tự set 10 phút từ client
          lockExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        }
      } catch (err) {
        const msg = err?.response?.data?.message || 'Không thể khóa ghế lúc này. Vui lòng thử lại.';
        setError(msg);
        setLockLoading(false);
        // Có người nhanh tay hơn -> reload lại status ghế ngay lập tức để cập nhật UI
        fetchSeatStatus(false);
        return; // Dừng lại, không sang trang SnackSelection
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

        {/* Network Status Banner */}
        <AnimatePresence>
          {!isSocketConnected && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-2 bg-red-500/20 border border-red-500/40 rounded flex items-center justify-center gap-2 text-red-400 text-sm font-medium sticky top-20 z-50 shadow-lg backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Mất kết nối thời gian thực. Đang thử nối lại...
            </motion.div>
          )}
        </AnimatePresence>

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
                        const isLocked = seat.status === 'locked' && !selected.has(seatId);
                        const isSelected = selected.has(seatId);
                        const label = `${seat.seatRow}${seat.seatNumber}`;

                        let icon, btnClass;
                        if (isBooked) {
                          icon = <span className="text-[18px] leading-none font-bold text-red-500/80">✕</span>;
                          btnClass = 'cursor-not-allowed opacity-30 bg-cinema-border/5 border-cinema-border/10';
                        } else if (isLocked) {
                          icon = <span className="text-[14px] leading-none">🔒</span>;
                          btnClass = seat.lockedByMe
                            ? 'cursor-not-allowed bg-blue-500/15 border-blue-500/40' // Lock của mình thì màu xanh dương
                            : 'cursor-not-allowed bg-orange-500/15 border-orange-500/40';
                        } else if (isSelected) {
                          icon = <span className="text-[14px] leading-none">✅</span>;
                          btnClass = 'bg-green-500/20 border-green-400 shadow-md shadow-green-500/20 scale-110';
                        } else {
                          icon = <span className="text-[13px] leading-none">{meta.icon}</span>;
                          btnClass = `${meta.btnBase} cursor-pointer hover:scale-110 transition-transform`;
                        }

                        let seatPrice = pricePerSeat;
                        if (meta === SEAT_TYPE_META.VIP) seatPrice = showtime?.vipPrice || pricePerSeat * 1.3;
                        if (meta === SEAT_TYPE_META.COUPLE) seatPrice = showtime?.couplePrice || pricePerSeat * 1.8;

                        const tooltip = isBooked
                          ? `${label} - Đã đặt`
                          : isLocked
                            ? (seat.lockedByMe ? `${label} - Bạn đang giữ` : `${label} - Đang được giữ`)
                            : `${label} - ${seat.seatTypeName || 'Thường'} - ${seatPrice > 0 ? seatPrice.toLocaleString('vi-VN') + 'đ' : ''}`;

                        return (
                          <motion.button
                            key={seatId}
                            whileTap={(!isBooked && !isLocked) ? { scale: 0.88 } : {}}
                            onClick={() => toggleSeat(seatId)}
                            disabled={isBooked || isLocked}
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
                <div className="mt-3 pt-3 border-t border-cinema-border text-xs text-cinema-muted space-y-1">
                  <div className="flex justify-between"><span>Thường:</span> <span className="text-primary font-bold">{pricePerSeat.toLocaleString('vi-VN')}đ</span></div>
                  <div className="flex justify-between"><span>VIP:</span> <span className="text-primary font-bold">{(showtime?.vipPrice || pricePerSeat * 1.3).toLocaleString('vi-VN')}đ</span></div>
                  <div className="flex justify-between"><span>Ghế đôi:</span> <span className="text-primary font-bold">{(showtime?.couplePrice || pricePerSeat * 1.8).toLocaleString('vi-VN')}đ</span></div>
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
