import { useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PAYMENT_METHODS } from '../../constants/mockData';
import useAuthStore from '../../store/authStore';
import { ticketApi } from '../../api';

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

function SuccessModal({ booking, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-cinema-card border border-cinema-border rounded-2xl p-8 max-w-md w-full text-center shadow-card-hover"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-6"
        >
          <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>

        <h2 className="font-heading font-extrabold text-2xl text-white mb-2">Đặt Vé Thành Công! 🎉</h2>
        <p className="text-cinema-muted text-sm mb-6">
          Vé của bạn đã được xác nhận. Mã vé sẽ được gửi qua email.
        </p>

        {/* QR Code placeholder */}
        <div className="bg-white rounded-xl p-4 w-36 mx-auto mb-6">
          <div className="grid grid-cols-6 gap-0.5">
            {Array.from({ length: 36 }).map((_, i) => (
              <div
                key={i}
                className={`w-full aspect-square ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}
              />
            ))}
          </div>
        </div>

        <div className="bg-cinema-surface rounded-xl p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-cinema-muted">Mã đặt vé</span>
            <span className="text-primary font-bold font-mono">{booking.code}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-cinema-muted">Phim</span>
            <span className="text-white font-medium text-right max-w-[180px]">{booking.movie}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-cinema-muted">Ghế</span>
            <span className="text-white font-medium">{booking.seats}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-cinema-muted">Tổng tiền</span>
            <span className="text-primary font-bold">{booking.total}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Link to="/" onClick={onClose} className="flex-1 btn-outline text-sm py-2.5">
            Về Trang Chủ
          </Link>
          <Link to="/profile" onClick={onClose} className="flex-1 btn-primary text-sm py-2.5">
            Vé Của Tôi
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Checkout() {
  const { movieId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { movie, showtime, cinema, seats, totalPrice, snacks = [] } = location.state || {};

  const { user } = useAuthStore();

  const [paymentMethod, setPaymentMethod] = useState('momo');
  // ✅ Tự động điền thông tin từ tài khoản đang đăng nhập (hỗ trợ cả mock & backend)
  const [form, setForm] = useState({
    name: user?.fullName || user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [booking, setBooking] = useState(null);

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

  const snackTotal = snacks.reduce((sum, s) => sum + (s.subtotal || 0), 0);
  const serviceFee = Math.round((totalPrice + snackTotal) * 0.05);
  const grandTotal = totalPrice + snackTotal + serviceFee;

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Vui lòng nhập họ tên';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email không hợp lệ';
    if (!form.phone.trim() || !/^(0|\+84)[0-9]{9}$/.test(form.phone)) errs.phone = 'Số điện thoại không hợp lệ';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setProcessing(true);

    let ticketCode = 'CB' + Math.random().toString(36).slice(2, 8).toUpperCase();

    // Thử tạo vé thật qua API
    try {
      const ticketData = {
        accountsId: user?.id,
        slotsId: showtime?.id,
        totalAmount: grandTotal,
        note: `Ghế: ${seats.join(', ')}`,
      };
      const res = await ticketApi.create(ticketData);
      if (res.data?.ticketsCode) {
        ticketCode = res.data.ticketsCode;
      }
    } catch (err) {
      console.warn('⚠️ Không thể tạo vé qua API, dùng mã tạm:', err.message);
    }

    // Simulate processing delay
    await new Promise(r => setTimeout(r, 1000));
    setProcessing(false);

    setBooking({
      code: ticketCode,
      movie: movie.title,
      seats: seats.join(', '),
      snacks: snacks.length > 0 ? snacks.map(s => `${s.icon} ${s.name} ×${s.quantity}`).join(', ') : null,
      total: grandTotal.toLocaleString('vi-VN') + 'đ',
    });
    setSuccess(true);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <StepIndicator current={3} />

        <div className="grid md:grid-cols-5 gap-6">
          {/* Left: Form */}
          <div className="md:col-span-3 space-y-6">
            {/* Contact Info */}
            <div className="card p-6">
              <h2 className="font-heading font-bold text-white text-lg mb-4">Thông Tin Liên Hệ</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-cinema-muted text-sm mb-1.5">Họ và tên *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: '' }); }}
                    placeholder="Nguyễn Văn A"
                    className={`input-field ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-cinema-muted text-sm mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
                    placeholder="email@example.com"
                    className={`input-field ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-cinema-muted text-sm mb-1.5">Số điện thoại *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: '' }); }}
                    placeholder="0912345678"
                    className={`input-field ${errors.phone ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                </div>
              </form>
            </div>

            {/* Payment Method */}
            <div className="card p-6">
              <h2 className="font-heading font-bold text-white text-lg mb-4">Phương Thức Thanh Toán</h2>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map(method => {
                  const isSelected = paymentMethod === method.id;
                  const logos = {
                    momo: (
                      <svg viewBox="0 0 120 40" className="h-8 w-auto" xmlns="http://www.w3.org/2000/svg">
                        <rect width="120" height="40" rx="8" fill="#AE2070"/>
                        <circle cx="20" cy="20" r="12" fill="white" opacity="0.15"/>
                        <circle cx="20" cy="20" r="7" fill="white" opacity="0.9"/>
                        <text x="38" y="26" fill="white" fontSize="16" fontWeight="bold" fontFamily="Arial, sans-serif">MoMo</text>
                      </svg>
                    ),
                    zalopay: (
                      <svg viewBox="0 0 130 40" className="h-8 w-auto" xmlns="http://www.w3.org/2000/svg">
                        <rect width="130" height="40" rx="8" fill="#0068FF"/>
                        <text x="10" y="27" fill="white" fontSize="17" fontWeight="bold" fontFamily="Arial, sans-serif">Zalo</text>
                        <rect x="68" y="8" width="2" height="24" fill="white" opacity="0.4"/>
                        <text x="76" y="27" fill="#FFD700" fontSize="17" fontWeight="bold" fontFamily="Arial, sans-serif">Pay</text>
                      </svg>
                    ),
                    vnpay: (
                      <svg viewBox="0 0 110 40" className="h-8 w-auto" xmlns="http://www.w3.org/2000/svg">
                        <rect width="110" height="40" rx="8" fill="#0A2E6E"/>
                        <text x="8" y="17" fill="#E31837" fontSize="13" fontWeight="900" fontFamily="Arial, sans-serif">VN</text>
                        <text x="8" y="32" fill="white" fontSize="13" fontWeight="900" fontFamily="Arial, sans-serif">PAY</text>
                        <rect x="42" y="8" width="2" height="24" fill="#E31837" opacity="0.6"/>
                        <text x="50" y="26" fill="white" fontSize="11" fontFamily="Arial, sans-serif">QR Code</text>
                      </svg>
                    ),
                    card: (
                      <svg viewBox="0 0 120 40" className="h-8 w-auto" xmlns="http://www.w3.org/2000/svg">
                        <rect width="120" height="40" rx="8" fill="#1A1F36"/>
                        {/* Mastercard logo */}
                        <circle cx="22" cy="20" r="11" fill="#EB001B"/>
                        <circle cx="36" cy="20" r="11" fill="#F79E1B" opacity="0.9"/>
                        <path d="M29 11.2a11 11 0 010 17.6A11 11 0 0129 11.2z" fill="#FF5F00"/>
                        <text x="52" y="26" fill="white" fontSize="12" fontWeight="bold" fontFamily="Arial, sans-serif">Credit</text>
                      </svg>
                    ),
                  };
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-cinema-border bg-cinema-surface hover:border-cinema-muted'
                      }`}
                    >
                      <div className="mb-2">{logos[method.id]}</div>
                      <p className={`font-semibold text-sm ${isSelected ? 'text-primary' : 'text-white'}`}>
                        {method.label}
                      </p>
                      <p className="text-cinema-muted text-xs mt-0.5">{method.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={processing}
              className={`w-full py-4 rounded-xl font-heading font-bold text-base transition-all duration-200 ${
                processing ? 'bg-cinema-surface text-cinema-muted cursor-not-allowed' : 'btn-accent'
              }`}
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Đang xử lý...
                </span>
              ) : `🔒 Thanh Toán ${grandTotal.toLocaleString('vi-VN')}đ`}
            </button>
          </div>

          {/* Right: Order Summary */}
          <div className="md:col-span-2">
            <div className="card p-5 sticky top-24">
              <h3 className="font-heading font-bold text-white mb-4">Đơn Hàng</h3>

              <div className="flex gap-3 mb-4 pb-4 border-b border-cinema-border">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-14 h-20 object-cover rounded-lg flex-shrink-0"
                  onError={e => { e.target.src = 'https://placehold.co/80x120/1E1E2C/A0A0B4'; }}
                />
                <div>
                  <p className="text-white font-semibold text-sm leading-snug">{movie.title}</p>
                  {cinema && <p className="text-cinema-muted text-xs mt-1">{cinema.name}</p>}
                  {showtime && (
                    <p className="text-cinema-muted text-xs">
                      {new Date(showtime.date).toLocaleDateString('vi-VN')} • {showtime.time}
                    </p>
                  )}
                  {showtime && <span className="badge bg-cinema-surface border border-cinema-border text-cinema-muted text-[10px] mt-1 inline-block">{showtime.type}</span>}
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4 pb-4 border-b border-cinema-border">
                <div className="flex justify-between">
                  <span className="text-cinema-muted">Ghế ({seats.length})</span>
                  <span className="text-white">{seats.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cinema-muted">Tiền vé</span>
                  <span className="text-white">{totalPrice.toLocaleString('vi-VN')}đ</span>
                </div>
                {snacks.length > 0 && (
                  <>
                    <div className="border-t border-cinema-border/50 pt-2 mt-2">
                      <p className="text-cinema-muted text-xs mb-1.5">🍿 Bỏng & Nước:</p>
                      {snacks.map(s => (
                        <div key={s.id} className="flex justify-between text-xs mb-1">
                          <span className="text-cinema-muted">{s.icon} {s.name} ×{s.quantity}</span>
                          <span className="text-white">{s.subtotal.toLocaleString('vi-VN')}đ</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-xs font-semibold pt-1">
                        <span className="text-cinema-muted">Tất cả bỏng nước</span>
                        <span className="text-primary">+{snackTotal.toLocaleString('vi-VN')}đ</span>
                      </div>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-cinema-muted">Phí dịch vụ (5%)</span>
                  <span className="text-white">{serviceFee.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-white font-bold">Tổng cộng</span>
                <span className="text-primary font-heading font-extrabold text-xl">
                  {grandTotal.toLocaleString('vi-VN')}đ
                </span>
              </div>

              <p className="text-cinema-muted text-xs mt-4 leading-relaxed">
                🔒 Thanh toán được mã hóa SSL an toàn. Vé sẽ được gửi qua email sau khi xác nhận.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {success && booking && (
          <SuccessModal booking={booking} onClose={() => setSuccess(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
