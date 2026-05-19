import { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const NEWS_ARTICLES = [
  {
    id: 1,
    title: 'Review Dune: Part Two – Bản anh hùng ca vũ trụ choáng ngợp nhất thập kỷ',
    slug: 'review-dune-part-two',
    excerpt:
      'Denis Villeneuve một lần nữa chứng minh tài năng bậc thầy khi đưa khán giả vào hành trình thám hiểm thế giới Arrakis đầy cát bụi và tráng lệ với quy mô sản xuất khổng lồ chưa từng thấy.',
    coverImage: 'https://image.tmdb.org/t/p/w1280/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
    category: 'Review phim',
    genre: ['Khoa học viễn tưởng', 'Sử thi'],
    rating: 9.1,
    author: 'Minh Tuấn',
    authorAvatar: 'MT',
    publishedAt: '2024-03-12',
    readTime: '8 phút đọc',
    tags: ['Dune', 'Denis Villeneuve', 'Timothée Chalamet', 'Zendaya'],
    linkedMovieId: 3,
  },
  {
    id: 2,
    title: 'Oppenheimer – Khi Nolan tái định nghĩa thể loại tiểu sử lịch sử',
    slug: 'review-oppenheimer',
    excerpt:
      'Ba tiếng đồng hồ không dư thừa một giây – Christopher Nolan đã kiến tạo nên một kiệt tác điện ảnh về người đàn ông tạo ra vũ khí hủy diệt hàng loạt đầu tiên của nhân loại.',
    coverImage: 'https://image.tmdb.org/t/p/w1280/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    category: 'Review phim',
    genre: ['Tiểu sử', 'Lịch sử', 'Kịch tính'],
    rating: 9.3,
    author: 'Thu Hằng',
    authorAvatar: 'TH',
    publishedAt: '2023-07-25',
    readTime: '10 phút đọc',
    tags: ['Oppenheimer', 'Nolan', 'Cillian Murphy', 'IMAX'],
    linkedMovieId: null,
  },
  {
    id: 3,
    title: 'Poor Things – Bữa tiệc thị giác kỳ quái và giải phóng nhất năm 2023',
    slug: 'review-poor-things',
    excerpt:
      'Yorgos Lanthimos đã tạo ra một bộ phim không thể phân loại – vừa dị biệt, vừa đẹp đến mê hồn, vừa thách thức mọi quy tắc xã hội với sự xuất sắc của Emma Stone.',
    coverImage: 'https://image.tmdb.org/t/p/w1280/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg',
    category: 'Review phim',
    genre: ['Kỳ ảo', 'Hài hước', 'Lãng mạn'],
    rating: 8.7,
    author: 'Phương Linh',
    authorAvatar: 'PL',
    publishedAt: '2024-01-15',
    readTime: '7 phút đọc',
    tags: ['Poor Things', 'Emma Stone', 'Cannes', 'Oscar'],
    linkedMovieId: null,
  },
  {
    id: 4,
    title: 'Avengers: Secret Wars – Kỷ nguyên mới của Marvel đã đến?',
    slug: 'preview-avengers-secret-wars',
    excerpt:
      'Mọi thứ từ Infinity Saga đến Multiverse Saga đã dẫn đến đây. Liệu bộ phim có thể cứu vãn "mệt mỏi siêu anh hùng" và lấy lại ngai vàng của Marvel?',
    coverImage: 'https://image.tmdb.org/t/p/w1280/9SSEUrSqhljBMzRe4aBTh17rUaC.jpg',
    category: 'Dự báo phim',
    genre: ['Siêu anh hùng', 'Hành động', 'Khoa học viễn tưởng'],
    rating: null,
    author: 'Văn Khoa',
    authorAvatar: 'VK',
    publishedAt: '2024-05-01',
    readTime: '6 phút đọc',
    tags: ['Avengers', 'Marvel', 'Secret Wars', 'MCU'],
    linkedMovieId: 1,
  },
  {
    id: 5,
    title: 'Godzilla x Kong: Ưu và nhược điểm của bom tấn đầu hè 2024',
    slug: 'review-godzilla-kong',
    excerpt:
      'Màn đấu giữa hai quái thú huyền thoại tiếp tục gây bão phòng vé. Hành động mãn nhãn nhưng cốt truyện vẫn là điểm yếu dai dẳng của thương hiệu MonsterVerse.',
    coverImage: 'https://image.tmdb.org/t/p/w1280/bQ2ywkchIGDtGys3cP5agtL0EBq.jpg',
    category: 'Review phim',
    genre: ['Quái vật', 'Hành động', 'Phiêu lưu'],
    rating: 7.4,
    author: 'Minh Tuấn',
    authorAvatar: 'MT',
    publishedAt: '2024-03-29',
    readTime: '5 phút đọc',
    tags: ['Godzilla', 'Kong', 'MonsterVerse', 'Bom tấn'],
    linkedMovieId: 2,
  },
  {
    id: 6,
    title: 'Killers of the Flower Moon – Di sản trầm hùng của Scorsese',
    slug: 'review-killers-flower-moon',
    excerpt:
      'Ở tuổi 80, Martin Scorsese vẫn chứng minh mình là đạo diễn vĩ đại nhất còn hoạt động với tuyệt phẩm 3.5 tiếng về tội ác được che giấu trong lịch sử người Mỹ bản địa.',
    coverImage: 'https://image.tmdb.org/t/p/w1280/dB6Krk806zeqd0YNp2ngQ9zXteH.jpg',
    category: 'Review phim',
    genre: ['Lịch sử', 'Tội phạm', 'Kịch tính'],
    rating: 8.9,
    author: 'Thu Hằng',
    authorAvatar: 'TH',
    publishedAt: '2023-10-20',
    readTime: '9 phút đọc',
    tags: ['Scorsese', 'DiCaprio', 'Oscar', 'Killers'],
    linkedMovieId: null,
  },
  {
    id: 7,
    title: '🎉 Siêu ưu đãi dịp lễ 30/4 – 1/5: Giảm đến 30% giá vé + tặng voucher độc quyền',
    slug: 'khuyen-mai-30-4',
    excerpt:
      'Chào mừng Ngày Giải Phóng Miền Nam và Ngày Quốc Tế Lao Động! CinemaBook tặng ngay voucher giảm giá và ưu đãi đặc biệt dành cho tất cả thành viên trong dịp nghỉ lễ vàng này.',
    coverImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&q=80',
    category: 'Khuyến mãi',
    genre: ['Ưu đãi', 'Dịp lễ'],
    rating: null,
    author: 'Ban Marketing',
    authorAvatar: 'BM',
    publishedAt: '2026-04-28',
    readTime: '3 phút đọc',
    tags: ['30/4', '1/5', 'Khuyến mãi', 'Voucher'],
    linkedMovieId: null,
    voucherIds: ['V001', 'V005'],
    promotionContent: `Nhân dịp kỷ niệm Ngày Giải Phóng Miền Nam (30/4) và Ngày Quốc Tế Lao Động (1/5), CinemaBook trân trọng gửi đến quý khán giả chương trình ưu đãi đặc biệt.\n\nƯu đãi 1 — Giảm 30% giá vé: Áp dụng cho tất cả suất chiếu từ 30/04 đến 02/05/2026. Tối đa giảm 100.000đ/giao dịch, đơn tối thiểu 100.000đ. Nhận mã WELCOME30 miễn phí bên dưới!\n\nƯu đãi 2 — Voucher Gold độc quyền: Giảm thêm 25% dành riêng cho thành viên Gold và Platinum. Đổi bằng 300 điểm thưởng — xem bên dưới để đổi ngay!\n\nĐiều khoản: Mỗi tài khoản sử dụng tối đa 1 lần/voucher. Không áp dụng cho vé đã đặt trước ngày 30/04. CinemaBook có quyền thay đổi điều khoản.`,
  },
  {
    id: 8,
    title: '☀️ Khuyến mãi mùa hè 2026: Giảm 20% & Combo bỏng nước miễn phí',
    slug: 'khuyen-mai-mua-he-2026',
    excerpt:
      'Mùa hè sôi động đã đến! Đặt vé xem phim tại CinemaBook từ tháng 6 đến tháng 7/2026 để nhận ngay ưu đãi giảm 20% cùng combo bỏng nước miễn phí cho hai người.',
    coverImage: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1280&q=80',
    category: 'Khuyến mãi',
    genre: ['Ưu đãi', 'Mùa hè'],
    rating: null,
    author: 'Ban Marketing',
    authorAvatar: 'BM',
    publishedAt: '2026-05-10',
    readTime: '3 phút đọc',
    tags: ['Mùa hè', 'Combo', 'Voucher', 'Giảm giá'],
    linkedMovieId: null,
    voucherIds: ['V002', 'V004'],
    promotionContent: `Hè về rồi! Hãy để CinemaBook làm cho mùa hè của bạn thêm phần sôi động và tiết kiệm.\n\nƯu đãi 1 — Giảm 20% tất cả vé phim: Áp dụng từ 01/06/2026 đến 31/07/2026. Tối đa giảm 80.000đ/giao dịch, đơn tối thiểu 150.000đ. Mã SUMMER20 — Nhận miễn phí ngay bên dưới!\n\nƯu đãi 2 — VIP50K giảm thêm 50.000đ: Dành cho thành viên từ hạng Silver trở lên. Đổi bằng 500 điểm thưởng. Có thể kết hợp cùng SUMMER20.\n\nCách tích điểm nhanh: Mỗi 10.000đ chi tiêu = 1 điểm. Chia sẻ ứng dụng = +50 điểm. Đánh giá phim sau khi xem = +10 điểm.`,
  },
];

const CATEGORIES = ['Tất cả', 'Review phim', 'Dự báo phim', 'Khuyến mãi'];

const categoryColor = {
  'Review phim': 'bg-primary/20 text-primary border-primary/30',
  'Dự báo phim': 'bg-accent/20 text-accent border-accent/30',
  'Khuyến mãi': 'bg-green-500/20 text-green-400 border-green-500/30',
};

function StarRating({ value }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < full ? 'text-primary' : i === full && half ? 'text-primary/60' : 'text-cinema-border'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ArticleCard({ article, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
    >
      <Link to={`/news/${article.id}`} className="group block h-full">
        <div className="h-full bg-cinema-card border border-cinema-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-card-hover transition-all duration-300 flex flex-col">
          {/* Cover */}
          <div className="relative overflow-hidden aspect-[16/9]">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={e => { e.target.src = 'https://via.placeholder.com/640x360/1a1a2e/e5b85c?text=CinemaBook'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cinema-black/80 via-transparent to-transparent" />
            {/* Category badge */}
            <span className={`absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm ${categoryColor[article.category] || 'bg-white/10 text-white border-white/20'}`}>
              {article.category}
            </span>
            {/* Rating */}
            {article.rating && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-cinema-black/70 backdrop-blur-sm px-2.5 py-1 rounded-full border border-cinema-border">
                <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-primary font-bold text-xs">{article.rating}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            {/* Genres */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {article.genre.slice(0, 2).map(g => (
                <span key={g} className="text-[10px] px-2 py-0.5 rounded-full bg-cinema-surface border border-cinema-border text-cinema-muted">
                  {g}
                </span>
              ))}
            </div>

            <h2 className="font-heading font-bold text-white text-base leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {article.title}
            </h2>
            <p className="text-cinema-muted text-sm leading-relaxed line-clamp-2 flex-1 mb-4">
              {article.excerpt}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-cinema-border/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-gold flex items-center justify-center text-cinema-black font-bold text-[10px]">
                  {article.authorAvatar}
                </div>
                <div>
                  <p className="text-white text-xs font-medium">{article.author}</p>
                  <p className="text-cinema-muted text-[10px]">{new Date(article.publishedAt).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
              <span className="text-cinema-muted text-[11px] flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {article.readTime}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function News() {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const searchRef = useRef(null);

  const allSuggestions = useMemo(() => {
    const titles = NEWS_ARTICLES.map(a => a.title);
    const tags   = [...new Set(NEWS_ARTICLES.flatMap(a => a.tags || []))];
    const authors = [...new Set(NEWS_ARTICLES.map(a => a.author))];
    return [...titles, ...tags, ...authors];
  }, []);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (val.trim().length < 2) { setSuggestions([]); return; }
    setSuggestions(allSuggestions.filter(s => s.toLowerCase().includes(val.toLowerCase())).slice(0, 6));
  };

  useEffect(() => {
    const handler = e => { if (searchRef.current && !searchRef.current.contains(e.target)) setSuggestions([]); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = NEWS_ARTICLES.filter(a => {
    const matchCat = activeCategory === 'Tất cả' || a.category === activeCategory;
    const matchSearch = !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = NEWS_ARTICLES[1]; // Oppenheimer as featured

  return (
    <div className="min-h-screen bg-cinema-black">
      {/* Hero Banner */}
      <div className="relative h-[420px] overflow-hidden">
        <img
          src={featured.coverImage}
          alt={featured.title}
          className="w-full h-full object-cover"
          onError={e => { e.target.src = 'https://via.placeholder.com/1280x420/1a1a2e/e5b85c?text=CinemaBook'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-black via-cinema-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border mb-4 ${categoryColor[featured.category]}`}>
              ✨ Bài viết nổi bật
            </span>
            <h1 className="font-heading font-bold text-white text-3xl md:text-4xl max-w-2xl leading-tight mb-3">
              {featured.title}
            </h1>
            <p className="text-cinema-muted max-w-xl leading-relaxed mb-5 text-sm">{featured.excerpt}</p>
            <div className="flex items-center gap-4">
              <Link
                to={`/news/${featured.id}`}
                className="btn-primary px-6 py-2.5 text-sm inline-flex items-center gap-2"
              >
                Đọc ngay
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <div className="flex items-center gap-2 text-cinema-muted text-sm">
                <StarRating value={featured.rating / 2} />
                <span className="font-bold text-primary">{featured.rating}/10</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Filter + Search bar */}
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
              >
                {cat}
              </button>
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
          <span className="text-cinema-muted text-sm">({filtered.length} bài)</span>
        </div>

        {filtered.length === 0 ? (
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
      </div>
    </div>
  );
}
