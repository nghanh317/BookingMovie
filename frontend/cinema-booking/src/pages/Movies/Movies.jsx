import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MOVIES, GENRES } from '../../constants/mockData';
import { movieApi } from '../../api';
import MovieCard from '../../components/movie/MovieCard';

/**
 * Chuyển đổi MovieDTO từ backend sang format frontend
 */
function mapMovieDTO(dto) {
  return {
    id: dto.id,
    title: dto.title || 'Không có tên',
    originalTitle: dto.title,
    poster: dto.posterUrl || `https://placehold.co/300x450/1E1E2C/A0A0B4?text=${encodeURIComponent(dto.title || 'Movie')}`,
    backdrop: dto.posterUrl || `https://placehold.co/1920x1080/1A1A24/A0A0B4?text=${encodeURIComponent(dto.title || 'Movie')}`,
    rating: 8.0,
    genre: dto.genre ? dto.genre.split(',').map(g => g.trim()) : ['Chưa phân loại'],
    duration: dto.duration || 0,
    language: dto.language || 'N/A',
    releaseDate: dto.releaseDate,
    director: dto.director || 'N/A',
    cast: dto.cast ? dto.cast.split(',').map(c => c.trim()) : [],
    description: dto.description || '',
    trailer: dto.trailerUrl || '',
    status: dto.status === 'NOW_SHOWING' ? 'now_showing' : dto.status === 'COMING_SOON' ? 'coming_soon' : (dto.status || 'now_showing').toLowerCase(),
    ageRating: 'T13',
  };
}

export default function Movies() {
  const [searchParams] = useSearchParams();
  const [selectedGenre, setSelectedGenre] = useState('Tất cả');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');
  const [movies, setMovies] = useState(MOVIES); // fallback: mock data
  const [loading, setLoading] = useState(true);

  // Fetch phim từ backend
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const { data } = await movieApi.getAll({ page: 0, size: 100 });
        const list = data.content || data.data || data;
        if (Array.isArray(list) && list.length > 0) {
          setMovies(list.map(mapMovieDTO));
        }
      } catch (err) {
        console.warn('⚠️ Không kết nối được backend, dùng mock data:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // Đồng bộ selectedStatus khi URL thay đổi (ví dụ: bấm navbar Đang Chiếu / Sắp Chiếu)
  useEffect(() => {
    setSelectedStatus(searchParams.get('status') || 'all');
  }, [searchParams]);
  const [sortBy, setSortBy] = useState('rating');
  const searchQuery = searchParams.get('search') || '';

  const filtered = useMemo(() => {
    let result = [...movies];

    if (searchQuery) {
      result = result.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    if (selectedStatus !== 'all') {
      result = result.filter(m => m.status === selectedStatus);
    }
    if (selectedGenre !== 'Tất cả') {
      result = result.filter(m => m.genre.includes(selectedGenre));
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
        <div className="flex flex-col md:flex-row gap-4 mb-8">
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

          {/* Genre Filter */}
          <div className="flex gap-2 flex-wrap">
            {GENRES.map(g => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                  selectedGenre === g
                    ? 'bg-primary border-primary text-cinema-black'
                    : 'border-cinema-border text-cinema-muted hover:border-primary hover:text-primary'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="ml-auto flex-shrink-0">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="input-field text-sm py-2 cursor-pointer"
            >
              <option value="rating">Sắp xếp: Đánh giá cao nhất</option>
              <option value="duration">Sắp xếp: Thời lượng</option>
              <option value="title">Sắp xếp: Tên A-Z</option>
            </select>
          </div>
        </div>

        {/* Movie Grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
        )}
      </div>
    </div>
  );
}
