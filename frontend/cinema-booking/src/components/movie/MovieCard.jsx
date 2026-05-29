import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AGE_RATINGS } from '../../constants/mockData';
import useFavoriteStore from '../../store/favoriteStore';
import useNotificationStore from '../../store/notificationStore';
import api from '../../services/api';

export default function MovieCard({ movie, index = 0 }) {
  const { isFavorite, toggleFavorite } = useFavoriteStore();
  const { addNotification } = useNotificationStore();
  const favorite = isFavorite(movie.id);
  
  const [rating, setRating] = useState(movie.rating || 0);

  useEffect(() => {
    if (movie.id) {
      api.get('/v1/movie-reviews', { params: { movieId: movie.id, size: 100 } })
        .then(res => {
          let data = [];
          if (Array.isArray(res.data)) data = res.data;
          else if (Array.isArray(res.data?.data)) data = res.data.data;
          else if (Array.isArray(res.data?.content)) data = res.data.content;
          else if (Array.isArray(res.data?.data?.content)) data = res.data.data.content;

          if (data.length > 0) {
            const validRatings = data.map(r => r.rating).filter(r => typeof r === 'number' && r > 0);
            if (validRatings.length > 0) {
               const avg = validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length;
               setRating(avg);
            }
          }
        })
        .catch(err => {
          // Ignore error, keep default rating
        });
    }
  }, [movie.id]);

  const ratingColor =
    rating >= 4 ? 'text-green-400' :
    rating >= 3 ? 'text-primary' :
    'text-cinema-muted';


  const ageInfo = AGE_RATINGS[movie.ageRating];

  // Hiển thị tối đa 2 genre tags + badge "+N" nếu còn thừa
  const visibleGenres = movie.genre.slice(0, 2);
  const extraCount = movie.genre.length - 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative flex flex-col h-full"
    >
      <div className="card overflow-hidden flex flex-col h-full">
        {/* Poster */}
        <div className="relative overflow-hidden aspect-[2/3] flex-shrink-0">
          <Link to={`/movies/${movie.id}`} className="block w-full h-full">
            <img
              src={movie.poster || `https://placehold.co/300x450/1E1E2C/A0A0B4?text=${encodeURIComponent(movie.title)}`}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              onError={(e) => {
                e.target.src = `https://placehold.co/300x450/1E1E2C/A0A0B4?text=${encodeURIComponent(movie.title)}`;
              }}
            />
          </Link>

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-cinema opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 pointer-events-none">
            <Link
              to={`/booking/${movie.id}`}
              className="w-full btn-primary text-sm py-2 text-center pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              🎟️ Đặt Vé Ngay
            </Link>
          </div>

          {/* Age Rating Badge */}
          {ageInfo && (
            <span className={`absolute top-2 left-2 badge ${ageInfo.color} text-white font-bold text-xs`}>
              {ageInfo.label}
            </span>
          )}

          {/* Status Badge */}
          <span className={`absolute top-2 right-12 badge text-xs font-semibold shadow-sm ${
            movie.status === 'now_showing'
              ? 'bg-accent text-white'
              : 'bg-cinema-surface border border-cinema-border text-cinema-muted'
          }`}>
            {movie.status === 'now_showing' ? '● Đang chiếu' : '⏳ Sắp chiếu'}
          </span>

          {/* Favorite Heart Button */}
          <button
            onClick={(e) => { 
              e.preventDefault(); 
              e.stopPropagation(); 
              toggleFavorite(movie.id);
              if (!favorite) {
                addNotification({ type: 'success', title: 'Đã thêm vào yêu thích', message: `Đã thêm "${movie.title}" vào danh sách phim yêu thích.` });
              }
            }}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-cinema-black/60 backdrop-blur-md border border-cinema-border flex items-center justify-center transition-all duration-300 z-10 shadow-sm ${
              favorite ? 'text-red-500 border-red-500/30' : 'text-cinema-muted hover:text-white hover:border-cinema-muted/50'
            }`}
            aria-label="Thêm vào danh sách yêu thích"
          >
            <svg className={`w-4 h-4 ${favorite ? 'fill-current' : 'fill-none'} transition-transform ${favorite ? 'scale-110' : 'hover:scale-110'}`} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Info - flex-1 để đẩy nội dung xuống đáy đồng đều */}
        <div className="p-3 flex flex-col flex-1">
          <Link to={`/movies/${movie.id}`} className="block">
            <h3 className="font-heading font-semibold text-white text-sm leading-tight line-clamp-2 hover:text-primary transition-colors min-h-[2.5rem]">
              {movie.title}
            </h3>
          </Link>

          {/* Genre tags - tối đa 2 + badge "+N" */}
          <div className="flex flex-wrap gap-1 mt-1.5 min-h-[1.5rem]">
            {visibleGenres.map((g) => (
              <span key={g} className="badge bg-cinema-surface border border-cinema-border text-cinema-muted text-[10px]">
                {g}
              </span>
            ))}
            {extraCount > 0 && (
              <span className="badge bg-primary/10 border border-primary/30 text-primary text-[10px]">
                +{extraCount}
              </span>
            )}
          </div>

          {/* Rating & Duration - auto push to bottom */}
          <div className="flex items-center justify-between mt-auto pt-2">
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className={`text-sm font-semibold ${ratingColor}`}>{rating.toFixed(1)}</span>
            </div>
            <span className="text-cinema-muted text-xs flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth={2}/>
                <path strokeLinecap="round" strokeWidth={2} d="M12 6v6l4 2"/>
              </svg>
              {movie.duration} phút
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
