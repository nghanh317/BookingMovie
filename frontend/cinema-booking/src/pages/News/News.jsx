import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import newsService from '../../services/newsService';

// ─── Helpers ────────────────────────────────────────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

function estimateReadTime(content) {
  if (!content) return '1 phút đọc';
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} phút đọc`;
}

// Lọc sạch các thẻ HTML và HTML-encoded, đặc biệt là thẻ category ẩn
export function getCleanExcerpt(content, length = 160) {
  if (!content) return '';
  let clean = content
    .replace(/&lt;span.*?&gt;\[.*?\]&lt;\/span&gt;/gi, '') // Xoá span ẩn bị encode
    .replace(/<span.*?>\[.*?\]<\/span>/gi, '')         // Xoá span ẩn bình thường
    .replace(/<[^>]*>/g, '')                           // Xoá HTML thông thường
    .replace(/&lt;[^&]*&gt;/gi, '')                    // Xoá HTML bị encode
    .trim();
  
  // Xoá nốt chuỗi text thô nếu còn sót ở đầu
  clean = clean.replace(/^\[(Tin tức|Review phim|Dự báo phim|Khuyến mãi)\]\s*/i, '');
  
  if (clean.length <= length) return clean;
  return clean.slice(0, length) + '...';
}

// Heuristic: phát hiện category từ nội dung tin
export function detectCategory(news) {
  const text = ((news.title || '') + ' ' + (news.content || '')).toLowerCase();
  if (text.includes('[khuyến mãi]') || text.includes('khuyến mãi') || text.includes('giảm giá') || text.includes('ưu đãi') || text.includes('voucher')) return 'Khuyến mãi';
  if (text.includes('[review phim]') || text.includes('review') || text.includes('đánh giá')) return 'Review phim';
  if (text.includes('[dự báo phim]') || text.includes('dự báo') || text.includes('ra mắt') || text.includes('sắp chiếu')) return 'Dự báo phim';
  return 'Tin tức';
}

export const categoryColor = {
  'Review phim': 'bg-primary/20 text-primary border-primary/30',
  'Dự báo phim': 'bg-accent/20 text-accent border-accent/30',
  'Khuyến mãi':  'bg-green-500/20 text-green-400 border-green-500/30',
  'Tin tức':     'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const CATEGORIES = ['Tất cả', 'Tin tức', 'Review phim', 'Dự báo phim', 'Khuyến mãi'];

// ─── Skeleton Card ───────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-cinema-card border border-cinema-border rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[16/9] bg-cinema-surface" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-cinema-surface rounded w-1/4" />
        <div className="h-4 bg-cinema-surface rounded w-3/4" />
        <div className="h-3 bg-cinema-surface rounded w-full" />
        <div className="h-3 bg-cinema-surface rounded w-2/3" />
      </div>
    </div>
  );
}

// ─── Article Card ────────────────────────────────────────────────────
function ArticleCard({ article, index }) {
  const category = detectCategory(article);
  const excerpt = getCleanExcerpt(article.content, 160);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link to={`/news/${article.id}`} className="group block h-full">
        <div className="h-full bg-cinema-card border border-cinema-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-card-hover transition-all duration-300 flex flex-col">
          {/* Cover */}
          <div className="relative overflow-hidden aspect-[16/9]">
            <img
              src={article.imageUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=640&q=80'}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=640&q=80'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cinema-black/80 via-transparent to-transparent" />
            <span className={`absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm ${categoryColor[category] || 'bg-white/10 text-white border-white/20'}`}>
              {category}
            </span>
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            <h2 className="font-heading font-bold text-white text-base leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {article.title}
            </h2>
            <p className="text-cinema-muted text-sm leading-relaxed line-clamp-2 flex-1 mb-4">
              {excerpt}
            </p>
            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-cinema-border/50">
              <p className="text-cinema-muted text-[10px]">📅 {fmtDate(article.createDate)}</p>
              <span className="text-cinema-muted text-[11px] flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {estimateReadTime(article.content)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────
export default function News() {
  const [articles, setArticles]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery]       = useState('');
  const [suggestions, setSuggestions]       = useState([]);

  // Pagination
  const [page, setPage]               = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const PAGE_SIZE = 12;

  const searchRef  = useRef(null);
  const debounceRef = useRef(null);

  // Fetch news
  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resData = await newsService.getAll({ page, size: PAGE_SIZE, sort: 'id,desc' });
      
      // Trích xuất an toàn bất kể backend bọc qua mấy lớp (ApiResponse)
      let content = [];
      let totalPages = 1;

      if (resData) {
        if (Array.isArray(resData)) {
          content = resData;
        } else if (resData.content && Array.isArray(resData.content)) {
          content = resData.content;
          totalPages = resData.totalPages || 1;
        } else if (resData.data) {
          if (Array.isArray(resData.data)) {
            content = resData.data;
          } else if (resData.data.content && Array.isArray(resData.data.content)) {
            content = resData.data.content;
            totalPages = resData.data.totalPages || 1;
          }
        }
      }

      setArticles(content);
      setTotalPages(totalPages);
    } catch {
      setError('Không thể tải tin tức. Vui lòng thử lại!');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchNews(); }, [fetchNews]);
  useEffect(() => { setPage(0); }, [activeCategory]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = e => { if (searchRef.current && !searchRef.current.contains(e.target)) setSuggestions([]); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (val.trim().length < 2) { setSuggestions([]); return; }
      setSuggestions(articles.map(a => a.title).filter(t => t.toLowerCase().includes(val.toLowerCase())).slice(0, 6));
    }, 300);
  };

  // Client-side filter: category + search
  const filtered = articles.filter(a => {
    if (a.isDeleted === true || a.isDeleted === 1 || a.isDeleted === 'true') return false;
    const cat = detectCategory(a);
    const matchCat = activeCategory === 'Tất cả' || cat === activeCategory;
    const matchSearch = !searchQuery ||
      (a.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = articles[0];

  return (
    <div className="min-h-screen bg-cinema-black">
      {/* Hero Banner */}
      <div className="relative h-[420px] overflow-hidden">
        {featured ? (
          <>
            <img
              src={featured.imageUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&q=80'}
              alt={featured.title}
              className="w-full h-full object-cover"
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&q=80'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cinema-black via-cinema-black/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-cinema-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 max-w-7xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border mb-4 ${categoryColor[detectCategory(featured)]}`}>
                  ✨ Bài viết mới nhất
                </span>
                <h1 className="font-heading font-bold text-white text-3xl md:text-4xl max-w-2xl leading-tight mb-3 line-clamp-2">
                  {featured.title}
                </h1>
                <p className="text-cinema-muted max-w-xl leading-relaxed mb-5 text-sm line-clamp-2">
                  {getCleanExcerpt(featured.content, 180)}
                </p>
                <Link to={`/news/${featured.id}`} className="btn-primary px-6 py-2.5 text-sm inline-flex items-center gap-2">
                  Đọc ngay
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </>
        ) : (
          // Loading hero
          <div className="absolute inset-0 bg-cinema-dark animate-pulse" />
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Filter + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-primary text-cinema-black border-primary'
                    : 'bg-cinema-surface text-cinema-muted border-cinema-border hover:border-primary/40 hover:text-primary'
                }`}
              >{cat}</button>
            ))}
          </div>
          <div className="relative" ref={searchRef}>
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cinema-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm bài viết..."
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              className="input-field pl-9 py-2 text-sm w-full sm:w-64"
            />
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="absolute z-30 left-0 right-0 mt-1 bg-cinema-card border border-cinema-border rounded-xl shadow-lg overflow-hidden"
                >
                  {suggestions.map(s => (
                    <li key={s}
                      onClick={() => { setSearchQuery(s); setSuggestions([]); }}
                      className="px-4 py-2 text-sm text-cinema-text hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                    >{s}</li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Section title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 bg-gradient-gold rounded-full" />
          <h2 className="font-heading font-bold text-white text-xl">
            {activeCategory === 'Tất cả' ? 'Tất cả bài viết' : activeCategory}
          </h2>
          {!loading && <span className="text-cinema-muted text-sm">({filtered.length} bài)</span>}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-6 flex items-center gap-2">
            ⚠️ {error}
            <button onClick={fetchNews} className="ml-auto underline text-xs">Thử lại</button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-cinema-muted">
            <span className="text-5xl block mb-4">📭</span>
            Không tìm thấy bài viết nào
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((article, i) => (
              <ArticleCard key={article.id} article={article} index={i} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 rounded-lg text-sm text-cinema-muted hover:text-white disabled:opacity-30 border border-cinema-border hover:border-primary/40 transition-all"
            >← Trước</button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const startPage = Math.max(0, Math.min(page - 2, totalPages - 5));
              const p = startPage + i;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${p === page ? 'bg-primary text-cinema-black' : 'text-cinema-muted hover:text-white border border-cinema-border hover:border-primary/40'}`}
                >{p + 1}</button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 rounded-lg text-sm text-cinema-muted hover:text-white disabled:opacity-30 border border-cinema-border hover:border-primary/40 transition-all"
            >Sau →</button>
          </div>
        )}
      </div>
    </div>
  );
}
