import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import newsService from '../../services/newsService';
import { detectCategory, categoryColor } from './News';

// ─── Helpers ─────────────────────────────────────────────────────────
function fmtDateLong(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' });
}

function estimateReadTime(content) {
  if (!content) return '1 phút đọc';
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return `${Math.max(1, Math.ceil(words / 200))} phút đọc`;
}

// ─── Skeleton ────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-cinema-black">
      <div className="h-[400px] bg-cinema-dark animate-pulse" />
      <div className="max-w-4xl mx-auto px-4 -mt-24 relative z-10 pb-20">
        <div className="bg-cinema-card border border-cinema-border rounded-2xl p-6 mb-6 animate-pulse space-y-4">
          <div className="h-4 bg-cinema-surface rounded w-1/5" />
          <div className="h-7 bg-cinema-surface rounded w-3/4" />
          <div className="h-4 bg-cinema-surface rounded w-full" />
          <div className="h-4 bg-cinema-surface rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────
export default function NewsDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await newsService.getById(id);
        if (!cancelled) setArticle(data);
      } catch {
        if (!cancelled) setError('Không thể tải bài viết. Vui lòng thử lại!');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchDetail();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <DetailSkeleton />;

  if (error || !article) {
    return (
      <div className="min-h-screen bg-cinema-black flex items-center justify-center text-cinema-muted text-center">
        <div>
          <span className="text-5xl block mb-4">🔍</span>
          <p className="text-lg font-semibold text-white mb-2">{error || 'Không tìm thấy bài viết'}</p>
          <Link to="/news" className="btn-primary px-5 py-2 text-sm">Quay lại Tin tức</Link>
        </div>
      </div>
    );
  }

  const category = detectCategory(article);
  const catCls   = categoryColor[category] || 'bg-white/10 text-white border-white/20';

  // Render content: nếu có HTML tag thì dùng dangerouslySetInnerHTML, nếu plain text thì wrap
  const hasHtml = /<[a-z][\s\S]*>/i.test(article.content || '');

  return (
    <div className="min-h-screen bg-cinema-black">
      {/* Hero */}
      <div className="relative h-[400px] overflow-hidden">
        <img
          src={article.imageUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&q=80'}
          alt={article.title}
          className="w-full h-full object-cover"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&q=80'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-black via-cinema-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-black/70 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-24 relative z-10 pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-cinema-muted mb-4">
          <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link to="/news" className="hover:text-primary transition-colors">Tin tức</Link>
          <span>/</span>
          <span className="text-white truncate max-w-xs">{article.title}</span>
        </div>

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-cinema-card border border-cinema-border rounded-2xl p-6 mb-6 shadow-card-hover"
        >
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${catCls}`}>
              {category}
            </span>
          </div>

          <h1 className="font-heading font-bold text-white text-2xl md:text-3xl leading-tight mb-4">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-5 pt-4 border-t border-cinema-border text-cinema-muted text-xs">
            <span>📅 {fmtDateLong(article.createDate)}</span>
            <span>⏱ {estimateReadTime(article.content)}</span>
            {article.updateDate && article.updateDate !== article.createDate && (
              <span className="ml-auto">Cập nhật: {fmtDateLong(article.updateDate)}</span>
            )}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-cinema-card border border-cinema-border rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 bg-gradient-gold rounded-full" />
            <h2 className="font-heading font-bold text-white text-lg">Nội dung</h2>
          </div>

          {hasHtml ? (
            <div
              className="prose prose-invert prose-sm max-w-none text-cinema-muted leading-relaxed
                prose-headings:text-white prose-headings:font-heading
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-white prose-img:rounded-xl prose-img:my-4"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <div className="text-cinema-muted text-sm leading-relaxed whitespace-pre-line">
              {article.content}
            </div>
          )}
        </motion.div>

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
