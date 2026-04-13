import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MOVIES, CINEMAS, SHOWTIMES, AGE_RATINGS } from '../../constants/mockData';
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

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating / 2 >= star;
        const half = !filled && rating / 2 >= star - 0.5;
        return (
          <svg key={star} className={`w-5 h-5 ${filled || half ? 'text-primary' : 'text-cinema-border'}`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
      })}
      <span className="text-white font-bold ml-1">{rating}</span>
      <span className="text-cinema-muted text-sm">/10</span>
    </div>
  );
}

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      try {
        // Thử lấy từ backend
        const { data } = await movieApi.getById(Number(id));
        const mapped = mapMovieDTO(data);
        setMovie(mapped);

        // Lấy phim tương tự
        try {
          const allRes = await movieApi.getAll({ page: 0, size: 50 });
          const allList = allRes.data.content || allRes.data.data || allRes.data;
          if (Array.isArray(allList)) {
            const allMapped = allList.map(mapMovieDTO);
            setRelatedMovies(
              allMapped.filter(m => m.id !== mapped.id && m.genre.some(g => mapped.genre.includes(g))).slice(0, 6)
            );
          }
        } catch {
          // fallback related from mock
          setRelatedMovies(MOVIES.filter(m => m.id !== mapped.id).slice(0, 6));
        }
      } catch (err) {
        console.warn('⚠️ Không lấy được phim từ backend, dùng mock:', err.message);
        // Fallback to mock
        const mockMovie = MOVIES.find(m => m.id === Number(id));
        setMovie(mockMovie || null);
        if (mockMovie) {
          setRelatedMovies(
            MOVIES.filter(m => m.id !== mockMovie.id && m.genre.some(g => mockMovie.genre.includes(g))).slice(0, 6)
          );
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-white text-2xl font-heading font-bold mb-2">Không tìm thấy phim</h2>
          <Link to="/movies" className="btn-primary mt-4 inline-block">Quay lại danh sách phim</Link>
        </div>
      </div>
    );
  }

  const ageInfo = AGE_RATINGS[movie.ageRating];

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Backdrop Hero */}
      <div className="relative h-[70vh] min-h-[450px] overflow-hidden">
        <img
          src={movie.backdrop}
          alt={movie.title}
          className="w-full h-full object-cover"
          onError={e => { e.target.src = `https://placehold.co/1920x1080/1A1A24/A0A0B4?text=${encodeURIComponent(movie.title)}`; }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-black via-cinema-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-black via-transparent to-transparent" />
      </div>

      {/* Movie Info Card - overlapping hero */}
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="relative -mt-48 z-10 flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0 mx-auto md:mx-0"
          >
            <div className="w-52 md:w-64 rounded-2xl overflow-hidden border-2 border-cinema-border shadow-card-hover">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full object-cover"
                onError={e => { e.target.src = `https://placehold.co/300x450/1E1E2C/A0A0B4?text=${encodeURIComponent(movie.title)}`; }}
              />
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 pb-8"
          >
            {/* Status & Age */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`badge text-white font-semibold text-xs ${movie.status === 'now_showing' ? 'bg-accent' : 'bg-cinema-surface border border-cinema-border text-cinema-muted'}`}>
                {movie.status === 'now_showing' ? '● Đang Chiếu' : '⏳ Sắp Chiếu'}
              </span>
              {ageInfo && (
                <span className={`badge ${ageInfo.color} text-white font-bold text-xs`}>{ageInfo.label}</span>
              )}
            </div>

            <h1 className="font-heading font-extrabold text-3xl md:text-5xl text-white leading-tight mb-1">
              {movie.title}
            </h1>
            <p className="text-cinema-muted text-sm mb-4">{movie.originalTitle}</p>

            <StarRating rating={movie.rating} />

            {/* Details grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
              {[
                { label: 'Thời lượng', value: `${movie.duration} phút` },
                { label: 'Ngôn ngữ', value: movie.language },
                { label: 'Khởi chiếu', value: movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('vi-VN') : 'N/A' },
                { label: 'Đạo diễn', value: movie.director },
              ].map(item => (
                <div key={item.label} className="bg-cinema-surface rounded-xl p-3 border border-cinema-border">
                  <p className="text-cinema-muted text-xs mb-1">{item.label}</p>
                  <p className="text-white font-semibold text-sm">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Genre tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genre.map(g => (
                <span key={g} className="badge bg-primary/10 border border-primary/30 text-primary text-xs">{g}</span>
              ))}
            </div>

            {/* Description */}
            <p className="text-cinema-muted leading-relaxed mb-6 max-w-xl">{movie.description}</p>

            {/* Cast */}
            {movie.cast.length > 0 && (
              <div className="mb-6">
                <p className="text-cinema-muted text-xs mb-1.5">Diễn viên</p>
                <p className="text-white text-sm">{movie.cast.join(' • ')}</p>
              </div>
            )}

            {/* CTA */}
            {movie.status === 'now_showing' ? (
              <div className="flex flex-wrap gap-3">
                <Link to={`/booking/${movie.id}`} className="btn-accent px-8 py-3">
                  🎟️ Đặt Vé Ngay
                </Link>
                {movie.trailer && (
                  <button
                    onClick={() => document.getElementById('trailer-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="btn-outline px-6 py-3 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    Xem Trailer
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3 items-center">
                <button className="btn-outline px-6 py-3 flex items-center gap-2">
                  🔔 Nhắc Tôi Khi Ra Mắt
                </button>
                {movie.trailer && (
                  <button
                    onClick={() => document.getElementById('trailer-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="btn-outline px-6 py-3 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    Xem Trailer
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Trailer Section */}
        {movie.trailer && (
          <section id="trailer-section" className="mt-16">
            <h2 className="section-title mb-6">Trailer</h2>
            <div className="rounded-2xl overflow-hidden border border-cinema-border aspect-video max-w-3xl">
              <iframe
                width="100%"
                height="100%"
                src={movie.trailer}
                title={`Trailer ${movie.title}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </section>
        )}

        {/* Related Movies */}
        {relatedMovies.length > 0 && (
          <section className="mt-16 mb-12">
            <div className="flex items-end justify-between mb-6">
              <h2 className="section-title">Phim Tương Tự</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedMovies.map((m, i) => (
                <MovieCard key={m.id} movie={m} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
