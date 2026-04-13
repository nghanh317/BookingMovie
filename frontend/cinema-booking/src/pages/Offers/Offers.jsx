import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { VOUCHERS } from '../../constants/mockData';
import useAuthStore from '../../store/authStore';
import { promotionApi } from '../../api';

// --- Voucher Card ---
function VoucherCard({ voucher, owned, userPoints, onRedeem }) {
  const isExpired = new Date(voucher.expiry) < new Date();
  const canRedeem = !owned && voucher.pointCost > 0 && userPoints >= voucher.pointCost;
  const notEnoughPoints = !owned && voucher.pointCost > 0 && userPoints < voucher.pointCost;
  const expiryDate = new Date(voucher.expiry).toLocaleDateString('vi-VN');
  const daysLeft = Math.ceil((new Date(voucher.expiry) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl border overflow-hidden flex ${
        isExpired
          ? 'border-cinema-border/50 opacity-60'
          : owned
          ? 'border-primary/40 bg-gradient-to-br from-primary/5 to-cinema-card'
          : 'border-cinema-border bg-cinema-card hover:border-primary/50 transition-colors'
      }`}
    >
      {/* Left color strip */}
      <div className={`w-2 flex-shrink-0 ${
        isExpired ? 'bg-cinema-border' :
        owned ? 'bg-gradient-gold' :
        voucher.type === 'percent' ? 'bg-accent' : 'bg-primary'
      }`} />

      <div className="flex-1 p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono font-bold text-primary text-base tracking-widest bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                {voucher.code}
              </span>
              {owned && (
                <span className="badge bg-green-500/20 border border-green-500/30 text-green-400 text-[10px]">✓ Đang sở hữu</span>
              )}
              {isExpired && (
                <span className="badge bg-red-500/20 border border-red-500/30 text-red-400 text-[10px]">Hết hạn</span>
              )}
              {!isExpired && daysLeft <= 7 && (
                <span className="badge bg-orange-500/20 border border-orange-500/30 text-orange-400 text-[10px]">⚡ Còn {daysLeft} ngày</span>
              )}
            </div>
            <p className="text-white font-semibold text-sm">{voucher.desc}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-heading font-extrabold text-2xl text-primary leading-none">
              {voucher.type === 'percent' ? `${voucher.value}%` : `${(voucher.value / 1000).toFixed(0)}K`}
            </p>
            <p className="text-cinema-muted text-[10px]">GIẢM</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="text-cinema-muted text-xs space-y-0.5">
            {voucher.minOrder > 0 && <p>Đơn tối thiểu: {voucher.minOrder.toLocaleString('vi-VN')}đ</p>}
            <p>HSD: {expiryDate}</p>
          </div>
          {voucher.pointCost > 0 && !owned && (
            <button
              onClick={() => onRedeem && onRedeem(voucher)}
              disabled={notEnoughPoints || isExpired}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                canRedeem
                  ? 'bg-primary text-cinema-black hover:bg-primary/80 cursor-pointer'
                  : 'bg-cinema-surface text-cinema-muted border border-cinema-border cursor-not-allowed'
              }`}
            >
              ⭐ {voucher.pointCost} điểm
              {canRedeem && ' · Đổi ngay'}
              {notEnoughPoints && ' · Chưa đủ điểm'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// --- Main Offers Page ---
export default function Offers() {
  const { isLoggedIn, user } = useAuthStore();
  const [tab, setTab] = useState('owned');
  const [redeemedIds, setRedeemedIds] = useState([]);
  const [vouchers, setVouchers] = useState(VOUCHERS);

  // Fetch khuyến mãi từ backend
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const { data } = await promotionApi.getAll({ page: 0, size: 50 });
        const list = data.content || data.data || data;
        if (Array.isArray(list) && list.length > 0) {
          const mapped = list.map(p => ({
            id: p.id,
            code: p.promotionCode || `PROMO${p.id}`,
            desc: p.description || p.promotionName || 'Khuyến mãi',
            type: p.discountType === 'PERCENT' ? 'percent' : 'fixed',
            value: Number(p.discountValue) || 0,
            minOrder: Number(p.minOrderAmount) || 0,
            expiry: p.endDate || new Date(Date.now() + 30 * 86400000).toISOString(),
            pointCost: 0,
            isPublic: true,
            active: p.status === 'ACTIVE',
            imageUrl: p.imageUrl,
          }));
          setVouchers(mapped);
        }
      } catch (err) {
        console.warn('⚠️ Không lấy được khuyến mãi, dùng mock:', err.message);
      }
    };
    fetchPromotions();
  }, []);

  const myVoucherIds = user?.myVouchers || [];
  const ownedVouchers = vouchers.filter(v => myVoucherIds.includes(v.id) || redeemedIds.includes(v.id));
  const redeemableVouchers = vouchers.filter(v =>
    !myVoucherIds.includes(v.id) && !redeemedIds.includes(v.id) && v.pointCost > 0
  );
  const publicVouchers = vouchers.filter(v => v.isPublic && v.active);

  const handleRedeem = (voucher) => {
    if (user && user.points >= voucher.pointCost) {
      setRedeemedIds(prev => [...prev, voucher.id]);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-cinema-surface border-b border-cinema-border py-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-heading font-extrabold text-4xl text-white mb-1">🎁 Ưu Đãi Của Tôi</h1>
            <p className="text-cinema-muted">
              {isLoggedIn
                ? `Bạn đang có ${(user?.points || 0).toLocaleString('vi-VN')} điểm thưởng`
                : 'Đăng nhập để xem và sử dụng voucher của bạn'}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-8">
        {isLoggedIn ? (
          <>
            {/* Points Banner */}
            <div className="bg-gradient-to-r from-primary/10 via-cinema-card to-accent/10 border border-primary/20 rounded-2xl p-6 mb-8 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-gold flex items-center justify-center text-3xl flex-shrink-0 shadow-glow-gold">
                  ⭐
                </div>
                <div>
                  <p className="text-cinema-muted text-sm mb-0.5">Điểm tích lũy của bạn</p>
                  <p className="font-heading font-extrabold text-4xl text-primary">{(user?.points || 0).toLocaleString('vi-VN')}</p>
                  <p className="text-cinema-muted text-xs mt-1">Mỗi lần đặt vé bạn nhận thêm điểm thưởng</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-cinema-muted text-xs mb-1">Hạng thành viên</p>
                <span className={`badge text-sm font-bold px-4 py-2 ${
                  user?.level === 'Platinum' ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300' :
                  user?.level === 'Gold' ? 'bg-primary/20 border border-primary/40 text-primary' :
                  user?.level === 'Silver' ? 'bg-gray-400/20 border border-gray-400/40 text-gray-300' :
                  'bg-orange-500/20 border border-orange-500/40 text-orange-400'
                }`}>
                  {user?.level === 'Platinum' ? '💎' : user?.level === 'Gold' ? '⭐' : user?.level === 'Silver' ? '🥈' : '🥉'} {user?.level}
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-cinema-surface rounded-lg p-1 border border-cinema-border mb-6 w-fit">
              {[
                { key: 'owned', label: `🎫 Voucher của tôi (${ownedVouchers.length})` },
                { key: 'redeem', label: `⭐ Đổi bằng điểm (${redeemableVouchers.length})` },
              ].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`px-5 py-2.5 rounded-md text-sm font-medium transition-all ${
                    tab === t.key ? 'bg-primary text-cinema-black' : 'text-cinema-muted hover:text-white'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Voucher Grid */}
            {tab === 'owned' && (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {ownedVouchers.length > 0 ? ownedVouchers.map(v => (
                  <VoucherCard key={v.id} voucher={v} owned userPoints={user?.points || 0} />
                )) : (
                  <div className="sm:col-span-2 xl:col-span-3 text-center py-16">
                    <p className="text-6xl mb-4">🎫</p>
                    <p className="text-white text-lg font-semibold mb-2">Chưa có voucher nào</p>
                    <p className="text-cinema-muted">Hãy đổi điểm để nhận voucher ngay!</p>
                    <button onClick={() => setTab('redeem')} className="btn-primary mt-4 px-6 py-2.5 text-sm">
                      Đổi điểm lấy voucher ⭐
                    </button>
                  </div>
                )}
              </div>
            )}

            {tab === 'redeem' && (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {redeemableVouchers.length > 0 ? redeemableVouchers.map(v => (
                  <VoucherCard key={v.id} voucher={v} owned={false} userPoints={user?.points || 0} onRedeem={handleRedeem} />
                )) : (
                  <div className="sm:col-span-2 xl:col-span-3 text-center py-16">
                    <p className="text-6xl mb-4">✨</p>
                    <p className="text-white text-lg font-semibold mb-2">Bạn đã đổi hết voucher khả dụng!</p>
                    <p className="text-cinema-muted">Tiếp tục đặt vé để tích thêm điểm.</p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* Chưa đăng nhập */
          <div>
            <div className="bg-gradient-to-r from-accent/10 to-primary/10 border border-cinema-border rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-white font-semibold text-lg mb-1">🔐 Đăng nhập để xem ưu đãi cá nhân</p>
                <p className="text-cinema-muted">Thành viên nhận điểm thưởng sau mỗi lần đặt vé và đổi voucher độc quyền.</p>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <Link to="/login" className="btn-outline px-6 py-2.5 text-sm">Đăng nhập</Link>
                <Link to="/register" className="btn-primary px-6 py-2.5 text-sm">Đăng ký miễn phí</Link>
              </div>
            </div>

            <h2 className="font-heading font-bold text-white text-xl mb-4">📢 Voucher khuyến mãi đang diễn ra</h2>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {publicVouchers.map(v => (
                <VoucherCard key={v.id} voucher={v} owned={false} userPoints={0} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
