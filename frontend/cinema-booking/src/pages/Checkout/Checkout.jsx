import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import { sendBookingConfirmEmail } from '../../services/emailService';
import ticketService from '../../services/ticketService';
import payosService from '../../services/payosService';
import seatLockService from '../../services/seatLockService';

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
  const { 
    movie, showtime, cinema, seats, totalPrice, snacks = [], selectedVoucher,
    lockExpiresAt, showtimeId, slotId 
  } = location.state || {};

  const { user } = useAuthStore();

  const [paymentMethod, setPaymentMethod] = useState('payos');
  // ✅ Tự động điền thông tin từ tài khoản đang đăng nhập
  const [form, setForm] = useState({
    name: user?.fullName || user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [booking, setBooking] = useState(null);
  const [payosData, setPayosData] = useState(null);

  // ── Đồng hồ giữ ghế (tiếp nối từ SeatSelection / SnackSelection) ──
  const seatExpiresAt = lockExpiresAt ? new Date(lockExpiresAt) : null;
  const calcSeatRemain = () =>
    seatExpiresAt ? Math.max(0, Math.round((seatExpiresAt - Date.now()) / 1000)) : 0;
  const [seatRemain, setSeatRemain] = useState(calcSeatRemain);
  const [seatExpired, setSeatExpired] = useState(false);

  useEffect(() => {
    if (!seatExpiresAt) return;
    const id = setInterval(() => {
      const r = calcSeatRemain();
      setSeatRemain(r);
      if (r === 0) {
        setSeatExpired(true);
        clearInterval(id);
        // Hủy giao dịch nếu đang mở QR và nhả ghế
        const uid = user?.id || user?.userId;
        const sid = showtimeId || slotId;
        if (uid && sid) {
          seatLockService.releaseSeats(uid, sid).catch(() => {});
        }
        setPayosData(prev => {
          if (prev?.ticketId) {
            ticketService.update(prev.ticketId, { status: 'CANCELLED', paymentStatus: 'UNPAID' }).catch(() => {});
          }
          return null;
        });
      }
    }, 1000);
    return () => clearInterval(id);
  }, [lockExpiresAt]);

  const snackTotal = (snacks || []).reduce((sum, s) => sum + (s.subtotal || 0), 0);
  const subTotalAmount = (totalPrice || 0) + snackTotal;
  
  let discountAmount = 0;
  if (selectedVoucher) {
    if (subTotalAmount >= (selectedVoucher.minOrderAmount || 0)) {
      if (selectedVoucher.discountType === 'PERCENTAGE') {
        discountAmount = subTotalAmount * (selectedVoucher.discountValue / 100);
        if (selectedVoucher.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, selectedVoucher.maxDiscountAmount);
        }
      } else {
        discountAmount = selectedVoucher.discountValue;
      }
    }
  }

  const serviceFee = Math.round(subTotalAmount * 0.05);
  const grandTotal = Math.max(0, subTotalAmount - discountAmount) + serviceFee;

  // 2. Polling kiểm tra trạng thái vé mỗi 3s
  useEffect(() => {
    let pollInterval;
    if (payosData) {
      pollInterval = setInterval(async () => {
        try {
          // Bỏ cache bằng cách thêm query string time thông qua tham số của getById
          const ticket = await ticketService.getById(payosData.ticketId, { _t: Date.now() });
          console.log('[Polling] Trạng thái vé hiện tại:', ticket?.paymentStatus);
          
          if (ticket && (ticket.paymentStatus === 'PAID' || ticket.status === 'CONFIRMED')) {
            clearInterval(pollInterval);
            setPayosData(null);
            
            // Đặt thành công
            const newBooking = {
              code: ticket.ticketsCode,
              movie: movie?.title,
              seats: (seats || []).map(s => s.label).join(', '),
              snacks: snacks.length > 0 ? snacks.map(s => `${s.icon} ${s.name} ×${s.quantity}`).join(', ') : null,
              total: grandTotal.toLocaleString('vi-VN') + 'đ',
            };
            setBooking(newBooking);
            setSuccess(true);

            // Gửi email xác nhận đặt vé (sau khi PayOS xác nhận)
            try {
              await sendBookingConfirmEmail({
                to_name:      form.name,
                to_email:     form.email,
                booking_code: ticket.ticketsCode,
                movie_title:  movie?.title || 'Phim',
                cinema_name:  cinema?.name || 'Chưa xác định',
                showtime:     showtime
                  ? `${new Date(showtime.date).toLocaleDateString('vi-VN')} – ${showtime.time}`
                  : 'Chưa xác định',
                seats:  (seats || []).map(s => s.label).join(', '),
                total:  grandTotal.toLocaleString('vi-VN') + 'đ',
              });
            } catch (err) {
              console.warn('Không thể gửi email xác nhận:', err);
            }
          }
        } catch (e) {
          console.warn('Lỗi kiểm tra trạng thái vé:', e.message);
        }
      }, 3000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [payosData, movie, seats, snacks, grandTotal, form, cinema, showtime]);

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

    try {
      if (paymentMethod === 'payos') {
        // LUỒNG THANH TOÁN THẬT QUA PAYOS
        const ticketPayload = {
          accountsId: user?.id || user?.accountsId || 1,
          slotsId: showtime?.id || location.state?.showtimeId,
          discountAmount: discountAmount,
          note: `Thanh toán vé ${movie.title} qua PayOS`,
          seats: seats.map(s => ({ seatId: s.id })),
          products: snacks.map(s => ({ productId: s.id, quantity: s.quantity }))
        };

        console.log('[Checkout] Đang tạo vé thật:', ticketPayload);
        const createdTicket = await ticketService.create(ticketPayload);
        console.log('[Checkout] Tạo vé thành công:', createdTicket);

        if (!createdTicket || !createdTicket.id) {
          throw new Error('Không nhận được thông tin vé sau khi tạo!');
        }

        // Tạo link thanh toán PayOS (Lấy dữ liệu QR)
        console.log('[Checkout] Đang tạo thông tin QR PayOS cho vé ID:', createdTicket.id);
        const payosResponse = await payosService.createPaymentLink(createdTicket.id);
        
        if (payosResponse && payosResponse.qrCode) {
          // Hiện màn hình QR — đồng hồ đếm ngược là seatRemain tiếp tục chạy, KHÔNG reset
          setPayosData({ ...payosResponse, ticketId: createdTicket.id });
        } else {
          throw new Error('Không tạo được mã QR thanh toán PayOS!');
        }
      } else {
        // CÁC PHƯƠNG THỨC KHÁC (GIẢ LẬP NHƯ CŨ)
        await new Promise(r => setTimeout(r, 1500));
        const bookingCode = 'CB' + Math.random().toString(36).slice(2, 8).toUpperCase();
        const newBooking = {
          code: bookingCode,
          movie: movie.title,
          seats: seats.map(s => s.label).join(', '),
          snacks: snacks.length > 0 ? snacks.map(s => `${s.icon} ${s.name} ×${s.quantity}`).join(', ') : null,
          total: grandTotal.toLocaleString('vi-VN') + 'đ',
        };
        setBooking(newBooking);
        setSuccess(true);

        // Gửi email xác nhận đặt vé
        try {
          await sendBookingConfirmEmail({
            to_name:      form.name,
            to_email:     form.email,
            booking_code: bookingCode,
            movie_title:  movie.title,
            cinema_name:  cinema?.name || 'Chưa xác định',
            showtime:     showtime
              ? `${new Date(showtime.date).toLocaleDateString('vi-VN')} – ${showtime.time}`
              : 'Chưa xác định',
            seats:  seats.map(s => s.label).join(', '),
            total:  grandTotal.toLocaleString('vi-VN') + 'đ',
          });
        } catch (err) {
          console.warn('Không thể gửi email xác nhận:', err);
        }
      }
    } catch (error) {
      console.error('[Checkout] Lỗi khi thanh toán:', error);
      alert('Đã xảy ra lỗi trong quá trình đặt vé và thanh toán: ' + (error.response?.data?.error || error.message));
    } finally {
      setProcessing(false);
    }
  };

  if (payosData) {
    const minutes = Math.floor(seatRemain / 60);
    const seconds = seatRemain % 60;

    return (
      <div className="min-h-screen py-12 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-cinema-black/80 backdrop-blur-sm z-0"></div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8 max-w-md w-full text-center relative z-10 border-primary/50 shadow-glow-gold"
        >
          <div className="flex justify-center mb-4">
             <svg viewBox="0 0 140 40" className="h-10 w-auto" xmlns="http://www.w3.org/2000/svg">
               <rect width="140" height="40" rx="8" fill="#0052FF"/>
               <rect x="10" y="8" width="24" height="24" rx="6" fill="white" />
               <rect x="15" y="13" width="14" height="14" rx="2" fill="#0052FF" />
               <rect x="18" y="16" width="8" height="8" fill="white" />
               <text x="44" y="25" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial, sans-serif">VietQR PayOS</text>
             </svg>
          </div>
          <h2 className="font-heading font-bold text-2xl text-white mb-2">Thanh Toán Quét Mã QR</h2>
          <p className="text-cinema-muted text-sm mb-6">Mở ứng dụng ngân hàng và quét mã dưới đây</p>
          
          <div className="bg-white p-3 rounded-2xl inline-block mb-6 shadow-xl">
            <QRCodeCanvas value={payosData.qrCode} size={224} />
          </div>

          <div className="bg-cinema-surface rounded-xl p-4 mb-6 text-left border border-cinema-border/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-cinema-muted">Số tiền:</span>
              <span className="text-primary font-bold text-xl">{payosData.amount.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-cinema-muted">Nội dung:</span>
              <span className="text-white font-medium text-right max-w-[200px] break-words">{payosData.description}</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-2 mb-6">
            <p className="text-cinema-muted text-sm">Thời gian thanh toán còn lại:</p>
            <div className={`text-4xl font-mono font-bold ${seatExpired || seatRemain <= 60 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
              {seatExpired ? '00:00' : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
            </div>
            {seatExpired ? (
              <p className="text-red-400 text-sm font-semibold mt-2">⚠️ Hết thời gian! Giao dịch đã bị huỷ.</p>
            ) : (
              <div className="flex items-center gap-2 mt-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-cinema-muted">
                  Hệ thống đang chờ bạn thanh toán...
                </p>
              </div>
            )}
          </div>
          
          <button 
            onClick={async () => {
              if (payosData?.ticketId) {
                try {
                  await ticketService.update(payosData.ticketId, { status: 'CANCELLED', paymentStatus: 'UNPAID' });
                } catch (err) {
                  console.error('Lỗi khi hủy vé:', err);
                }
              }
              const uid = user?.id || user?.userId;
              const sid = showtimeId || slotId;
              if (uid && sid) {
                seatLockService.releaseSeats(uid, sid).catch(() => {});
              }
              setPayosData(null); 
              navigate('/'); 
            }}
            className="text-cinema-muted hover:text-red-400 transition-colors underline text-sm"
          >
            Hủy thanh toán và quay về
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <StepIndicator current={5} />

        {/* ── Banner đếm ngược giữ ghế ── */}
        {seatExpiresAt && (
          <div className={`flex items-center justify-between gap-4 mb-6 px-5 py-3 rounded-xl border ${
            seatExpired ? 'bg-red-500/10 border-red-500/40' : seatRemain <= 60 ? 'bg-red-500/10 border-red-500/40' : seatRemain <= 120 ? 'bg-yellow-500/10 border-yellow-500/40' : 'bg-green-500/10 border-green-500/40'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-xl">⏳</span>
              <div>
                <p className="text-white text-sm font-semibold">
                  {seatExpired ? 'Ghế đã hết hạn!' : 'Vui lòng thanh toán trong vòng'}
                </p>
                {!seatExpired && (
                  <p className="text-cinema-muted text-xs">Ghế sẽ được giải phóng khi hết thời gian</p>
                )}
              </div>
            </div>
            {!seatExpired ? (
              <span className={`font-mono font-extrabold text-2xl ${
                seatRemain <= 60 ? 'text-red-400 animate-pulse' : seatRemain <= 120 ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {String(Math.floor(seatRemain / 60)).padStart(2, '0')}:{String(seatRemain % 60).padStart(2, '0')}
              </span>
            ) : (
              <button
                onClick={() => navigate(`/booking/${movieId}/seats`, {
                  state: { movie, showtime, cinema, slotId: showtimeId || slotId },
                })}
                className="btn-primary text-sm px-4 py-1.5"
              >
                Chọn lại ghế
              </button>
            )}
          </div>
        )}

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
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'payos', label: 'Quét mã VietQR (PayOS)', desc: 'Tạo mã QR chuyển khoản nhanh' }
                ].map(method => {
                  const isSelected = paymentMethod === method.id;
                  const logos = {
                    payos: (
                      <svg viewBox="0 0 140 40" className="h-8 w-auto" xmlns="http://www.w3.org/2000/svg">
                        <rect width="140" height="40" rx="8" fill="#0052FF"/>
                        <rect x="10" y="8" width="24" height="24" rx="6" fill="white" />
                        <rect x="15" y="13" width="14" height="14" rx="2" fill="#0052FF" />
                        <rect x="18" y="16" width="8" height="8" fill="white" />
                        <text x="44" y="25" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial, sans-serif">VietQR PayOS</text>
                      </svg>
                    )
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
                  <span className="text-white">{seats.map(s => s.label).join(', ')}</span>
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
                {discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-cinema-muted">Mã giảm giá ({selectedVoucher?.promotionName})</span>
                    <span className="text-red-400 font-bold">-{discountAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
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
