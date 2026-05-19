import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { NEWS_ARTICLES } from './News';
import { VOUCHERS, MOVIES } from '../../constants/mockData';
import useAuthStore from '../../store/authStore';
import ReviewSection from '../../components/movie/ReviewSection';

// ─── Accordion Section ────────────────────────────────────────────
const REVIEW_SECTIONS = [
  { id: 'synopsis', icon: '📖', title: 'Tóm tắt phim', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20',
    content: `Bộ phim xoay quanh hành trình của Paul Atreides sau khi gia đình anh bị phản bội và tàn sát trên hành tinh sa mạc Arrakis. Cùng với Chani và bộ tộc Fremen, Paul dần nhận ra số phận được tiên tri dành cho mình.\n\nPhim tiếp nối trực tiếp từ phần một, đẩy nhanh nhịp độ và mở rộng quy mô đáng kể. Denis Villeneuve đã cân bằng hoàn hảo giữa tự sự cá nhân của Paul và bức tranh sử thi vĩ đại của vũ trụ Dune.` },
  { id: 'screenplay', icon: '✍️', title: 'Review kịch bản', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20',
    content: `Kịch bản do chính Denis Villeneuve và Jon Spaihts thực hiện đã thành công trong việc cô đọng nửa sau cuốn tiểu thuyết đồ sộ của Frank Herbert thành một trải nghiệm điện ảnh mạch lạc.\n\nĐiểm nổi bật: Phim dũng cảm từ chối biến Paul thành "anh hùng không tì vết" – thay vào đó khai thác chiều sâu đạo đức khi một con người bị cuốn vào vòng xoáy của quyền lực và tôn giáo.` },
  { id: 'acting', icon: '🎭', title: 'Diễn xuất', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20',
    content: `Timothée Chalamet tiếp tục thể hiện sự trưởng thành vượt bậc trong vai Paul – từ một thanh niên lạc lõng đến một lãnh tụ đầy mâu thuẫn nội tâm.\n\nZendaya cuối cùng được trao không gian để tỏa sáng. Austin Butler gây bất ngờ hoàn toàn với vai Feyd-Rautha – một kẻ phản diện lạnh lùng, cuốn hút và thực sự đáng sợ.` },
  { id: 'cinematography', icon: '🎬', title: 'Quay dựng & Kỹ xảo', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20',
    content: `Greig Fraser tiếp tục xứng đáng với mọi giải thưởng. Phim được quay trên định dạng IMAX với phần lớn cảnh trên Arrakis sử dụng ánh sáng tự nhiên, tạo ra một thẩm mỹ cực kỳ độc đáo.\n\nHans Zimmer trở lại với phần nhạc nền thậm chí còn đột phá hơn phần một.` },
  { id: 'conclusion', icon: '🏆', title: 'Tổng kết & Điểm số', color: 'text-primary', bg: 'bg-primary/10 border-primary/20',
    content: `Dune: Part Two là một trong những bom tấn sci-fi tốt nhất từng được thực hiện.\n\n⭐ Kịch bản: 9/10\n⭐ Diễn xuất: 9.5/10\n⭐ Kỹ thuật: 10/10\n⭐ Tổng thể: 9.1/10` },
];

