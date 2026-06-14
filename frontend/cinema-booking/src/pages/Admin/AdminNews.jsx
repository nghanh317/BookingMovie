import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOVIES, VOUCHERS } from '../../constants/mockData';
import useNotificationStore from '../../store/notificationStore';
import newsService from '../../services/newsService';
import movieService from '../../services/movieService';
import promotionService from '../../services/promotionService';

const TABS = [
  { key: 'news', label: 'Tin Tức', icon: '📰', category: 'Tin tức' }
];

const CATEGORY_COLOR = {
  'Review phim': 'bg-primary/20 text-primary border-primary/30',
  'Dự báo phim': 'bg-accent/20 text-accent border-accent/30',
  'Khuyến mãi':  'bg-green-500/20 text-green-400 border-green-500/30',
  'Tin tức':     'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

function formatDateForInput(dateVal) {
  if (!dateVal) return '';
  if (typeof dateVal === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) return dateVal;
    if (dateVal.includes('T')) return dateVal.split('T')[0];
    const match = dateVal.match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
    if (match) {
      const [_, d, m, y] = match;
      return `${y}-${m}-${d}`;
    }
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  } else if (Array.isArray(dateVal)) {
    const y = dateVal[0];
    const m = String(dateVal[1] || 1).padStart(2, '0');
    const d = String(dateVal[2] || 1).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return '';
}

function fmtDate(dateStr) {
  if (!dateStr) return '';
  let date = new Date(dateStr);
  if (typeof dateStr === 'string' && /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/.test(dateStr)) {
    const [dPart, tPart] = dateStr.split(' ');
    const [d, m, y] = dPart.split('-');
    date = new Date(`${y}-${m}-${d}T${tPart}`);
  } else if (Array.isArray(dateStr)) {
    date = new Date(dateStr[0], (dateStr[1]||1)-1, dateStr[2]||1, dateStr[3]||0, dateStr[4]||0, dateStr[5]||0);
  }
  if (isNaN(date.getTime())) return dateStr;
  
  const time = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const day = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return `${time} | ${day}`;
}

// ── Modal tạo/sửa bài viết ───────────────────────────────────
function ArticleModal({ mode, article, tab, onClose, onSave, dbMovies = [], dbPromotions = [] }) {
  const isPreview = false;

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    title:            article?.title         || '',
    excerpt:          article?.excerpt       || '',
    coverImage:       article?.coverImage    || '',
    bannerImage:      article?.bannerImage   || '',
    author:           article?.author        || 'Admin',
    authorAvatar:     article?.authorAvatar  || 'AD',
    publishedAt:      formatDateForInput(article?.publishedAt) || today,
    readTime:         article?.readTime      || '5 phút đọc',
    genre:            article?.genre?.join(', ') || '',
    tags:             article?.tags?.join(', ')  || '',
    content:          article?.content       || '',
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
      category:    'Tin tức',
      genre:       form.genre.split(',').map(s => s.trim()).filter(Boolean),
      author:      form.author,
      authorAvatar: form.authorAvatar,
      publishedAt: form.publishedAt,
      readTime:    form.readTime,
      tags:        form.tags.split(',').map(s => s.trim()).filter(Boolean),
      linkedMovieId: form.linkedMovieId ? +form.linkedMovieId : null,
      content:     form.content,
    });
    onClose();
  };

  const renderField = (label, fieldKey, type='text', required=false, placeholder='') => {
    if (type === 'date') {
      let displayVal = form[fieldKey] || '';
      if (displayVal && /^\d{4}-\d{2}-\d{2}$/.test(displayVal)) {
        const [y, m, d] = displayVal.split('-');
        displayVal = `${d}/${m}/${y}`;
      }
      return (
        <div key={fieldKey}>
          <label className="text-cinema-muted text-xs mb-1 block cursor-pointer" htmlFor={`field-${fieldKey}`}>
            {label}{required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
          <div className="relative">
            <input
              type="text"
              className="input-field w-full cursor-pointer pr-10"
              placeholder="dd/mm/yyyy"
              value={displayVal}
              readOnly
            />
            <input
              id={`field-${fieldKey}`}
              type="date"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              value={form[fieldKey] || ''}
              onChange={e => f(fieldKey, e.target.value)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-cinema-muted">
              📅
            </span>
          </div>
        </div>
      );
    }

    return (
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
  };

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
                  {dbMovies.map(m => {
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
                  const movie = dbMovies.find(m => m.id === +val);
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
                  {dbMovies.map(m => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Nội dung bài viết chung */}
          <div className="bg-cinema-surface rounded-xl p-4 space-y-3 border border-cinema-border">
            <p className="text-white text-xs font-semibold uppercase tracking-wide">📰 Nội dung bài viết</p>
            <div>
              <label className="text-cinema-muted text-xs mb-1 block cursor-pointer" htmlFor="content">Nội dung chi tiết <span className="text-red-400">*</span></label>
              <textarea id="content" className="input-field resize-none w-full" rows={15}
                placeholder="Nhập nội dung bài viết tin tức tại đây..."
                value={form.content} onChange={e => f('content', e.target.value)} />
            </div>
          </div>
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
        </div>
      </div>
      <div className="flex gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(article)}
          className="px-2 py-1 text-[11px] border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 rounded transition-colors">
          ✏️ Sửa
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
  const [articles, setArticles]   = useState([]);
  const [dbMovies, setDbMovies]   = useState([]);
  const [dbPromotions, setDbPromotions] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [modal, setModal]         = useState(null); // null | { mode, article }
  const searchRef                 = useRef(null);
  const { addNotification }       = useNotificationStore();

  // Fetch news từ API
  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const resData = await newsService.getAll({ page: 0, size: 200, sort: 'id,desc' });
      
      let rawContent = [];
      if (resData) {
        if (Array.isArray(resData)) rawContent = resData;
        else if (resData.content && Array.isArray(resData.content)) rawContent = resData.content;
        else if (resData.data) {
          if (Array.isArray(resData.data)) rawContent = resData.data;
          else if (resData.data.content && Array.isArray(resData.data.content)) rawContent = resData.data.content;
        }
      }

      // Lọc bỏ các bài viết đã bị xóa mềm từ backend
      const activeContent = rawContent.filter(n => !n.isDeleted);

      // Map sang format dùng trong Admin (thêm field published)
      setArticles(activeContent.map(n => ({
        ...n,
        title: (n.title || '')
                 .replace(/&lt;span.*?&gt;\[.*?\]&lt;\/span&gt;/gi, '')
                 .replace(/<span.*?>\[.*?\]<\/span>/gi, '')
                 .replace(/<[^>]*>/g, '')
                 .replace(/&lt;[^&]*&gt;/gi, '')
                 .replace(/^\[(Tin tức|Review phim|Dự báo phim|Khuyến mãi)\]\s*/i, '')
                 .trim(),
        published: !n.isDeleted,
        // map fields cho ArticleRow
        coverImage: n.imageUrl || '',
        excerpt:    (n.content || '')
                      .replace(/&lt;span.*?&gt;\[.*?\]&lt;\/span&gt;/gi, '')
                      .replace(/<span.*?>\[.*?\]<\/span>/gi, '')
                      .replace(/<[^>]*>/g, '')
                      .replace(/&lt;[^&]*&gt;/gi, '')
                      .replace(/^\[(Tin tức|Review phim|Dự báo phim|Khuyến mãi)\]\s*/i, '')
                      .slice(0, 120),
        author:     'Admin',
        authorAvatar: 'AD',
        publishedAt: n.createDate,
        category:   detectCategory(n),
        tags: [],
        rating: null,
      })));
    } catch {
      addNotification({ title: 'Lỗi', message: 'Không thể tải danh sách tin tức.', type: 'error', isAdmin: true });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMovies = useCallback(async () => {
    try {
      const data = await movieService.getAll();
      setDbMovies(data || []);
    } catch {
      console.error("Lỗi lấy danh sách phim cho tin tức");
    }
  }, []);

  const fetchPromotions = useCallback(async () => {
    try {
      const data = await promotionService.getAll({ size: 200, sort: 'id,desc' });
      let rawContent = [];
      if (data) {
        if (Array.isArray(data)) rawContent = data;
        else if (data.content && Array.isArray(data.content)) rawContent = data.content;
        else if (data.data) {
          if (Array.isArray(data.data)) rawContent = data.data;
          else if (data.data.content && Array.isArray(data.data.content)) rawContent = data.data.content;
        }
      }
      setDbPromotions(rawContent);
    } catch {
      console.error("Lỗi lấy danh sách promotion cho tin tức");
    }
  }, []);

  useEffect(() => { fetchNews(); fetchMovies(); fetchPromotions(); }, [fetchNews, fetchMovies, fetchPromotions]);

  // Heuristic category detect (đồng bộ với News.jsx)
  function detectCategory(news) {
    const text = ((news.title || '') + ' ' + (news.content || '')).toLowerCase();
    if (text.includes('[khuyến mãi]') || text.includes('khuyến mãi') || text.includes('giảm giá') || text.includes('ưu đãi') || text.includes('voucher')) return 'Khuyến mãi';
    if (text.includes('[review phim]') || text.includes('review') || text.includes('đánh giá')) return 'Review phim';
    if (text.includes('[dự báo phim]') || text.includes('dự báo') || text.includes('ra mắt') || text.includes('sắp chiếu')) return 'Dự báo phim';
    return 'Tin tức';
  }

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
      const matchSearch = !search.trim() ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        (a.author || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase())) ||
        (a.excerpt || '').toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [articles, search]);

  // Actions — kết nối API
  const handleSave = async (data) => {
    try {
      // Gắn thẻ category ẩn để backend lưu và frontend detect lại chính xác
      const contentStr = data.excerpt || data.content || '';
      const hiddenCategory = `<span style="display:none">[${data.category}]</span>`;
      const finalContent = contentStr.includes(`[${data.category}]`) ? contentStr : hiddenCategory + contentStr;

      const payload = { title: data.title, content: finalContent, imageUrl: data.coverImage || '' };
      
      if (data.id && articles.find(a => a.id === data.id)) {
        // Update
        await newsService.update(data.id, payload);
        setArticles(prev => prev.map(a => a.id === data.id ? { ...a, ...data, excerpt: data.excerpt, category: data.category, published: a.published } : a));
      } else {
        // Create
        const res = await newsService.create(payload);
        const createdNews = res?.data || res;
        
        // Thêm trực tiếp vào UI state để hiện ngay lập tức
        setArticles(prev => [{
           id: createdNews?.id || Date.now(),
           title: data.title,
           coverImage: data.coverImage || '',
           excerpt: data.excerpt,
           author: data.author || 'Admin',
           authorAvatar: data.authorAvatar || 'AD',
           publishedAt: new Date().toISOString(),
           category: data.category,
           published: true,
           tags: data.tags || [],
           rating: data.rating || null,
           expectedRating: data.expectedRating || null,
           discountPercent: data.discountPercent || null
        }, ...prev]);
      }
      addNotification({ title: 'Bài viết đã lưu', message: `"${data.title}" đã được lưu thành công.`, type: 'success', isAdmin: true });
    } catch {
      addNotification({ title: 'Lỗi lưu bài viết', message: 'Không thể lưu. Vui lòng thử lại!', type: 'error', isAdmin: true });
    }
  };

  const handleDelete = async (id) => {
    const a = articles.find(x => x.id === id);
    try {
      await newsService.remove(id);
      setArticles(prev => prev.filter(x => x.id !== id));
      addNotification({ title: 'Đã xóa bài viết', message: `"${a?.title}" đã bị xóa.`, type: 'warn', isAdmin: true });
    } catch {
      addNotification({ title: 'Lỗi', message: 'Không thể xóa bài viết.', type: 'error', isAdmin: true });
    }
  };

  // Không sử dụng Toggle Publish nữa

  const stats = useMemo(() => {
    return { total: articles.length, published: articles.filter(a => a.published !== false).length };
  }, [articles]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-white">Quản lý Tin Tức</h2>
        </div>
        <button
          onClick={() => setModal({ mode: 'create', article: null })}
          className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"
        >
          ➕ Tạo bài viết
        </button>
      </div>

      {/* Đã gộp thành 1 phần quản lý chung */}

      {/* Stats + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3">
          <div className="rounded-xl border border-cinema-border bg-cinema-surface px-4 py-2">
            <p className="font-bold text-white">{stats.total}</p>
            <p className="text-cinema-muted text-xs">Tổng bài viết</p>
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
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-cinema-surface rounded-xl animate-pulse border border-cinema-border" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-cinema-muted">
          <div className="text-4xl mb-3">{tabMeta.icon}</div>
          <p>Chưa có bài viết nào trong mục này</p>
          <button onClick={() => setModal({ mode: 'create', article: null })}
            className="btn-primary mt-4 px-6 py-2 text-sm">Tạo bài viết đầu tiên</button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(a => (
            <div key={a.id}>
              <ArticleRow
                article={a}
                onEdit={(art) => setModal({ mode: 'edit', article: art })}
                onDelete={handleDelete}
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
            dbMovies={dbMovies}
            dbPromotions={dbPromotions}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
