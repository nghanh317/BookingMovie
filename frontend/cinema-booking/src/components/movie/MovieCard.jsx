import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AGE_RATINGS } from '../../constants/mockData';

export default function MovieCard({ movie, index = 0 }) {
  const rating = movie.rating;
  const ratingColor =
    rating >= 8 ? 'text-green-400' :
    rating >= 6.5 ? 'text-primary' :
    'text-cinema-muted';

  const ageInfo = AGE_RATINGS[movie.ageRating];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative"
    >
      <div className="card overflow-hidden">
        {/* Poster */}
        <div className="relative overflow-hidden aspect-[2/3]">
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              e.target.src = `https://placehold.co/300x450/1E1E2C/A0A0B4?text=${encodeURIComponent(movie.title)}`;
            }}
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-cinema opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <Link
              to={`/booking/${movie.id}`}
              className="w-full btn-primary text-sm py-2 text-center"
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
          <span className={`absolute top-2 right-2 badge text-xs font-semibold ${
            movie.status === 'now_showing'
              ? 'bg-accent text-white'
              : 'bg-cinema-surface border border-cinema-border text-cinema-muted'
          }`}>
            {movie.status === 'now_showing' ? '● Đang chiếu' : '⏳ Sắp chiếu'}
          </span>
        </div>

        {/* Info */}
        <div className="p-3">
          <Link to={`/movies/${movie.id}`}>
            <h3 className="font-heading font-semibold text-white text-sm leading-tight truncate hover:text-primary transition-colors">
              {movie.title}
            </h3>
          </Link>

          {/* Genre tags */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {movie.genre.slice(0, 2).map((g) => (
              <span key={g} className="badge bg-cinema-surface border border-cinema-border text-cinema-muted text-[10px]">
                {g}
              </span>
            ))}
          </div>

          {/* Rating & Duration */}
          <div className="flex items-center justify-between mt-2">
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
