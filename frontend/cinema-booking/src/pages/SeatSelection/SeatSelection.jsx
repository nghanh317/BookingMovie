import { useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEAT_ROWS, SEAT_COLS, SEAT_TYPES } from '../../constants/mockData';

// Pre-defined unavailable seats for demo
const UNAVAILABLE = new Set([
  'A3','A4','A5','B2','B3','C7','C8','D1','D9','D10',
  'E5','E6','F4','F5','G3','G8','H6','H7','H8',
]);

// VIP rows
const VIP_ROWS = ['E', 'F', 'G'];
// Couple seats (last 2 columns of last row)
const COUPLE_COLS = [9, 10];
const COUPLE_ROW = 'H';

function getSeatType(row, col) {
  if (row === COUPLE_ROW && COUPLE_COLS.includes(col)) return 'couple';
  if (VIP_ROWS.includes(row)) return 'vip';
  return 'standard';
}

function StepIndicator({ current }) {
  const steps = ['Chọn suất chiếu', 'Chọn ghế', 'Bỏng & Nước', 'Thanh toán'];
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

export default function SeatSelection() {
  const { movieId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { movie, showtime, cinema } = location.state || {};

  const [selected, setSelected] = useState(new Set());

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
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(seatId)) next.delete(seatId);
      else next.add(seatId);
      return next;
    });
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
      }
    });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <StepIndicator current={2} />

        {/* Screen label */}
        <div className="mb-8 text-center">
          <div className="relative inline-block w-full max-w-lg">
            <div className="h-2 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full mb-1 opacity-60" />
            <div className="h-6 bg-gradient-to-b from-primary/20 to-transparent rounded-t-[50%] w-full" />
            <p className="text-cinema-muted text-xs mt-1 tracking-widest uppercase">Màn hình</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Seat Map */}
          <div className="flex-1 overflow-x-auto">
            <div className="inline-block min-w-full">
              {SEAT_ROWS.map(row => (
                <div key={row} className="flex items-center gap-1.5 mb-1.5 justify-center">
                  <span className="text-cinema-muted text-xs w-5 text-right font-mono">{row}</span>
                  <div className="flex gap-1.5">
                    {Array.from({ length: SEAT_COLS }, (_, i) => {
                      const col = i + 1;
                      const seatId = `${row}${col}`;
                      const type = getSeatType(row, col);
                      const isUnavailable = UNAVAILABLE.has(seatId);
                      const isSelected = selected.has(seatId);

                      let seatClass = '';
                      if (isUnavailable) {
                        seatClass = 'bg-cinema-border/40 border-cinema-border/20 cursor-not-allowed opacity-40';
                      } else if (isSelected) {
                        seatClass = 'bg-green-500 border-green-400 shadow-lg shadow-green-500/30 scale-110';
                      } else if (type === 'vip') {
                        seatClass = 'bg-yellow-900/30 border-yellow-700/50 hover:bg-yellow-700/40 hover:border-yellow-500 cursor-pointer';
                      } else if (type === 'couple') {
                        seatClass = 'bg-red-900/30 border-red-700/50 hover:bg-red-700/40 hover:border-red-500 cursor-pointer';
                      } else {
                        seatClass = 'bg-cinema-surface border-cinema-border hover:bg-cinema-card hover:border-primary cursor-pointer';
                      }

                      // Wide seat for couple
                      const isCouple = type === 'couple';

                      return (
                        <motion.button
                          key={seatId}
                          whileTap={!isUnavailable ? { scale: 0.9 } : {}}
                          onClick={() => toggleSeat(seatId, type)}
                          disabled={isUnavailable}
                          title={`${seatId} - ${SEAT_TYPES[type].label} - ${SEAT_TYPES[type].price.toLocaleString('vi-VN')}đ`}
                          className={`${isCouple ? 'w-9' : 'w-7'} h-7 rounded-t-lg border text-[10px] font-mono transition-all duration-150 flex items-center justify-center ${seatClass}`}
                        >
                          {isUnavailable ? '✕' : isSelected ? '✓' : col}
                        </motion.button>
                      );
                    })}
                  </div>
                  <span className="text-cinema-muted text-xs w-5 font-mono">{row}</span>
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
                  { color: 'bg-cinema-surface border border-cinema-border', label: 'Thường', price: '75.000đ' },
                  { color: 'bg-yellow-900/30 border border-yellow-700/50', label: 'VIP', price: '110.000đ' },
                  { color: 'bg-red-900/30 border border-red-700/50', label: 'Ghế đôi', price: '200.000đ' },
                  { color: 'bg-green-500 border border-green-400', label: 'Đang chọn', price: '' },
                  { color: 'bg-cinema-border/40 border border-cinema-border/20 opacity-40', label: 'Đã đặt', price: '' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-5 rounded-t-md ${item.color}`} />
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
          </div>
        </div>
      </div>
    </div>
  );
}
