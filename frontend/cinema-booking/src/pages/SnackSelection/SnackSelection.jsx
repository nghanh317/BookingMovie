import { useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SNACK_ITEMS } from '../../constants/mockData';

const STEPS = ['Chọn suất chiếu', 'Chọn ghế', 'Bỏng & Nước', 'Thanh toán'];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8 flex-wrap gap-y-2">
      {STEPS.map((step, i) => (
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
          {i < STEPS.length - 1 && <div className={`w-6 h-0.5 ${i + 1 < current ? 'bg-primary' : 'bg-cinema-border'}`} />}
        </div>
      ))}
    </div>
  );
}

function QuantityControl({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-8 h-8 rounded-full border border-cinema-border text-white hover:border-primary hover:text-primary transition-all flex items-center justify-center text-lg font-bold"
      >−</button>
      <span className="w-6 text-center font-heading font-bold text-white text-base">{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        className="w-8 h-8 rounded-full border border-cinema-border text-white hover:border-primary hover:text-primary transition-all flex items-center justify-center text-lg font-bold"
      >+</button>
    </div>
  );
}

export default function SnackSelection() {
  const { movieId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { movie, showtime, cinema, seats, totalPrice } = location.state || {};

  // quantities: { [snackId]: number }
  const [quantities, setQuantities] = useState(() =>
    Object.fromEntries(SNACK_ITEMS.map(s => [s.id, 0]))
  );

  if (!movie || !seats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Phiên đặt vé đã hết hạn</p>
          <Link to="/movies" className="btn-primary">Chọn phim khác</Link>
        </div>
      </div>
    );
  }

  const setQty = (id, val) => setQuantities(prev => ({ ...prev, [id]: val }));

  const selectedSnacks = SNACK_ITEMS
    .filter(s => quantities[s.id] > 0)
    .map(s => ({ ...s, quantity: quantities[s.id], subtotal: s.price * quantities[s.id] }));

  const snackTotal = selectedSnacks.reduce((sum, s) => sum + s.subtotal, 0);

  const handleSkip = () => {
    navigate(`/booking/${movieId}/checkout`, {
      state: { movie, showtime, cinema, seats, totalPrice, snacks: [] },
    });
  };

  const handleContinue = () => {
    navigate(`/booking/${movieId}/checkout`, {
      state: { movie, showtime, cinema, seats, totalPrice, snacks: selectedSnacks },
    });
  };

  const CATEGORIES = [
    { key: 'snack', label: '🍿 Bỏng Rang', color: 'from-yellow-500/10 to-orange-500/10 border-yellow-700/30' },
    { key: 'drink', label: '🥤 Nước Uống', color: 'from-blue-500/10 to-cyan-500/10 border-blue-700/30' },
    { key: 'combo', label: '🎉 Combo Tiết Kiệm', color: 'from-primary/10 to-accent/10 border-primary/30' },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <StepIndicator current={3} />

        <div className="text-center mb-8">
          <h1 className="font-heading font-extrabold text-3xl text-white mb-2">Chọn Bỏng & Nước 🍿</h1>
          <p className="text-cinema-muted">Thêm bỏng rang và nước uống để trải nghiệm rạp chiếu thêm trọn vẹn!</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left – Items */}
          <div className="lg:col-span-2 space-y-6">
            {CATEGORIES.map(cat => {
              const items = SNACK_ITEMS.filter(s => s.category === cat.key);
              return (
                <div key={cat.key}>
                  <h2 className="font-heading font-bold text-white mb-3 text-lg">{cat.label}</h2>
                  <div className="space-y-3">
                    {items.map(item => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`bg-gradient-to-r ${cat.color} border rounded-xl p-4 flex items-center gap-4 hover:shadow-lg transition-all`}
                      >
                        <div className="text-4xl flex-shrink-0">{item.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold">{item.name}</p>
                          <p className="text-cinema-muted text-xs mt-0.5 line-clamp-1">{item.desc}</p>
                          <p className="text-primary font-bold mt-1">{item.price.toLocaleString('vi-VN')}đ</p>
                        </div>
                        <QuantityControl
                          value={quantities[item.id]}
                          onChange={val => setQty(item.id, val)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right – Summary */}
          <div className="lg:col-span-1">
            <div className="card p-5 sticky top-24">
              <h3 className="font-heading font-bold text-white mb-4">Tóm tắt đơn</h3>

              {/* Movie info */}
              <div className="flex gap-3 mb-4 pb-4 border-b border-cinema-border">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
                  onError={e => { e.target.src = 'https://placehold.co/80x120/1E1E2C/A0A0B4'; }}
                />
                <div>
                  <p className="text-white font-semibold text-sm leading-snug">{movie.title}</p>
                  {showtime && <p className="text-cinema-muted text-xs mt-1">{showtime.time} · {showtime.type}</p>}
                  <p className="text-cinema-muted text-xs">Ghế: {seats.join(', ')}</p>
                </div>
              </div>

              {/* Snack list */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-cinema-muted">Tiền vé ({seats.length} ghế)</span>
                  <span className="text-white">{totalPrice.toLocaleString('vi-VN')}đ</span>
                </div>
                {selectedSnacks.length > 0 && (
                  <>
                    <p className="text-cinema-muted text-xs pt-1 pb-0.5 border-t border-cinema-border/50 mt-2">Bỏng & Nước:</p>
                    {selectedSnacks.map(s => (
                      <div key={s.id} className="flex justify-between text-xs">
                        <span className="text-cinema-muted">{s.icon} {s.name} ×{s.quantity}</span>
                        <span className="text-white">{s.subtotal.toLocaleString('vi-VN')}đ</span>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {snackTotal > 0 && (
                <div className="flex justify-between text-sm border-t border-cinema-border pt-3 mb-4">
                  <span className="text-cinema-muted">Bỏng & Nước</span>
                  <span className="text-primary font-bold">+{snackTotal.toLocaleString('vi-VN')}đ</span>
                </div>
              )}

              <div className="flex justify-between items-center border-t border-cinema-border pt-3 mb-5">
                <span className="text-white font-bold">Tạm tính</span>
                <span className="text-primary font-heading font-extrabold text-xl">
                  {(totalPrice + snackTotal).toLocaleString('vi-VN')}đ
                </span>
              </div>

              <button onClick={handleContinue} className="w-full btn-primary py-3 text-sm font-bold mb-2">
                {selectedSnacks.length > 0 ? `Tiếp tục với bỏng nước →` : 'Tiếp tục →'}
              </button>
              <button onClick={handleSkip} className="w-full py-2.5 rounded-xl border border-cinema-border text-cinema-muted hover:text-white hover:border-cinema-muted transition-all text-sm">
                Bỏ qua, không mua
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
