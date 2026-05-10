import { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { roomService } from '../../services';

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

export default function SeatSelection() {
  const { movieId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { movie, showtime, cinema } = location.state || {};

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Robustly extract roomId from showtime.raw
    const rId = showtime?.raw?.roomId || showtime?.raw?.room_id || showtime?.roomId;
    
    if (!showtime || !rId) {
      setLoading(false);
      return;
    }
    const fetchRoom = async () => {
      try {
        const res = await roomService.getById(rId);
        // Robustly handle response structure
        const data = res?.data || res;
        console.log('[SeatSelection] Fetched Room Data:', data);
        setRoomData(data);
      } catch (err) {
        console.error("Failed to fetch room seats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [showtime]);

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

  // Group seats by row
  const seatsByRow = useMemo(() => {
    if (!roomData || !roomData.seats) return {};
    const grouped = {};
    roomData.seats.forEach(seat => {
      const row = seat.seatRow || seat.seatsRow || 'A';
      if (!grouped[row]) grouped[row] = [];
      grouped[row].push(seat);
    });
    // Sort seats by seatNumber in each row
    Object.keys(grouped).forEach(row => {
      grouped[row].sort((a, b) => {
        const numA = a.seatNumber || a.seatsNumber || 0;
        const numB = b.seatNumber || b.seatsNumber || 0;
        return numA - numB;
      });
    });
    return grouped;
  }, [roomData]);

  const toggleSeat = (seat) => {
    // Backend status is often 'active' for available, 'booked' for taken
    const status = (seat.status || '').toLowerCase();
    if (status !== 'available' && status !== 'active') return; 
    
    setSelectedSeats(prev => {
      const isSelected = prev.find(s => s.id === seat.id);
      if (isSelected) return prev.filter(s => s.id !== seat.id);
      return [...prev, seat];
    });
  };

  // Determine pricing based on slot price and seat type (Thường/VIP/Ghế đôi)
  const getSeatPrice = (seat) => {
    const basePrice = showtime.price || 75000;
    const typeName = (seat.seatTypesName || seat.seatTypeName || seat.typeName || '').toLowerCase();
    if (typeName.includes('vip')) return basePrice + 35000;
    if (typeName.includes('đôi') || typeName.includes('couple')) return basePrice * 2 + 50000;
    return basePrice;
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat), 0);

  const handleProceed = () => {
    if (selectedSeats.length === 0) return;
    navigate(`/booking/${movieId}/snacks`, {
      state: {
        movie, showtime, cinema,
        seats: selectedSeats, 
        totalPrice,
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-cinema-muted">Đang tải sơ đồ phòng chiếu...</p>
        </div>
      </div>
    );
  }

  if (!roomData || !roomData.seats || roomData.seats.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Không có thông tin sơ đồ ghế cho phòng này</p>
          <Link to={`/booking/${movieId}`} className="btn-primary">Quay lại chọn suất chiếu</Link>
        </div>
      </div>
    );
  }

  const rows = Object.keys(seatsByRow).sort();

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <StepIndicator current={4} />

        {/* Screen label */}
        <div className="mb-8 text-center">
          <div className="relative inline-block w-full max-w-lg">
            <div className="h-2 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full mb-1 opacity-60" />
            <div className="h-6 bg-gradient-to-b from-primary/20 to-transparent rounded-t-[50%] w-full" />
            <p className="text-cinema-muted text-xs mt-1 tracking-widest uppercase">Màn hình {roomData.roomName}</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Seat Map */}
          <div className="flex-1 overflow-x-auto pb-4">
            <div className="inline-block min-w-full">
              {rows.map(row => (
                <div key={row} className="flex items-center gap-1.5 mb-1.5 justify-center">
                  <span className="text-cinema-muted text-xs w-5 text-right font-mono">{row}</span>
                  <div className="flex gap-1.5">
                    {seatsByRow[row].map(seat => {
                      const status = (seat.status || '').toLowerCase();
                      const isUnavailable = status !== 'available' && status !== 'active';
                      const isSelected = !!selectedSeats.find(s => s.id === seat.id);
                      const typeName = (seat.seatTypesName || seat.seatTypeName || seat.typeName || '').toLowerCase();
                      const isVIP = typeName.includes('vip');
                      const isCouple = typeName.includes('đôi') || typeName.includes('couple');

                      let seatClass = '';
                      if (isUnavailable) {
                        seatClass = 'bg-cinema-border/40 border-cinema-border/20 cursor-not-allowed opacity-40';
                      } else if (isSelected) {
                        seatClass = 'bg-green-500 border-green-400 shadow-lg shadow-green-500/30 scale-110';
                      } else if (isVIP) {
                        seatClass = 'bg-yellow-900/30 border-yellow-700/50 hover:bg-yellow-700/40 hover:border-yellow-500 cursor-pointer';
                      } else if (isCouple) {
                        seatClass = 'bg-red-900/30 border-red-700/50 hover:bg-red-700/40 hover:border-red-500 cursor-pointer';
                      } else {
                        seatClass = 'bg-cinema-surface border-cinema-border hover:bg-cinema-card hover:border-primary cursor-pointer';
                      }

                      return (
                        <motion.button
                          key={seat.id}
                          whileTap={!isUnavailable ? { scale: 0.9 } : {}}
                          onClick={() => toggleSeat(seat)}
                          disabled={isUnavailable}
                          title={`${seat.seatRow || seat.seatsRow}${seat.seatNumber || seat.seatsNumber} - ${seat.seatTypesName} - ${getSeatPrice(seat).toLocaleString('vi-VN')}đ`}
                          className={`${isCouple ? 'w-9' : 'w-7'} h-7 rounded-t-lg border text-[10px] font-mono transition-all duration-150 flex items-center justify-center ${seatClass}`}
                        >
                          {isUnavailable ? '✕' : isSelected ? '✓' : (seat.seatNumber || seat.seatsNumber)}
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
                  { color: 'bg-cinema-surface border border-cinema-border', label: 'Thường' },
                  { color: 'bg-yellow-900/30 border border-yellow-700/50', label: 'VIP' },
                  { color: 'bg-red-900/30 border border-red-700/50', label: 'Ghế đôi' },
                  { color: 'bg-green-500 border border-green-400', label: 'Đang chọn' },
                  { color: 'bg-cinema-border/40 border border-cinema-border/20 opacity-40', label: 'Đã đặt/Hỏng' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-6 h-5 rounded-t-md ${item.color}`} />
                    <span className="text-cinema-muted">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="card p-4">
              <h3 className="font-heading font-bold text-white text-sm mb-3">Ghế đã chọn</h3>
              {selectedSeats.length > 0 ? (
                <>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {selectedSeats.map(seat => (
                      <span key={seat.id} className="badge bg-primary text-cinema-black font-bold text-xs">
                        {seat.seatRow || seat.seatsRow}{seat.seatNumber || seat.seatsNumber}
                      </span>
                    ))}
                  </div>
                  <div className="border-t border-cinema-border pt-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-cinema-muted">Số ghế:</span>
                      <span className="text-white font-bold">{selectedSeats.length}</span>
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