function AccordionSection({ section, index }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className={`border rounded-xl overflow-hidden mb-3 ${section.bg}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left">
        <span className="flex items-center gap-3 font-heading font-semibold text-white">
          <span className="text-xl">{section.icon}</span>
          <span className={section.color}>{section.title}</span>
        </span>
        <motion.svg animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}
          className="w-5 h-5 text-cinema-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="px-5 pb-5 pt-1 text-cinema-muted text-sm leading-relaxed whitespace-pre-line border-t border-white/10">
              {section.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Voucher Card inline ──────────────────────────────────────────
function InlineVoucherCard({ voucher, owned, userPoints, onRedeem, onReceive, redeemed }) {
  const isExpired = new Date(voucher.expiry) < new Date();
  const canRedeem = !owned && !redeemed && voucher.pointCost > 0 && userPoints >= voucher.pointCost;
  const notEnoughPoints = !owned && !redeemed && voucher.pointCost > 0 && userPoints < voucher.pointCost;
  const isFree = voucher.pointCost === 0;
  const expiryDate = new Date(voucher.expiry).toLocaleDateString('vi-VN');
  const daysLeft = Math.ceil((new Date(voucher.expiry) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className={`relative rounded-xl border overflow-hidden flex transition-all ${
      isExpired ? 'border-cinema-border/50 opacity-60' :
      owned || redeemed ? 'border-green-500/40 bg-green-500/5' :
      'border-cinema-border bg-cinema-card hover:border-primary/40'
    }`}>
      <div className={`w-1.5 flex-shrink-0 ${
        isExpired ? 'bg-cinema-border' :
        owned || redeemed ? 'bg-green-500' :
        voucher.type === 'percent' ? 'bg-accent' : 'bg-primary'
      }`} />
      <div className="flex-1 p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono font-bold text-primary text-sm tracking-widest bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                {voucher.code}
              </span>
              {(owned || redeemed) && <span className="badge bg-green-500/20 border border-green-500/30 text-green-400 text-[10px]">✓ Đã nhận</span>}
              {isExpired && <span className="badge bg-red-500/20 border border-red-500/30 text-red-400 text-[10px]">Hết hạn</span>}
              {!isExpired && daysLeft <= 7 && <span className="badge bg-orange-500/20 border border-orange-500/30 text-orange-400 text-[10px]">⚡ Còn {daysLeft} ngày</span>}
            </div>
            <p className="text-white font-medium text-sm">{voucher.desc}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-heading font-extrabold text-xl text-primary leading-none">
              {voucher.type === 'percent' ? `${voucher.value}%` : `${(voucher.value / 1000).toFixed(0)}K`}
            </p>
            <p className="text-cinema-muted text-[10px]">GIẢM</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-cinema-muted text-xs">
            {voucher.minOrder > 0 && <p>Đơn tối thiểu: {voucher.minOrder.toLocaleString('vi-VN')}đ</p>}
            <p>HSD: {expiryDate}</p>
          </div>
          {!isExpired && !owned && !redeemed && (
            isFree ? (
              <button onClick={() => onReceive?.(voucher)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-all cursor-pointer">
                🎁 Nhận ngay
              </button>
            ) : (
              <button onClick={() => canRedeem && onRedeem?.(voucher)} disabled={notEnoughPoints}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  canRedeem ? 'bg-primary text-cinema-black hover:bg-primary/80 cursor-pointer' :
                  'bg-cinema-surface text-cinema-muted border border-cinema-border cursor-not-allowed'
                }`}>
                ⭐ {voucher.pointCost} điểm {canRedeem ? '· Đổi ngay' : notEnoughPoints ? '· Chưa đủ điểm' : ''}
              </button>
            )
          )}
          {(owned || redeemed) && (
            <span className="text-green-400 text-xs font-medium flex items-center gap-1">
              ✅ Đã lưu vào ví voucher
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────
export default function NewsDetail() {
  const { id } = useParams();
  const article = NEWS_ARTICLES.find(a => a.id === Number(id));
  const { isLoggedIn, user, addVoucher, spendPoints } = useAuthStore();

  const [redeemMsg, setRedeemMsg] = useState('');

  if (!article) {
    return (
      <div className="min-h-screen bg-cinema-black flex items-center justify-center text-cinema-muted text-center">
        <div>
          <span className="text-5xl block mb-4">🔍</span>
          <p className="text-lg font-semibold text-white mb-2">Không tìm thấy bài viết</p>
          <Link to="/news" className="btn-primary px-5 py-2 text-sm">Quay lại Tin tức</Link>
        </div>
      </div>
    );
  }

  const isPromo = article.category === 'Khuyến mãi';
  const isReview = article.category === 'Review phim';
  const isPreview = article.category === 'Dự báo phim';
  // Lấy từ user state (đã persist) — đồng bộ với Offers page
  const myVoucherIds = user?.myVouchers || [];

  const articleVouchers = isPromo && article.voucherIds
    ? VOUCHERS.filter(v => article.voucherIds.includes(v.id))
    : [];

  const handleRedeem = (voucher) => {
    if (!isLoggedIn) { setRedeemMsg('Vui lòng đăng nhập để đổi voucher!'); return; }
    if ((user?.points || 0) < voucher.pointCost) { setRedeemMsg('Bạn không đủ điểm để đổi voucher này.'); return; }
    // Trừ điểm & lưu vào kho voucher (persist vào localStorage qua authStore)
    spendPoints(voucher.pointCost);
    addVoucher(voucher.id);
    setRedeemMsg(`✅ Đã đổi voucher ${voucher.code} thành công! Đã trừ ${voucher.pointCost} điểm. Voucher lưu vào ví của bạn.`);
    setTimeout(() => setRedeemMsg(''), 5000);
  };

  const handleReceive = (voucher) => {
    if (!isLoggedIn) { setRedeemMsg('Vui lòng đăng nhập để nhận voucher!'); return; }
    // Lưu vào kho voucher (persist vào localStorage qua authStore)
    addVoucher(voucher.id);
    setRedeemMsg(`🎁 Đã nhận voucher ${voucher.code} thành công! Voucher đã được lưu vào ví của bạn.`);
    setTimeout(() => setRedeemMsg(''), 5000);
  };

  const categoryColor = {
    'Review phim': 'bg-primary/20 text-primary border-primary/30',
    'Dự báo phim': 'bg-accent/20 text-accent border-accent/30',
    'Khuyến mãi': 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  return (
    <div className="min-h-screen bg-cinema-black">
      {/* Hero */}
      <div className="relative h-[400px] overflow-hidden">
        <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover"
          onError={e => { e.target.src = 'https://via.placeholder.com/1280x400/1a1a2e/e5b85c?text=CinemaBook'; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-black via-cinema-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-black/70 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-24 relative z-10 pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-cinema-muted mb-4">
          <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link to="/news" className="hover:text-primary transition-colors">Tin tức & KM</Link>
          <span>/</span>
          <span className="text-white truncate max-w-xs">{article.title}</span>
        </div>

        {/* Header card */}
        <div className="bg-cinema-card border border-cinema-border rounded-2xl p-6 mb-6 shadow-card-hover">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${categoryColor[article.category] || 'bg-white/10 text-white border-white/20'}`}>
              {article.category}
            </span>
            {article.genre.map(g => (
              <span key={g} className="text-xs px-2.5 py-1 rounded-full bg-cinema-surface border border-cinema-border text-cinema-muted">{g}</span>
            ))}
          </div>
          <h1 className="font-heading font-bold text-white text-2xl md:text-3xl leading-tight mb-3">{article.title}</h1>
          <p className="text-cinema-muted leading-relaxed mb-5">{article.excerpt}</p>
          <div className="flex flex-wrap items-center gap-5 pt-4 border-t border-cinema-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center text-cinema-black font-bold text-xs">
                {article.authorAvatar}
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{article.author}</p>
                <p className="text-cinema-muted text-xs">Biên tập viên</p>
              </div>
            </div>
            <span className="text-cinema-muted text-xs">
              📅 {new Date(article.publishedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
            <span className="text-cinema-muted text-xs">⏱ {article.readTime}</span>
            {article.rating && (
              <div className="ml-auto flex items-center gap-2 bg-cinema-surface border border-cinema-border px-4 py-2 rounded-xl">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-primary font-bold text-lg">{article.rating}</span>
                <span className="text-cinema-muted text-sm">/10</span>
              </div>
            )}
          </div>
        </div>

        {/* ── KHUYẾN MÃI: nội dung + voucher inline ── */}
        {isPromo && (
          <>
            {/* Nội dung khuyến mãi */}
            <div className="bg-cinema-card border border-cinema-border rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-6 bg-green-500 rounded-full" />
                <h2 className="font-heading font-bold text-white text-lg">📢 Chi tiết chương trình</h2>
              </div>
              <div className="text-cinema-muted text-sm leading-relaxed whitespace-pre-line">
                {article.promotionContent}
              </div>
            </div>

            {/* Voucher section */}
            <div className="bg-cinema-card border border-cinema-border rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-6 bg-gradient-gold rounded-full" />
                <h2 className="font-heading font-bold text-white text-lg">🎁 Nhận & Đổi Voucher Ngay</h2>
              </div>

              {/* Redeem message */}
              <AnimatePresence>
                {redeemMsg && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className={`mb-4 p-3 rounded-xl text-sm flex items-center gap-2 border ${
                      redeemMsg.startsWith('✅') || redeemMsg.startsWith('🎁')
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}>
                    {redeemMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              {!isLoggedIn && (
                <div className="bg-cinema-surface border border-cinema-border rounded-xl p-4 mb-4 flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-cinema-muted text-sm">🔐 Đăng nhập để nhận/đổi voucher</p>
                  <div className="flex gap-2">
                    <Link to="/login" className="btn-outline text-xs px-4 py-2">Đăng nhập</Link>
                    <Link to="/register" className="btn-primary text-xs px-4 py-2">Đăng ký</Link>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {articleVouchers.map(v => (
                  <InlineVoucherCard
                    key={v.id}
                    voucher={v}
                    owned={myVoucherIds.includes(v.id)}
                    redeemed={false}  // trạng thái persist qua myVoucherIds rồi
                    userPoints={user?.points || 0}
                    onRedeem={handleRedeem}
                    onReceive={handleReceive}
                  />
                ))}
              </div>

              <p className="text-cinema-muted text-xs mt-4 text-center">
                Để xem và quản lý tất cả voucher, hãy vào{' '}
                <Link to="/offers" className="text-primary hover:underline">trang Ưu đãi →</Link>
              </p>
            </div>
          </>
        )}

        {/* ── REVIEW: Accordion sections ── */}
        {isReview && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 bg-gradient-gold rounded-full" />
              <h2 className="font-heading font-bold text-white text-xl">Nội dung review</h2>
              <span className="text-cinema-muted text-sm">— Bấm để thu gọn / mở rộng</span>
            </div>
            {(article.sections
              ? [
                  { id:'synopsis', icon:'📖', title:'Tóm tắt phìm', color:'text-blue-400', bg:'bg-blue-500/10 border-blue-500/20', content: article.sections.synopsis },
                  { id:'screenplay', icon:'✍️', title:'Review kịch bản', color:'text-amber-400', bg:'bg-amber-500/10 border-amber-500/20', content: article.sections.screenplay },
                  { id:'acting', icon:'🎭', title:'Diễn xuất', color:'text-pink-400', bg:'bg-pink-500/10 border-pink-500/20', content: article.sections.acting },
                  { id:'cinematography', icon:'🎬', title:'Quay dựng & Kỹ xảo', color:'text-emerald-400', bg:'bg-emerald-500/10 border-emerald-500/20', content: article.sections.cinematography },
                  { id:'conclusion', icon:'🏆', title:'Tổng kết & Điểm số', color:'text-primary', bg:'bg-primary/10 border-primary/20', content: article.sections.conclusion },
                ].filter(s => s.content)
              : REVIEW_SECTIONS
            ).map((section, i) => (
              <AccordionSection key={section.id} section={section} index={i} />
            ))}
          </div>
        )}

        {/* ── DỰ BÁO PHÌM: nội dung tự do + movie cards ── */}
        {isPreview && (
          <div className="mb-6 space-y-6">
            {/* Nội dung chính */}
            {(article.previewContent || article.excerpt) && (
              <div className="bg-cinema-card border border-cinema-border rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-6 bg-accent rounded-full" />
                  <h2 className="font-heading font-bold text-white text-xl">🔮 Nội dung dự báo</h2>
                </div>
                <div className="text-cinema-muted text-sm leading-relaxed whitespace-pre-line">
                  {article.previewContent || article.excerpt}
                </div>
                {article.trailerUrl && (
                  <a href={article.trailerUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 transition-all text-sm font-medium">
                    ▶️ Xem Trailer
                  </a>
                )}
              </div>
            )}

            {/* Movie cards */}
            {(() => {
              const ids = article.linkedMovieIds || (article.linkedMovieId ? [article.linkedMovieId] : []);
              const linkedMovies = MOVIES.filter(m => ids.includes(m.id));
              if (linkedMovies.length === 0) return null;
              return (
                <div className="bg-cinema-card border border-cinema-border rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-6 bg-primary rounded-full" />
                    <h2 className="font-heading font-bold text-white text-xl">🎬 Phim liên quan</h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {linkedMovies.map(movie => (
                      <Link key={movie.id} to={`/movies/${movie.id}`}
                        className="group block bg-cinema-surface rounded-xl border border-cinema-border overflow-hidden hover:border-primary/40 hover:shadow-card-hover transition-all duration-300">
                        <div className="relative aspect-[2/3] overflow-hidden">
                          <img src={movie.poster} alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={e => { e.target.src = 'https://placehold.co/200x300/1a1a2e/e5b85c?text=Movie'; }} />
                          <div className="absolute inset-0 bg-gradient-to-t from-cinema-black/80 via-transparent to-transparent" />
                          <div className="absolute bottom-2 left-2 right-2">
                            {movie.rating && (
                              <span className="inline-flex items-center gap-1 bg-cinema-black/70 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] text-primary font-bold">
                                ★ {movie.rating}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="p-2.5">
                          <p className="text-white text-xs font-semibold line-clamp-2 group-hover:text-primary transition-colors">{movie.title}</p>
                          <p className="text-cinema-muted text-[10px] mt-0.5">{movie.genre?.[0]}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {article.tags.map(tag => (
            <span key={tag} className="text-xs px-3 py-1 rounded-full bg-cinema-surface border border-cinema-border text-cinema-muted hover:border-primary/40 hover:text-primary transition-colors cursor-pointer">
              #{tag}
            </span>
          ))}
        </div>

        {/* ── Đánh giá & Bình luận ── */}
        {article.linkedMovieId ? (
          <div className="bg-cinema-card border border-cinema-border rounded-2xl p-6">
            <ReviewSection movieId={article.linkedMovieId} />
          </div>
        ) : isPromo ? null : (
          // Bài không liên kết phim → thông báo
          <div className="bg-cinema-surface border border-cinema-border rounded-2xl p-6 text-center text-cinema-muted">
            <span className="text-3xl block mb-2">💬</span>
            <p className="text-sm">Bài viết này không liên kết với phim cụ thể trong hệ thống.</p>
          </div>
        )}

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link to="/news" className="btn-outline px-6 py-2.5 text-sm inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại danh sách bài viết
          </Link>
        </div>
      </div>
    </div>
  );
}
