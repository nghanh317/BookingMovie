import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MOVIES, AGE_RATINGS } from '../../constants/mockData';

// ── Dữ liệu bổ sung cho chatbot ─────────────────────────────

const GENRE_KEYWORDS = {
  'Hành động': ['hành động', 'action', 'đánh nhau', 'chiến đấu', 'bom tấn', 'anh hùng', 'siêu anh hùng', 'superhero'],
  'Tình cảm': ['tình cảm', 'lãng mạn', 'romance', 'tình yêu', 'yêu', 'cảm động', 'buồn', 'khóc'],
  'Hài': ['hài', 'comedy', 'vui', 'cười', 'hài hước', 'buồn cười', 'giải trí'],
  'Kinh dị': ['kinh dị', 'horror', 'sợ', 'ma', 'rùng rợn', 'kinh hoàng', 'kinh sợ'],
  'Hoạt hình': ['hoạt hình', 'animation', 'cartoon', 'anime', 'trẻ em', 'con nít', 'gia đình'],
  'Khoa học viễn tưởng': ['khoa học', 'viễn tưởng', 'sci-fi', 'tương lai', 'robot', 'không gian', 'vũ trụ', 'alien'],
  'Drama': ['drama', 'cảm xúc', 'nghệ thuật', 'sâu sắc', 'ý nghĩa', 'tâm lý'],
  'Gia đình': ['gia đình', 'family', 'cả nhà', 'bé', 'trẻ', 'phụ huynh'],
  'Phiêu lưu': ['phiêu lưu', 'adventure', 'khám phá', 'hành trình', 'mạo hiểm'],
};

const AGE_RANGES = {
  'trẻ em':   { min: 0,  max: 12,  genres: ['Hoạt hình', 'Gia đình', 'Phiêu lưu'] },
  'teen':     { min: 13, max: 17,  genres: ['Hành động', 'Hoạt hình', 'Phiêu lưu', 'Khoa học viễn tưởng'] },
  'thanh niên': { min: 18, max: 30, genres: ['Hành động', 'Tình cảm', 'Hài', 'Khoa học viễn tưởng', 'Phiêu lưu'] },
  'trung niên': { min: 31, max: 50, genres: ['Drama', 'Tình cảm', 'Gia đình', 'Hài', 'Hành động'] },
  'người lớn tuổi': { min: 51, max: 100, genres: ['Drama', 'Tình cảm', 'Gia đình', 'Hài'] },
};

const GENDER_GENRE_BIAS = {
  'nam':  ['Hành động', 'Khoa học viễn tưởng', 'Phiêu lưu', 'Hài'],
  'nữ':   ['Tình cảm', 'Drama', 'Gia đình', 'Hài', 'Hoạt hình'],
  'khác': [],
};

// ── State machine cho hội thoại ──────────────────────────────

const STEPS = {
  GREETING: 'greeting',
  ASK_AGE: 'ask_age',
  ASK_GENDER: 'ask_gender',
  ASK_GENRE: 'ask_genre',
  SHOW_RESULTS: 'show_results',
  FOLLOW_UP: 'follow_up',
};

// ── Helpers ──────────────────────────────────────────────────

function parseAge(text) {
  const num = parseInt(text.replace(/[^0-9]/g, ''));
  if (!isNaN(num) && num >= 1 && num <= 100) return num;

  const lower = text.toLowerCase();
  if (lower.includes('trẻ em') || lower.includes('bé') || lower.includes('con nít')) return 8;
  if (lower.includes('teen') || lower.includes('thiếu niên')) return 15;
  if (lower.includes('thanh niên') || lower.includes('sinh viên') || lower.includes('trẻ')) return 22;
  if (lower.includes('trung niên') || lower.includes('lớn tuổi')) return 40;
  return null;
}

function parseGender(text) {
  const lower = text.toLowerCase();
  if (/\b(nam|con trai|anh|chàng)\b/.test(lower)) return 'nam';
  if (/\b(nữ|con gái|chị|nàng|cô)\b/.test(lower)) return 'nữ';
  return 'khác';
}

