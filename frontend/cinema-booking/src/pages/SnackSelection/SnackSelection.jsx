import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import productService from '../../services/productService';
import promotionService from '../../services/promotionService';
import useAuthStore from '../../store/authStore';

const HOLD_MINUTES = 10; // Thời gian giữ ghế (phút)

const STEPS = ['Chọn tỉnh/thành phố', 'Chọn ngày', 'Chọn rạp & suất chiếu', 'Chọn ghế & bỏng nước', 'Thanh toán'];

// Map category enum từ backend → icon + label + màu
const CATEGORY_META = {
  FOOD: { icon: '🍿', label: 'Bỏng Rang', color: 'from-yellow-500/10 to-orange-500/10 border-yellow-700/30' },
  DRINK: { icon: '🥤', label: 'Nước Uống', color: 'from-blue-500/10 to-cyan-500/10 border-blue-700/30' },
  COMBO: { icon: '🎉', label: 'Combo Tiết Kiệm', color: 'from-primary/10 to-accent/10 border-primary/30' },
  VOUCHER: { icon: '🎫', label: 'Khác', color: 'from-cinema-surface/10 to-cinema-card/10 border-cinema-border' },
};

// Chuẩn hoá category string từ backend (object hoặc string)
function parseCategory(cat) {
  if (!cat) return 'FOOD';
  if (typeof cat === 'string') return cat.toUpperCase();
  if (typeof cat === 'object') return (cat.name || cat.value || '').toUpperCase();
  return 'FOOD';
}

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
  const location    = useLocation();
  const navigate    = useNavigate();
  const {
    movie, showtime, cinema, seats, totalPrice,
    showtimeId, slotId, lockExpiresAt,
  } = location.state || {};
  
  const { user } = useAuthStore();

  // ── Khởi tạo thời gian hết hạn ──
  // Nếu backend đã trả lockExpiresAt (ISO string) thì dùng luôn,
  // nếu chưa (chưa restart backend) thì tạo local 10 phút từ bây giờ.
  const expiresAtRef = useRef(
    lockExpiresAt || new Date(Date.now() + HOLD_MINUTES * 60 * 1000).toISOString()
  );
  const [holdExpired, setHoldExpired] = useState(false);

  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [quantities, setQuantities] = useState({});
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [showVoucherDropdown, setShowVoucherDropdown] = useState(false);

  // Fetch products và vouchers từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProducts, resPromotions] = await Promise.all([
          productService.getAll({ size: 200 }),
          promotionService.getAll({ size: 100 })
        ]);
        
        let items = [];
        if (resProducts?.content) items = resProducts.content;
        else if (resProducts?.data?.content) items = resProducts.data.content;
        else if (Array.isArray(resProducts?.data)) items = resProducts.data;
        else if (Array.isArray(resProducts)) items = resProducts;

        setProducts(items);
        const initial = {};
        items.forEach(p => { initial[p.id] = 0; });
        setQuantities(initial);

        let promoItems = [];
        if (resPromotions?.content) promoItems = resPromotions.content;
        else if (resPromotions?.data?.content) promoItems = resPromotions.data.content;
        else if (Array.isArray(resPromotions?.data)) promoItems = resPromotions.data;
        else if (Array.isArray(resPromotions)) promoItems = resPromotions;

        // Vouchers thông thường (không yêu cầu điểm)
        const generalVouchers = promoItems.filter(v => v.status === 'ACTIVE' && (!v.requiredPoints || v.requiredPoints <= 0));
        
        // Vouchers người dùng đã đổi từ điểm
        let userOwned = [];
        try {
          const saved = localStorage.getItem(`ownedVouchers_${user?.id || user?.userId}`);
          if (saved) {
            const parsed = JSON.parse(saved);
            userOwned = parsed.map(item => item.original).filter(Boolean);
          }
        } catch (e) {}

        const allAvailable = [...generalVouchers, ...userOwned];
        
        // Lọc bỏ các voucher đã hết hạn
        const now = new Date();
        const validVouchersOnly = allAvailable.filter(v => {
          if (!v.endDate) return true;
          let end = null;
          if (typeof v.endDate === 'string' && v.endDate.includes('-') && v.endDate.split('-')[0].length === 2) {
             const [datePart, timePart] = v.endDate.split(' ');
             const [dd, mm, yyyy] = datePart.split('-');
             end = new Date(`${yyyy}-${mm}-${dd}T${timePart || '23:59:59'}`);
          } else {
             end = new Date(v.endDate);
          }
          return end > now;
        });

        // Xóa trùng lặp theo ID
        const uniqueVouchers = Array.from(new Map(validVouchersOnly.map(v => [v.id, v])).values());
        
        setVouchers(uniqueVouchers);

      } catch (err) {
        console.error('[SnackSelection] fetch data error:', err.message);
        setProducts([]);
        setVouchers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  // Khi lock hết hạn: hiển modal rồi đưa về chọn ghế
  const handleExpired = () => {
    setHoldExpired(true);
    setTimeout(() => navigate(`/booking/${movieId}/seats`, { state: { movie, showtime, cinema, slotId: showtimeId || slotId } }), 3000);
  };

  const setQty = (id, val) => setQuantities(prev => ({ ...prev, [id]: val }));

  const selectedSnacks = products
    .filter(p => (quantities[p.id] || 0) > 0)
    .map(p => ({
      ...p,
      quantity: quantities[p.id],
      subtotal: parseFloat(p.price) * quantities[p.id],
      icon: CATEGORY_META[parseCategory(p.category)]?.icon || '🍿',
      name: p.productName,
    }));

  const snackTotal = selectedSnacks.reduce((sum, s) => sum + s.subtotal, 0);

  const subTotalAmount = totalPrice + snackTotal;
  
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
  const finalTotal = Math.max(0, subTotalAmount - discountAmount);

  const handleSkip = () => {
    navigate(`/booking/${movieId}/checkout`, {
      state: { movie, showtime, cinema, seats, totalPrice, snacks: [], selectedVoucher, lockExpiresAt: expiresAtRef.current },
    });
  };

  const handleContinue = () => {
    navigate(`/booking/${movieId}/checkout`, {
      state: { movie, showtime, cinema, seats, totalPrice, snacks: selectedSnacks, selectedVoucher, lockExpiresAt: expiresAtRef.current },
    });
  };

  // Group products theo category
  const categories = Object.keys(CATEGORY_META);
  const grouped = categories.map(catKey => ({
    key: catKey,
    meta: CATEGORY_META[catKey],
    items: products.filter(p => parseCategory(p.category) === catKey),
  })).filter(g => g.items.length > 0);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <StepIndicator current={4} />

        {/* Modal hết hạn */}
        <AnimatePresence>
          {holdExpired && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="card p-8 max-w-sm w-full text-center"
              >
                <p className="text-5xl mb-4">⏰</p>
                <h2 className="font-heading font-bold text-xl text-white mb-2">Hết thời gian giữ ghế!</h2>
                <p className="text-cinema-muted text-sm mb-4">
                  Ghế bạn đã chọn đã được giải phóng. Đang đưa bạn về trang chọn ghế...
                </p>
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center mb-8">
          <h1 className="font-heading font-extrabold text-3xl text-white mb-2">Chọn Bỏng &amp; Nước 🍿</h1>
          <p className="text-cinema-muted">Thêm bỏng rang và nước uống để trải nghiệm rạp chiếu thêm trọn vẹn!</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left – Items */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-cinema-muted">Đang tải sản phẩm...</span>
              </div>
            ) : grouped.length === 0 ? (
              <div className="text-center py-16 text-cinema-muted">
                <p className="text-4xl mb-3">🍿</p>
                <p>Hiện tại chưa có sản phẩm nào.</p>
              </div>
            ) : grouped.map(({ key, meta, items }) => (
              <div key={key}>
                <h2 className="font-heading font-bold text-white mb-3 text-lg">
                  {meta.icon} {meta.label}
                </h2>
                <div className="space-y-3">
                  {items.map(item => {
                    const catMeta = CATEGORY_META[parseCategory(item.category)] || CATEGORY_META.FOOD;
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`bg-gradient-to-r ${catMeta.color} border rounded-xl p-4 flex items-center gap-4 hover:shadow-lg transition-all`}
                      >
                        {/* Ảnh hoặc icon */}
                        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-cinema-dark border border-cinema-border flex items-center justify-center">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover"
                              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                          ) : null}
                          <span className="text-3xl" style={{ display: item.imageUrl ? 'none' : 'flex' }}>{catMeta.icon}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold">{item.productName}</p>
                          {item.description && (
                            <p className="text-cinema-muted text-xs mt-0.5 line-clamp-1">{item.description}</p>
                          )}
                          <p className="text-primary font-bold mt-1">
                            {parseFloat(item.price).toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                        <QuantityControl
                          value={quantities[item.id] || 0}
                          onChange={val => setQty(item.id, val)}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right – Summary */}
          <div className="lg:col-span-1">
            <div className="card p-5 sticky top-24 space-y-4">

              <h3 className="font-heading font-bold text-white">Tóm tắt đơn</h3>

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

              {/* Voucher Selection */}
              <div className="border-t border-cinema-border pt-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-semibold text-sm">🎟 Khuyến mãi</span>
                  {selectedVoucher && (
                    <button 
                      onClick={() => setSelectedVoucher(null)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Bỏ chọn
                    </button>
                  )}
                </div>
                
                {vouchers.length === 0 ? (
                  <p className="text-cinema-muted text-xs">Không có khuyến mãi khả dụng</p>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setShowVoucherDropdown(!showVoucherDropdown)}
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-cinema-border bg-cinema-dark hover:border-primary/50 transition-all text-sm"
                    >
                      <span className={selectedVoucher ? "text-primary font-bold" : "text-cinema-muted"}>
                        {selectedVoucher ? selectedVoucher.promotionName : "Chọn khuyến mãi..."}
                      </span>
                      <span className="text-xs">▼</span>
                    </button>

                    <AnimatePresence>
                      {showVoucherDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-cinema-card border border-cinema-border rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto"
                        >
                          {vouchers.map(v => {
                            const isEligible = subTotalAmount >= (v.minOrderAmount || 0);
                            return (
                              <button
                                key={v.id}
                                disabled={!isEligible}
                                onClick={() => {
                                  setSelectedVoucher(v);
                                  setShowVoucherDropdown(false);
                                }}
                                className={`w-full text-left p-3 border-b border-cinema-border last:border-0 transition-colors ${
                                  !isEligible ? 'opacity-50 cursor-not-allowed bg-cinema-surface/30' : 'hover:bg-cinema-surface'
                                }`}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <span className={`font-semibold text-sm ${!isEligible ? 'text-cinema-muted' : 'text-white'}`}>
                                    {v.promotionName}
                                  </span>
                                  <span className="text-primary font-bold text-xs bg-primary/10 px-2 py-0.5 rounded">
                                    {v.discountType === 'PERCENTAGE' ? `-${v.discountValue}%` : `-${v.discountValue.toLocaleString('vi-VN')}đ`}
                                  </span>
                                </div>
                                <p className="text-xs text-cinema-muted">
                                  {v.minOrderAmount ? `Đơn tối thiểu ${(v.minOrderAmount).toLocaleString('vi-VN')}đ` : 'Áp dụng mọi đơn'}
                                </p>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Total Calculation */}
              <div className="space-y-2 border-t border-cinema-border pt-4 mb-5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-cinema-muted">Tổng cộng</span>
                  <span className="text-white font-medium">{subTotalAmount.toLocaleString('vi-VN')}đ</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-cinema-muted">Giảm giá</span>
                    <span className="text-red-400 font-bold">-{discountAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="flex justify-between items-end pt-2">
                  <span className="text-white font-bold">Tạm tính</span>
                  <span className="text-primary font-heading font-extrabold text-2xl leading-none">
                    {finalTotal.toLocaleString('vi-VN')}đ
                  </span>
                </div>
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
