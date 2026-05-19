// ─────────────────────────────────────────────────────────────
//  BẢNG XẾP HẠNG THÀNH VIÊN  –  CinemaBooking Loyalty Program
// ─────────────────────────────────────────────────────────────
//
//  Tỉ lệ tích điểm: 10.000đ chi tiêu = 1 điểm
//  (vé thường 75k → ~7–8 điểm/vé, IMAX 130k → 13 điểm/vé)
//
//  Ngưỡng hạng:
//    Bronze  :       0 – 299  điểm  (khách mới, ~1–3 lần xem)
//    Silver  :   300 – 999  điểm  (~4–12 lần xem)
//    Gold    : 1.000 – 2.999 điểm  (~1–3 năm trung thành)
//    Diamond : 3.000+        điểm  (khách VIP siêu trung thành)
// ─────────────────────────────────────────────────────────────

export const RANKS = [
  {
    key: 'bronze',
    label: 'Bronze',
    icon: '🥉',
    minPoints: 0,
    maxPoints: 299,
    color: 'text-orange-400',
    borderColor: 'border-orange-500/40',
    bgColor: 'bg-orange-500/10',
    badgeCls: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
    gradientFrom: '#92400e',
    gradientTo: '#b45309',
    perks: [
      'Tích 1 điểm / 10.000đ chi tiêu',
      'Ưu đãi sinh nhật',
      'Nhận thông báo phim mới',
    ],
  },
  {
    key: 'silver',
    label: 'Silver',
    icon: '🥈',
    minPoints: 300,
    maxPoints: 999,
    color: 'text-gray-300',
    borderColor: 'border-gray-400/40',
    bgColor: 'bg-gray-400/10',
    badgeCls: 'bg-gray-400/20 border-gray-400/30 text-gray-300',
    gradientFrom: '#6b7280',
    gradientTo: '#9ca3af',
    perks: [
      'Tích 1 điểm / 10.000đ chi tiêu',
      'Giảm 5% cho mọi giao dịch',
      'Ưu tiên chọn ghế sớm hơn 24h',
      'Voucher sinh nhật 50.000đ',
    ],
  },
  {
    key: 'gold',
    label: 'Gold',
    icon: '🥇',
    minPoints: 1000,
    maxPoints: 2999,
    color: 'text-yellow-400',
    borderColor: 'border-yellow-500/40',
    bgColor: 'bg-yellow-500/10',
    badgeCls: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    gradientFrom: '#b45309',
    gradientTo: '#f59e0b',
    perks: [
      'Tích 1,2 điểm / 10.000đ chi tiêu',
      'Giảm 10% cho mọi giao dịch',
      'Combo bắp nước giảm 20%',
      'Ưu tiên chọn ghế sớm hơn 48h',
      'Voucher sinh nhật 100.000đ',
    ],
  },
  {
    key: 'diamond',
    label: 'Diamond',
    icon: '💎',
    minPoints: 3000,
    maxPoints: Infinity,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-400/40',
    bgColor: 'bg-cyan-500/10',
    badgeCls: 'bg-cyan-500/20 border-cyan-400/30 text-cyan-400',
    gradientFrom: '#0e7490',
    gradientTo: '#22d3ee',
    perks: [
      'Tích 1,5 điểm / 10.000đ chi tiêu',
      'Giảm 15% cho mọi giao dịch',
      'Combo bắp nước miễn phí mỗi tháng',
      'Ưu tiên VIP – chọn ghế bất kỳ lúc nào',
      'Voucher sinh nhật 200.000đ',
      'Hỗ trợ khách hàng ưu tiên 24/7',
    ],
  },
];

// ─── Tỉ lệ tích điểm theo loại chi tiêu ────────────────────
//  Điểm = Math.floor(số_tiền / POINT_RATE)
export const POINT_RATE = 10000; // 10.000đ = 1 điểm cơ bản

// Hệ số nhân theo hạng (khi đã lên hạng cao hơn)
export const RANK_MULTIPLIER = {
  bronze:  1.0,
  silver:  1.0,
  gold:    1.2,
  diamond: 1.5,
};

// Điểm tích lũy theo từng loại vé / dịch vụ (ví dụ tham chiếu)
export const POINT_EARN_EXAMPLES = [
  { label: 'Vé thường (2D)',        price: 75000,   points: 7,  icon: '🎟️' },
  { label: 'Vé VIP (2D)',           price: 110000,  points: 11, icon: '⭐' },
  { label: 'Vé đôi (2D)',          price: 200000,  points: 20, icon: '💑' },
  { label: 'Vé thường (3D)',        price: 90000,   points: 9,  icon: '🎟️' },
  { label: 'Vé VIP (3D)',           price: 130000,  points: 13, icon: '⭐' },
  { label: 'Vé thường (IMAX)',      price: 130000,  points: 13, icon: '🎬' },
  { label: 'Vé VIP (IMAX)',         price: 180000,  points: 18, icon: '👑' },
  { label: 'Bỏng rang bơ (M)',      price: 45000,   points: 4,  icon: '🍿' },
  { label: 'Nước uống (M)',         price: 35000,   points: 3,  icon: '🥤' },
  { label: 'Combo đôi',            price: 70000,   points: 7,  icon: '🎉' },
  { label: 'Combo gia đình',       price: 95000,   points: 9,  icon: '🎊' },
];

// Helper: Lấy thông tin hạng dựa trên điểm
export function getRankByPoints(points) {
  return RANKS.slice().reverse().find(r => points >= r.minPoints) || RANKS[0];
}

// Helper: % tiến độ đến hạng tiếp theo
export function getRankProgress(points) {
  const currentRank = getRankByPoints(points);
  const idx = RANKS.findIndex(r => r.key === currentRank.key);
  if (idx === RANKS.length - 1) return { progress: 100, nextRank: null, pointsNeeded: 0 };
  const nextRank = RANKS[idx + 1];
  const progress = ((points - currentRank.minPoints) / (nextRank.minPoints - currentRank.minPoints)) * 100;
  return {
    progress: Math.min(progress, 100),
    nextRank,
    pointsNeeded: nextRank.minPoints - points,
  };
}
