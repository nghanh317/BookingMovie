import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NEWS_ARTICLES } from '../News/News';
import { MOVIES, VOUCHERS } from '../../constants/mockData';
import useNotificationStore from '../../store/notificationStore';

// ── Tabs giống phía user ─────────────────────────────────────
const TABS = [
  { key: 'review',  label: 'Review Phim',   icon: '🎬', category: 'Review phim' },
  { key: 'preview', label: 'Dự Báo Phim',   icon: '🔮', category: 'Dự báo phim' },
  { key: 'promo',   label: 'Khuyến Mãi',    icon: '🎉', category: 'Khuyến mãi' },
];

const CATEGORY_COLOR = {
  'Review phim': 'bg-primary/20 text-primary border-primary/30',
  'Dự báo phim': 'bg-accent/20 text-accent border-accent/30',
  'Khuyến mãi':  'bg-green-500/20 text-green-400 border-green-500/30',
};

function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('vi-VN');
}

// ── Modal tạo/sửa bài viết ───────────────────────────────────
function ArticleModal({ mode, article, tab, onClose, onSave }) {
  const tabMeta   = TABS.find(t => t.key === tab);
  const isPromo   = tab === 'promo';
  const isPreview = tab === 'preview';

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    title:            article?.title         || '',
    excerpt:          article?.excerpt       || '',
    coverImage:       article?.coverImage    || '',
    bannerImage:      article?.bannerImage   || '',
    author:           article?.author        || 'Admin',
    authorAvatar:     article?.authorAvatar  || 'AD',
    publishedAt:      article?.publishedAt   || today,
    readTime:         article?.readTime      || '5 phút đọc',
    genre:            article?.genre?.join(', ') || '',
    tags:             article?.tags?.join(', ')  || '',
    rating:           article?.rating        || '',
    linkedMovieId:    article?.linkedMovieId || '',
    // ── Review sections (accordion) ──
    synopsis:         article?.sections?.synopsis         || '',
    screenplay:       article?.sections?.screenplay       || '',
    acting:           article?.sections?.acting           || '',
    cinematography:   article?.sections?.cinematography   || '',
    conclusion:       article?.sections?.conclusion       || '',
    ratingScreenplay: article?.sections?.ratingScreenplay || '',
    ratingActing:     article?.sections?.ratingActing     || '',
    ratingCine:       article?.sections?.ratingCine       || '',
    // ── Preview (Dự báo) fields ──
    previewContent:   article?.previewContent  || '',
    releaseDate:      article?.releaseDate     || '',
    trailerUrl:       article?.trailerUrl      || '',
    expectedRating:   article?.expectedRating  || '',
    linkedMovieIds:   article?.linkedMovieIds?.join(', ') || (article?.linkedMovieId ? String(article.linkedMovieId) : ''),
    // ── Khuyến mãi fields ──
    voucherIds:       article?.voucherIds?.join(', ') || '',
    promotionContent: article?.promotionContent || '',
    discountPercent:  article?.discountPercent || '',
    validFrom:        article?.validFrom || today,
    validTo:          article?.validTo   || '',
  });

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim() || !form.excerpt.trim()) return;
    onSave({
      id:          article?.id || Date.now(),
      title:       form.title.trim(),
      slug:        form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      excerpt:     form.excerpt.trim(),
      coverImage:  form.coverImage || 'https://placehold.co/640x360/1a1a2e/e5b85c?text=CinemaBook',
      bannerImage: form.bannerImage || '',
      category:    tabMeta.category,
      genre:       form.genre.split(',').map(s => s.trim()).filter(Boolean),
      rating:      form.rating ? +form.rating : null,
      author:      form.author,
      authorAvatar: form.authorAvatar,
      publishedAt: form.publishedAt,
      readTime:    form.readTime,
      tags:        form.tags.split(',').map(s => s.trim()).filter(Boolean),
      linkedMovieId: form.linkedMovieId ? +form.linkedMovieId : null,
      // ── nội dung review accordion ──
      sections: tab === 'review' ? {
        synopsis:       form.synopsis,
        screenplay:     form.screenplay,
        acting:         form.acting,
        cinematography: form.cinematography,
        conclusion:     form.conclusion,
        ratingScreenplay: form.ratingScreenplay,
        ratingActing:   form.ratingActing,
        ratingCine:     form.ratingCine,
      } : undefined,
      // ── preview đặc thú ──
      ...(isPreview && {
        previewContent:  form.previewContent,
        releaseDate:     form.releaseDate,
        trailerUrl:      form.trailerUrl,
        expectedRating:  form.expectedRating ? +form.expectedRating : null,
        linkedMovieIds:  form.linkedMovieIds.split(',').map(s => +s.trim()).filter(Boolean),
      }),
      // ── promo đặc thú ──
      ...(isPromo && {
        voucherIds:       (Array.isArray(form.voucherIds) ? form.voucherIds : form.voucherIds.split(',')).map(s=>typeof s === 'string' ? s.trim() : s).filter(Boolean),
        promotionContent: form.promotionContent,
        discountPercent:  form.discountPercent ? +form.discountPercent : null,
        validFrom:        form.validFrom,
        validTo:          form.validTo,
      }),
    });
    onClose();
  };

  const renderField = (label, fieldKey, type='text', required=false, placeholder='') => (
    <div key={fieldKey}>
      <label className="text-cinema-muted text-xs mb-1 block cursor-pointer" htmlFor={`field-${fieldKey}`}>
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        id={`field-${fieldKey}`}
        type={type}
        className="input-field w-full"
        placeholder={placeholder}
        value={form[fieldKey] !== undefined ? form[fieldKey] : ''}
        onChange={e => f(fieldKey, e.target.value)}
        {...(type === 'number' ? { step: '0.1', min: '0', max: '10' } : {})}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cinema-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-cinema-dark border border-cinema-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="sticky top-0 bg-cinema-dark border-b border-cinema-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="font-heading font-bold text-white text-lg">
              {mode === 'create' ? '➕ Tạo bài viết mới' : '✏️ Sửa bài viết'}
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded border ${CATEGORY_COLOR[tabMeta.category]}`}>
              {tabMeta.icon} {tabMeta.label}
            </span>
          </div>
          <button onClick={onClose} className="text-cinema-muted hover:text-white transition-colors p-1">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {/* Thông tin chung */}
          <div className="bg-cinema-surface rounded-xl p-4 space-y-3 border border-cinema-border">
            <p className="text-white text-xs font-semibold uppercase tracking-wide">📝 Thông tin chung</p>
            {renderField("Tiêu đề", "title", "text", true, "Nhập tiêu đề bài viết...")}
            <div>
              <label className="text-cinema-muted text-xs mb-1 block cursor-pointer" htmlFor="excerpt">Mô tả ngắn <span className="text-red-400">*</span></label>
              <textarea
                id="excerpt"
                className="input-field resize-none w-full"
                rows={3}
                placeholder="Tóm tắt ngắn về bài viết..."
                value={form.excerpt}
                onChange={e => f('excerpt', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {renderField("Tác giả", "author", "text", false, "Tên tác giả")}
              {renderField("Avatar initials", "authorAvatar", "text", false, "VD: MT, TH...")}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {renderField("Ngày xuất bản", "publishedAt", "date")}
              {renderField("Thời gian đọc", "readTime", "text", false, "VD: 5 phút đọc")}
            </div>
          </div>

          {/* Media */}
          <div className="bg-cinema-surface rounded-xl p-4 space-y-3 border border-cinema-border">
            <p className="text-white text-xs font-semibold uppercase tracking-wide">🖼️ Hình ảnh</p>
            {renderField("Ảnh cover (URL)", "coverImage", "text", false, "https://...")}
            {renderField("Banner (URL, hiển thị đầu bài)", "bannerImage", "text", false, "https://...")}
            {form.coverImage && (
              <img src={form.coverImage} alt="preview" className="w-full h-32 object-cover rounded-lg"
                onError={e => { e.target.style.display = 'none'; }} />
            )}
          </div>

          {/* Phân loại */}
          <div className="bg-cinema-surface rounded-xl p-4 space-y-3 border border-cinema-border">
            <p className="text-white text-xs font-semibold uppercase tracking-wide">🏷️ Phân loại</p>
            {renderField("Thể loại (phân cách bằng dấu phẩy)", "genre", "text", false, "VD: Hành động, Phiêu lưu")}
            {renderField("Tags (phân cách bằng dấu phẩy)", "tags", "text", false, "VD: Marvel, Avengers...")}
            {isPreview ? (
              <div>
                <label className="text-cinema-muted text-xs mb-1 block cursor-pointer">Liên kết phim (Dự báo)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                  {MOVIES.map(m => {
                    const ids = Array.isArray(form.linkedMovieIds) 
                      ? form.linkedMovieIds 
                      : (typeof form.linkedMovieIds === 'string' ? form.linkedMovieIds.split(',').map(s => s.trim()).filter(Boolean) : []);
                    const checked = ids.includes(String(m.id)) || ids.includes(Number(m.id));
                    return (
                      <label key={m.id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                        checked ? 'bg-primary/15 border border-primary/30 text-primary' : 'bg-cinema-card border border-cinema-border text-cinema-muted hover:border-primary/30'
                      }`}>
                        <input type="checkbox" className="accent-yellow-400" checked={checked}
                          onChange={() => {
                            const cur = Array.isArray(form.linkedMovieIds) 
                              ? form.linkedMovieIds.map(String) 
                              : (typeof form.linkedMovieIds === 'string' ? form.linkedMovieIds.split(',').map(s => s.trim()).filter(Boolean) : []);
                            const next = checked ? cur.filter(x => x !== String(m.id)) : [...cur, String(m.id)];
                            f('linkedMovieIds', next);
                          }} />
                        <div>
                          <p className="font-bold truncate max-w-[120px]">{m.title}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div>
                <label className="text-cinema-muted text-xs mb-1 block cursor-pointer" htmlFor="linkedMovieId">Liên kết phim</label>
                <select id="linkedMovieId" className="input-field cursor-pointer w-full" value={form.linkedMovieId} onChange={e => {
                  const val = e.target.value;
                  const movie = MOVIES.find(m => m.id === +val);
                  if (movie) {
                    setForm(prev => ({ 
                      ...prev, 
                      linkedMovieId: val, 
                      tags: prev.tags ? prev.tags + ', ' + movie.title : movie.title, 
                      genre: movie.genre?.join(', ') || '' 
                    }));
                  } else {
                    f('linkedMovieId', val);
                  }
                }}>
                  <option value="">-- Không liên kết --</option>
                  {MOVIES.map(m => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Review-specific: 5 accordion sections */}
          {tab === 'review' && (
            <div className="bg-cinema-surface rounded-xl p-4 space-y-3 border border-cinema-border">
              <p className="text-white text-xs font-semibold uppercase tracking-wide">⭐ Nội dung Review</p>
              <div className="grid grid-cols-2 gap-3">
                {renderField("Điểm Kịch bản (0-10)", "ratingScreenplay", "number", false, "VD: 9.0")}
                {renderField("Điểm Diễn xuất (0-10)", "ratingActing", "number", false, "VD: 9.5")}
                {renderField("Điểm Kỹ thuật (0-10)", "ratingCine", "number", false, "VD: 10")}
                {renderField("Điểm Tổng thể (0-10)", "rating", "number", false, "VD: 9.1")}
              </div>
              <div>
                <label className="text-cinema-muted text-xs mb-1 block cursor-pointer" htmlFor="synopsis">📖 Tóm tắt phim</label>
                <textarea id="synopsis" className="input-field resize-none w-full" rows={3}
                  placeholder="Nội dung tóm tắt cốt truyện bộ phim..."
                  value={form.synopsis} onChange={e => f('synopsis', e.target.value)} />
              </div>
              <div>
                <label className="text-cinema-muted text-xs mb-1 block cursor-pointer" htmlFor="screenplay">✍️ Review kịch bản</label>
                <textarea id="screenplay" className="input-field resize-none w-full" rows={3}
                  placeholder="Nhận xét về kịch bản, cốt truyện, tình tiết..."
                  value={form.screenplay} onChange={e => f('screenplay', e.target.value)} />
              </div>
              <div>
                <label className="text-cinema-muted text-xs mb-1 block cursor-pointer" htmlFor="acting">🎭 Diễn xuất</label>
                <textarea id="acting" className="input-field resize-none w-full" rows={3}
                  placeholder="Đánh giá diễn xuất của các diễn viên chính..."
                  value={form.acting} onChange={e => f('acting', e.target.value)} />
              </div>
              <div>
                <label className="text-cinema-muted text-xs mb-1 block cursor-pointer" htmlFor="cinematography">🎬 Quay dựng &amp; Kỹ xảo</label>
                <textarea id="cinematography" className="input-field resize-none w-full" rows={3}
                  placeholder="Chất lượng hình ảnh, âm thanh, kỹ xảo, nhạc phim..."
                  value={form.cinematography} onChange={e => f('cinematography', e.target.value)} />
              </div>
              <div>
                <label className="text-cinema-muted text-xs mb-1 block cursor-pointer" htmlFor="conclusion">🏆 Nhận xét tổng kết</label>
                <textarea id="conclusion" className="input-field resize-none w-full" rows={3}
                  placeholder="Kết luận tổng hợp..."
                  value={form.conclusion} onChange={e => f('conclusion', e.target.value)} />
              </div>
            </div>
          )}

          {/* Preview-specific */}
          {isPreview && (
            <div className="bg-cinema-surface rounded-xl p-4 space-y-3 border border-cinema-border">
              <p className="text-white text-xs font-semibold uppercase tracking-wide">🔮 Dự Báo Phim</p>
              <div>
                <label className="text-cinema-muted text-xs mb-1 block cursor-pointer" htmlFor="previewContent">📰 Nội dung bài viết <span className="text-red-400">*</span></label>
                <textarea id="previewContent" className="input-field resize-none w-full" rows={8}
                  placeholder="Viết nội dung chi tiết bài dự báo: những phim sẽ ra mắt, đợt lễ này có gì hay, phân tích tình hình phim...\nHỗ trợ xuống dòng để sắp xếp nội dung."
                  value={form.previewContent} onChange={e => f('previewContent', e.target.value)} />
              </div>
            </div>
          )}

          {/* Promo-specific */}
          {isPromo && (
            <div className="bg-cinema-surface rounded-xl p-4 space-y-3 border border-cinema-border">
              <p className="text-white text-xs font-semibold uppercase tracking-wide">🎉 Khuyến Mãi</p>
              <div>
                <label className="text-cinema-muted text-xs mb-1 block cursor-pointer">Chọn Voucher áp dụng</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                  {VOUCHERS.map(v => {
                    const ids = Array.isArray(form.voucherIds) ? form.voucherIds : form.voucherIds.split(',').map(s => s.trim()).filter(Boolean);
                    const checked = ids.includes(v.id);
                    return (
                      <label key={v.id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                        checked ? 'bg-primary/15 border border-primary/30 text-primary' : 'bg-cinema-card border border-cinema-border text-cinema-muted hover:border-primary/30'
                      }`}>
                        <input type="checkbox" className="accent-yellow-400" checked={checked}
                          onChange={() => {
                            const cur = Array.isArray(form.voucherIds) ? form.voucherIds : form.voucherIds.split(',').map(s => s.trim()).filter(Boolean);
                            const next = checked ? cur.filter(x => x !== v.id) : [...cur, v.id];
                            f('voucherIds', next);
                          }} />
                        <div>
                          <p className="font-bold">{v.code}</p>
                          <p className="text-[10px] truncate max-w-[120px]">{v.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
              {renderField("Phần trăm giảm giá (%)", "discountPercent", "number", false, "VD: 20")}
              <div className="grid grid-cols-2 gap-3">
                {renderField("Hiệu lực từ", "validFrom", "date")}
                {renderField("Hết hạn", "validTo", "date")}
              </div>
              <div>
                <label className="text-cinema-muted text-xs mb-1 block cursor-pointer" htmlFor="promotionContent">Nội dung chi tiết chương trình</label>
                <textarea id="promotionContent" className="input-field resize-none w-full" rows={6}
                  placeholder="Mô tả chi tiết các ưu đãi, điều khoản, cách thức nhận..."
                  value={form.promotionContent} onChange={e => f('promotionContent', e.target.value)} />
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-cinema-dark border-t border-cinema-border px-6 py-4 flex gap-3">
          <button onClick={onClose} className="flex-1 btn-outline py-2.5 text-sm">Hủy</button>
          <button
            onClick={handleSave}
            disabled={!form.title.trim() || !form.excerpt.trim()}
            className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mode === 'create' ? '➕ Tạo bài viết' : '💾 Lưu thay đổi'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── ArticleRow ───────────────────────────────────────────────
function ArticleRow({ article, onEdit, onDelete, onTogglePublish }) {
  return (
    <div className="flex gap-3 items-start p-3 rounded-xl border border-cinema-border bg-cinema-dark hover:border-primary/30 transition-colors group">
      <img
        src={article.coverImage}
        alt={article.title}
        className="w-16 h-11 object-cover rounded-lg flex-shrink-0"
        onError={e => { e.target.src = 'https://placehold.co/80x56/1a1a2e/e5b85c?text=CB'; }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold line-clamp-1">{article.title}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-cinema-muted text-[11px]">✍️ {article.author}</span>
          <span className="text-cinema-muted text-[11px]">📅 {fmtDate(article.publishedAt)}</span>
          {article.rating && <span className="text-primary text-[11px] font-bold">⭐ {article.rating}/10</span>}
          {article.expectedRating && <span className="text-accent text-[11px]">🔮 Kỳ vọng {article.expectedRating}/10</span>}
          {article.discountPercent && <span className="text-green-400 text-[11px]">🎉 Giảm {article.discountPercent}%</span>}
        </div>
      </div>
      <div className="flex gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(article)}
          className="px-2 py-1 text-[11px] border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 rounded transition-colors">
          ✏️ Sửa
        </button>
        <button onClick={() => onTogglePublish(article.id)}
          className="px-2 py-1 text-[11px] border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 rounded transition-colors">
          {article.published === false ? '▶ Xuất bản' : '⏸ Ẩn'}
        </button>
        <button onClick={() => onDelete(article.id)}
          className="px-2 py-1 text-[11px] border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded transition-colors">
          🗑️
        </button>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────
export default function AdminNews() {
  const [activeTab, setActiveTab] = useState('review');
  const [articles, setArticles]   = useState(NEWS_ARTICLES.map(a => ({ ...a, published: true })));
  const [search, setSearch]       = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [modal, setModal]         = useState(null); // null | { mode, article }
  const searchRef                 = useRef(null);
  const { addNotification }       = useNotificationStore();

  const tabMeta = TABS.find(t => t.key === activeTab);

  // Suggestions
  const allSuggestions = useMemo(() => {
    const titles  = articles.map(a => a.title);
    const authors = [...new Set(articles.map(a => a.author))];
    const tags    = [...new Set(articles.flatMap(a => a.tags || []))];
    return [...titles, ...authors, ...tags];
  }, [articles]);

  const handleSearchChange = (val) => {
    setSearch(val);
    if (val.trim().length < 2) { setSuggestions([]); return; }
    setSuggestions(allSuggestions.filter(s => s.toLowerCase().includes(val.toLowerCase())).slice(0, 7));
  };

  useEffect(() => {
    const handler = e => { if (searchRef.current && !searchRef.current.contains(e.target)) setSuggestions([]); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Filtered list
  const filtered = useMemo(() => {
    return articles.filter(a => {
      const matchTab = a.category === tabMeta.category;
      const matchSearch = !search.trim() ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        (a.author || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase())) ||
        (a.excerpt || '').toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [articles, search, activeTab]);

  // Actions
  const handleSave = (data) => {
    setArticles(prev => {
      const idx = prev.findIndex(a => a.id === data.id);
      if (idx >= 0) return prev.map(a => a.id === data.id ? { ...a, ...data, published: a.published } : a);
      return [{ ...data, published: true }, ...prev];
    });
    addNotification({ title: 'Bài viết đã lưu', message: `"${data.title}" đã được lưu thành công.`, type: 'success', isAdmin: true });
  };

  const handleDelete = (id) => {
    const a = articles.find(x => x.id === id);
    setArticles(prev => prev.filter(x => x.id !== id));
    addNotification({ title: 'Đã xóa bài viết', message: `"${a?.title}" đã bị xóa.`, type: 'warn', isAdmin: true });
  };

  const handleTogglePublish = (id) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, published: !a.published } : a));
  };

  const stats = useMemo(() => {
    const tab = articles.filter(a => a.category === tabMeta.category);
    return { total: tab.length, published: tab.filter(a => a.published !== false).length };
  }, [articles, activeTab]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-white">Quản lý Tin Tức</h2>
          <p className="text-cinema-muted text-sm mt-0.5">Tạo và quản lý bài viết cho cả 3 mục tin tức</p>
        </div>
        <button
          onClick={() => setModal({ mode: 'create', article: null })}
          className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"
        >
          ➕ Tạo bài viết
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-cinema-surface rounded-xl p-1 border border-cinema-border">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSearch(''); setSuggestions([]); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key ? 'bg-cinema-card border border-cinema-border text-white shadow' : 'text-cinema-muted hover:text-white'
            }`}>
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-primary text-cinema-black' : 'bg-cinema-border text-cinema-muted'}`}>
              {articles.filter(a => a.category === tab.category).length}
            </span>
          </button>
        ))}
      </div>

      {/* Stats + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3">
          <div className="rounded-xl border border-cinema-border bg-cinema-surface px-4 py-2">
            <p className="font-bold text-white">{stats.total}</p>
            <p className="text-cinema-muted text-xs">Tổng bài</p>
          </div>
          <div className="rounded-xl border border-green-500/30 bg-green-500/5 px-4 py-2">
            <p className="font-bold text-green-400">{stats.published}</p>
            <p className="text-cinema-muted text-xs">Đã xuất bản</p>
          </div>
          <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 px-4 py-2">
            <p className="font-bold text-orange-400">{stats.total - stats.published}</p>
            <p className="text-cinema-muted text-xs">Đang ẩn</p>
          </div>
        </div>

        <div className="relative max-w-xs w-full sm:w-auto" ref={searchRef}>
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cinema-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="🔍 Tìm theo tiêu đề, tác giả, tag..."
            className="input-field pl-9 w-full"
          />
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute z-30 left-0 right-0 mt-1 bg-cinema-card border border-cinema-border rounded-xl shadow-lg overflow-hidden"
              >
                {suggestions.map(s => (
                  <li key={s}
                    onClick={() => { setSearch(s); setSuggestions([]); }}
                    className="px-4 py-2 text-sm text-cinema-text hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                  >{s}</li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Article list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-cinema-muted">
          <div className="text-4xl mb-3">{tabMeta.icon}</div>
          <p>Chưa có bài viết nào trong mục này</p>
          <button onClick={() => setModal({ mode: 'create', article: null })}
            className="btn-primary mt-4 px-6 py-2 text-sm">Tạo bài viết đầu tiên</button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(a => (
            <div key={a.id} className={a.published === false ? 'opacity-60' : ''}>
              <ArticleRow
                article={a}
                onEdit={(art) => setModal({ mode: 'edit', article: art })}
                onDelete={handleDelete}
                onTogglePublish={handleTogglePublish}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <ArticleModal
            mode={modal.mode}
            article={modal.article}
            tab={activeTab}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