function parseGenres(text) {
  const lower = text.toLowerCase();
  const found = [];
  for (const [genre, keywords] of Object.entries(GENRE_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      found.push(genre);
    }
  }
  return found;
}

function getAgeRange(age) {
  if (age <= 12) return 'trẻ em';
  if (age <= 17) return 'teen';
  if (age <= 30) return 'thanh niên';
  if (age <= 50) return 'trung niên';
  return 'người lớn tuổi';
}

function getAgeRating(age) {
  if (age < 13) return ['P', 'K'];
  if (age < 16) return ['P', 'K', 'T13'];
  if (age < 18) return ['P', 'K', 'T13', 'T16'];
  return ['P', 'K', 'T13', 'T16', 'T18'];
}

function recommendMovies({ age, gender, preferredGenres }) {
  const ageRange = getAgeRange(age);
  const ageGenres = AGE_RANGES[ageRange]?.genres || [];
  const genderGenres = GENDER_GENRE_BIAS[gender] || [];
  const allowedRatings = getAgeRating(age);

  // Xây dựng điểm ưu tiên cho từng phim
  const scored = MOVIES.map((movie) => {
    let score = 0;

    // Lọc theo age rating
    if (!allowedRatings.includes(movie.ageRating)) return { movie, score: -1 };

    // Điểm từ thể loại yêu thích
    if (preferredGenres.length > 0) {
      const match = movie.genre.filter((g) => preferredGenres.includes(g)).length;
      score += match * 5;
    }

    // Điểm từ độ tuổi
    const ageMatch = movie.genre.filter((g) => ageGenres.includes(g)).length;
    score += ageMatch * 3;

    // Điểm từ giới tính
    const genderMatch = movie.genre.filter((g) => genderGenres.includes(g)).length;
    score += genderMatch * 2;

    // Điểm rating
    score += movie.rating * 0.5;

    // Ưu tiên phim đang chiếu
    if (movie.status === 'now_showing') score += 2;

    return { movie, score };
  });

  return scored
    .filter((s) => s.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.movie);
}

// ── Chatbot Message Types ────────────────────────────────────

