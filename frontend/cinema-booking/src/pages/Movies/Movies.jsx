import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GENRES } from '../../constants/mockData';
import MovieCard from '../../components/movie/MovieCard';
import movieService from '../../services/movieService';

export default function Movies() {
  const [searchParams] = useSearchParams();
  const [selectedGenre, setSelectedGenre] = useState('Tất cả');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');
  const [sortBy, setSortBy] = useState('rating');
  const [showAllGenres, setShowAllGenres] = useState(false);
  const genreContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // ── Gọi API lấy danh sách phim ───────────────────────────
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    movieService.getAll()
      .then((data) => { if (!cancelled) { setMovies(data); setError(null); } })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Đồng bộ selectedStatus khi URL thay đổi
  useEffect(() => {
    setSelectedStatus(searchParams.get('status') || 'all');
  }, [searchParams]);

  // Kiểm tra scroll buttons
  const checkScroll = () => {
    const el = genreContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scrollGenres = (dir) => {
    const el = genreContainerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 200, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  };

  const searchQuery = searchParams.get('search') || '';

  const filtered = useMemo(() => {
    let result = [...movies];

    if (searchQuery) {
      result = result.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(m.genre) && m.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }
    if (selectedStatus !== 'all') {
      result = result.filter(m => m.status === selectedStatus);
    }
    if (selectedGenre !== 'Tất cả') {
      result = result.filter(m => Array.isArray(m.genre) && m.genre.includes(selectedGenre));
    }
    if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'duration') result.sort((a, b) => b.duration - a.duration);
    else if (sortBy === 'title') result.sort((a, b) => a.title.localeCompare(b.title, 'vi'));

    return result;
  }, [movies, searchQuery, selectedStatus, selectedGenre, sortBy]);

  const statusTabs = [
    { value: 'all', label: 'Tất Cả' },
    { value: 'now_showing', label: '● Đang Chiếu' },
    { value: 'coming_soon', label: '⏳ Sắp Chiếu' },
  ];

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-cinema-surface border-b border-cinema-border py-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading font-extrabold text-4xl text-white mb-1"
          >
            {searchQuery ? `Kết quả: "${searchQuery}"` : 'Danh Sách Phim'}
          </motion.h1>
          <p className="text-cinema-muted">
            {loading ? 'Đang tải...' : `${filtered.length} phim được tìm thấy`}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Filters */}
        <div className="space-y-4 mb-8">
          {/* Row 1: Status Tabs + Sort */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            {/* Status Tabs */}
            <div className="flex gap-1 bg-cinema-surface rounded-lg p-1 border border-cinema-border flex-shrink-0">
              {statusTabs.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setSelectedStatus(tab.value)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    selectedStatus === tab.value
                      ? 'bg-primary text-cinema-black'
                      : 'text-cinema-muted hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="input-field text-sm py-2 cursor-pointer flex-shrink-0 w-auto"
            >
              <option value="rating">Sắp xếp: Đánh giá cao nhất</option>
              <option value="duration">Sắp xếp: Thời lượng</option>
              <option value="title">Sắp xếp: Tên A-Z</option>
            </select>
          </div>

          {/* Row 2: Genre filter - horizontal scroll với arrow buttons */}
          <div className="relative">
            <div className="flex items-center gap-2">
              {/* Arrow Left */}
              <button
                onClick={() => scrollGenres(-1)}
                className={`flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-200 ${
                  canScrollLeft
                    ? 'border-cinema-border text-cinema-muted hover:border-primary hover:text-primary bg-cinema-surface'
                    : 'border-cinema-border/30 text-cinema-border/30 bg-cinema-surface/30 cursor-not-allowed'
                }`}
                disabled={!canScrollLeft}
                aria-label="Scroll trái"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                </svg>
              </button>

              {/* Scrollable Genre Buttons */}
              <div
                ref={genreContainerRef}
                onScroll={checkScroll}
                className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth flex-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {GENRES.map(g => (
                  <button
                    key={g}
                    onClick={() => setSelectedGenre(g)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                      selectedGenre === g
                        ? 'bg-primary border-primary text-cinema-black'
                        : 'border-cinema-border text-cinema-muted hover:border-primary hover:text-primary'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              {/* Arrow Right */}
              <button
                onClick={() => scrollGenres(1)}
                className={`flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-200 ${
                  canScrollRight
                    ? 'border-cinema-border text-cinema-muted hover:border-primary hover:text-primary bg-cinema-surface'
                    : 'border-cinema-border/30 text-cinema-border/30 bg-cinema-surface/30 cursor-not-allowed'
                }`}
                disabled={!canScrollRight}
                aria-label="Scroll phải"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

            {/* Gradient fade edges */}
            <div className="absolute left-9 top-0 bottom-0 w-6 bg-gradient-to-r from-cinema-dark to-transparent pointer-events-none z-10" />
            <div className="absolute right-9 top-0 bottom-0 w-6 bg-gradient-to-l from-cinema-dark to-transparent pointer-events-none z-10" />
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-cinema-surface rounded-xl aspect-[2/3] mb-2" />
                <div className="h-3 bg-cinema-surface rounded w-3/4 mb-1" />
                <div className="h-3 bg-cinema-surface rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-red-400 text-lg font-semibold mb-2">Không thể tải danh sách phim</p>
            <p className="text-cinema-muted text-sm">{error}</p>
          </div>
        )}

        {/* Movie Grid */}
        {!loading && !error && (
          filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 items-start">
              {filtered.map((movie, i) => (
                <MovieCard key={movie.id} movie={movie} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-white text-xl font-heading font-bold mb-2">
                Không tìm thấy phim nào
              </h3>
              <p className="text-cinema-muted">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