function BotMessage({ text, movies, options, onOption }) {
  return (
    <div className="flex items-end gap-2 mb-3">
      {/* Bot avatar */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 mb-0.5">
        <span className="text-sm">🎬</span>
      </div>
      <div className="flex-1 max-w-[85%]">
        {text && (
          <div className="bg-cinema-surface border border-cinema-border rounded-2xl rounded-bl-md px-4 py-3 text-sm text-white leading-relaxed whitespace-pre-line">
            {text}
          </div>
        )}

        {/* Gợi ý phim */}
        {movies && movies.length > 0 && (
          <div className="mt-2 space-y-2">
            {movies.map((movie, i) => {
              const ageInfo = AGE_RATINGS[movie.ageRating];
              return (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-cinema-card border border-cinema-border rounded-xl p-3 flex gap-3 hover:border-primary/40 transition-colors"
                >
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-10 h-14 object-cover rounded-lg flex-shrink-0 border border-cinema-border"
                    onError={(e) => { e.target.src = `https://placehold.co/40x60/1E1E2C/A0A0B4`; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-white font-semibold text-xs line-clamp-1">{movie.title}</p>
                      <span className="text-primary text-xs font-bold">⭐{movie.rating}</span>
                      {ageInfo && <span className={`badge ${ageInfo.color} text-white text-[9px] font-bold`}>{ageInfo.label}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {movie.genre.slice(0, 2).map((g) => (
                        <span key={g} className="badge bg-cinema-surface border border-cinema-border text-cinema-muted text-[9px]">{g}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Link
                        to={`/movies/${movie.id}`}
                        className="text-primary text-[10px] hover:underline font-medium"
                      >
                        Xem chi tiết →
                      </Link>
                      {movie.status === 'now_showing' && (
                        <Link
                          to={`/booking/${movie.id}`}
                          className="text-accent text-[10px] hover:underline font-medium"
                        >
                          🎟 Đặt vé
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Quick reply options */}
        {options && options.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => onOption(opt)}
                className="px-3 py-1.5 rounded-full text-xs border border-primary/40 text-primary hover:bg-primary hover:text-cinema-black transition-all duration-150 font-medium"
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UserMessage({ text }) {
  return (
    <div className="flex justify-end mb-3">
      <div className="max-w-[75%] bg-primary/20 border border-primary/30 rounded-2xl rounded-br-md px-4 py-2.5 text-sm text-white">
        {text}
      </div>
    </div>
  );
}

// ── Main Chatbot Component ───────────────────────────────────

export default function MovieChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState(STEPS.GREETING);
  const [userInfo, setUserInfo] = useState({ age: null, gender: null, genres: [] });
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Khởi động chatbot
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        addBotMessage({
          text: 'Xin chào! 👋 Tôi là trợ lý tư vấn phim của CinemaBook.\n\nTôi sẽ giúp bạn tìm những bộ phim phù hợp nhất dựa trên sở thích cá nhân. Hãy bắt đầu nhé!',
          options: ['Bắt đầu tư vấn', 'Xem phim đang chiếu', 'Hủy'],
        });
        setStep(STEPS.GREETING);
      }, 300);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  const addBotMessage = (msgObj) => {
    setMessages((prev) => [...prev, { type: 'bot', ...msgObj }]);
  };

  const addUserMessage = (text) => {
    setMessages((prev) => [...prev, { type: 'user', text }]);
  };

  const simulateTyping = (callback, delay = 800) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const handleUserInput = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    addUserMessage(trimmed);
    setInput('');

    const lower = trimmed.toLowerCase();

    switch (step) {
      case STEPS.GREETING: {
        if (lower.includes('bắt đầu') || lower.includes('tư vấn') || lower.includes('ok') || lower.includes('được')) {
          simulateTyping(() => {
            addBotMessage({
              text: '✨ Tuyệt! Đầu tiên, bạn cho tôi biết **tuổi** của bạn nhé?\n\nVí dụ: "20 tuổi", "15", "40 tuổi"...',
              options: ['Dưới 13 tuổi', '13-17 tuổi', '18-30 tuổi', '31-50 tuổi', 'Trên 50 tuổi'],
            });
            setStep(STEPS.ASK_AGE);
          });
        } else if (lower.includes('đang chiếu') || lower.includes('xem phim')) {
          simulateTyping(() => {
            const nowShowing = MOVIES.filter((m) => m.status === 'now_showing');
            addBotMessage({
              text: '🎬 Đây là những phim đang chiếu hiện tại:',
              movies: nowShowing,
            });
            addBotMessage({
              text: 'Bạn có muốn tôi tư vấn phim phù hợp hơn với bạn không?',
              options: ['Tư vấn theo sở thích', 'Không, cảm ơn!'],
            });
            setStep(STEPS.FOLLOW_UP);
          });
        } else if (lower.includes('hủy') || lower.includes('thôi') || lower.includes('không')) {
          simulateTyping(() => {
            addBotMessage({ text: 'Không sao! Nếu cần tư vấn phim, bạn cứ nhắn tôi nhé. 😊' });
          }, 500);
        } else {
          simulateTyping(() => {
            addBotMessage({
              text: 'Bạn muốn tôi giúp gì nào? 🎬',
              options: ['Bắt đầu tư vấn', 'Xem phim đang chiếu'],
            });
          }, 500);
        }
        break;
      }

      case STEPS.ASK_AGE: {
        // Map quick reply options
        let ageText = trimmed;
        if (lower === 'dưới 13 tuổi') ageText = '10';
        if (lower === '13-17 tuổi') ageText = '15';
        if (lower === '18-30 tuổi') ageText = '22';
        if (lower === '31-50 tuổi') ageText = '40';
        if (lower === 'trên 50 tuổi') ageText = '55';

        const age = parseAge(ageText);
        if (!age) {
          simulateTyping(() => {
            addBotMessage({
              text: 'Bạn nhập lại tuổi giúp tôi nhé? Ví dụ: "20 tuổi" hoặc "25".',
              options: ['18-30 tuổi', '31-50 tuổi', 'Dưới 13 tuổi'],
            });
          }, 500);
          return;
        }

        setUserInfo((prev) => ({ ...prev, age }));
        simulateTyping(() => {
          addBotMessage({
            text: `Cảm ơn! Bạn ${age} tuổi rồi. 😊\n\nTiếp theo, bạn là **nam** hay **nữ**?`,
            options: ['Nam', 'Nữ', 'Không muốn nói'],
          });
          setStep(STEPS.ASK_GENDER);
        });
        break;
      }

      case STEPS.ASK_GENDER: {
        const gender = parseGender(lower.includes('không') ? 'khác' : trimmed);
        setUserInfo((prev) => ({ ...prev, gender }));

        simulateTyping(() => {
          addBotMessage({
            text: `Được rồi! Cuối cùng, bạn thích xem thể loại phim nào? (Chọn một hoặc nhiều)\n\nVí dụ: "hành động và tình cảm", "kinh dị", "hoạt hình gia đình"...`,
            options: ['Hành động', 'Tình cảm', 'Hài', 'Kinh dị', 'Hoạt hình', 'Sci-Fi', 'Tất cả đều ok'],
          });
          setStep(STEPS.ASK_GENRE);
        });
        break;
      }

      case STEPS.ASK_GENRE: {
        let genres = parseGenres(lower);
        if (lower.includes('tất cả') || lower.includes('all') || lower.includes('gì cũng')) {
          genres = [];
        }
        setUserInfo((prev) => ({ ...prev, genres }));

        simulateTyping(() => {
          const info = { ...userInfo, genres };
          const recommended = recommendMovies({ age: info.age, gender: info.gender, preferredGenres: genres });

          const genreText = genres.length > 0 ? genres.join(', ') : 'đa dạng thể loại';
          addBotMessage({
            text: `🎯 Dựa trên profile của bạn:\n• Tuổi: ${info.age}\n• Giới tính: ${info.gender || 'không xác định'}\n• Sở thích: ${genreText}\n\nĐây là những phim tôi gợi ý cho bạn:`,
            movies: recommended,
          });

          setTimeout(() => {
            addBotMessage({
              text: recommended.length > 0
                ? '✨ Hy vọng bạn sẽ tìm được phim ưng ý! Bạn có muốn tìm kiếm thêm không?'
                : '😔 Hiện tại chưa có phim phù hợp với bạn. Bạn có muốn thay đổi tiêu chí không?',
              options: ['Tìm lại với thể loại khác', 'Xem tất cả phim', 'Cảm ơn!'],
            });
            setStep(STEPS.FOLLOW_UP);
          }, 600);
        }, 1200);
        break;
      }

      case STEPS.FOLLOW_UP: {
        if (lower.includes('tìm lại') || lower.includes('thể loại khác') || lower.includes('tư vấn')) {
          simulateTyping(() => {
            addBotMessage({
              text: '🔄 Bạn muốn thay đổi thể loại phim? Cho tôi biết bạn thích gì nhé!',
              options: ['Hành động', 'Tình cảm', 'Hài', 'Kinh dị', 'Hoạt hình', 'Khoa học viễn tưởng'],
            });
            setStep(STEPS.ASK_GENRE);
          }, 500);
        } else if (lower.includes('tất cả phim') || lower.includes('xem phim')) {
          simulateTyping(() => {
            addBotMessage({
              text: '🎬 Bạn có thể xem tất cả phim tại trang Phim. Nhấn vào đây để khám phá!',
              options: ['Bắt đầu lại từ đầu', 'Đóng chat'],
            });
          }, 500);
        } else if (lower.includes('cảm ơn') || lower.includes('ok') || lower.includes('đóng')) {
          simulateTyping(() => {
            addBotMessage({
              text: '🎬 Chúc bạn xem phim vui vẻ! Nếu cần tư vấn thêm, tôi luôn sẵn sàng hỗ trợ nhé. 😊',
            });
          }, 500);
        } else if (lower.includes('đầu') || lower.includes('lại')) {
          // Reset
          setUserInfo({ age: null, gender: null, genres: [] });
          simulateTyping(() => {
            addBotMessage({
              text: '🔄 Bắt đầu lại nhé! Bạn cho tôi biết tuổi của bạn?',
              options: ['Dưới 13 tuổi', '13-17 tuổi', '18-30 tuổi', '31-50 tuổi', 'Trên 50 tuổi'],
            });
            setStep(STEPS.ASK_AGE);
          }, 500);
        } else {
          simulateTyping(() => {
            addBotMessage({
              text: 'Bạn muốn tôi làm gì tiếp theo? 😊',
              options: ['Tìm lại với thể loại khác', 'Bắt đầu lại từ đầu', 'Cảm ơn!'],
            });
          }, 500);
        }
        break;
      }

      default:
        break;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUserInput(input);
  };

  const handleReset = () => {
    setMessages([]);
    setStep(STEPS.GREETING);
    setUserInfo({ age: null, gender: null, genres: [] });
    setInput('');
    // Re-trigger greeting
    setTimeout(() => {
      addBotMessage({
        text: 'Xin chào! 👋 Tôi là trợ lý tư vấn phim của CinemaBook.\n\nTôi sẽ giúp bạn tìm những bộ phim phù hợp nhất dựa trên sở thích cá nhân. Hãy bắt đầu nhé!',
        options: ['Bắt đầu tư vấn', 'Xem phim đang chiếu'],
      });
    }, 100);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 flex items-center justify-center text-cinema-black transition-all duration-300"
        aria-label="Chatbot tư vấn phim"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-xl font-bold"
            >
              ✕
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-2xl"
            >
              🎬
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulse ring khi đóng */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-2xl animate-ping bg-primary/30 pointer-events-none" />
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-cinema-dark border border-cinema-border rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
            style={{ maxHeight: 'min(540px, calc(100vh - 7rem))' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cinema-surface to-cinema-card border-b border-cinema-border px-4 py-3 flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🎬</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-heading font-bold text-sm">CinemaBot</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-cinema-muted text-xs">Trợ lý tư vấn phim</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={handleReset}
                  className="p-1.5 rounded-lg text-cinema-muted hover:text-white hover:bg-cinema-surface transition-colors"
                  title="Bắt đầu lại"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-cinema-muted hover:text-white hover:bg-cinema-surface transition-colors"
                  title="Đóng"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-track-cinema-dark scrollbar-thumb-cinema-border">
              {messages.map((msg, i) =>
                msg.type === 'bot' ? (
                  <BotMessage
                    key={i}
                    text={msg.text}
                    movies={msg.movies}
                    options={msg.options}
                    onOption={(opt) => handleUserInput(opt)}
                  />
                ) : (
                  <UserMessage key={i} text={msg.text} />
                )
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-end gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">🎬</span>
                  </div>
                  <div className="bg-cinema-surface border border-cinema-border rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1.5 items-center">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                          className="w-2 h-2 rounded-full bg-cinema-muted block"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-cinema-border p-3 flex-shrink-0 bg-cinema-surface">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 bg-cinema-dark border border-cinema-border rounded-xl px-3 py-2 text-sm text-white placeholder-cinema-muted focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-cinema-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/80 transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
              <p className="text-cinema-muted text-[10px] text-center mt-2">
                Powered by CinemaBook AI · Tư vấn 24/7
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
