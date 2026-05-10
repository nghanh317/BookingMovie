import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AGE_RATINGS } from '../../constants/mockData';
import { movieService, chatbotService } from '../../services';

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
                      <span className="text-primary text-xs font-bold">⭐{movie.rating || 0}</span>
                      {ageInfo && <span className={`badge ${ageInfo.color} text-white text-[9px] font-bold`}>{ageInfo.label}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {movie.genre && movie.genre.slice(0, 2).map((g) => (
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
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Khởi động chatbot
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        addBotMessage({
          text: 'Xin chào! 👋 Tôi là trợ lý AI của CinemaBook. Tôi có thể giúp bạn tìm phim, xem lịch chiếu và giải đáp các thắc mắc về dịch vụ. Bạn muốn hỏi gì nào?',
        });
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

  const handleUserInput = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    addUserMessage(trimmed);
    setInput('');
    setIsTyping(true);

    try {
      // Gọi API AI thật từ backend
      const res = await chatbotService.chat(trimmed);
      const botResponse = res?.response || res || "Xin lỗi, tôi không thể trả lời lúc này.";
      
      addBotMessage({
        text: botResponse
      });
    } catch (err) {
      console.error('[MovieChatbot] AI Chat error:', err);
      addBotMessage({
        text: 'Rất tiếc, đã có lỗi xảy ra khi kết nối với máy chủ AI. Bạn vui lòng thử lại sau nhé!'
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUserInput(input);
  };

  const handleReset = () => {
    setMessages([]);
    setInput('');
    setTimeout(() => {
      addBotMessage({
        text: 'Xin chào! 👋 Tôi là trợ lý AI của CinemaBook. Tôi có thể giúp bạn tìm phim, xem lịch chiếu và giải đáp các thắc mắc về dịch vụ. Bạn muốn hỏi gì nào?',
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
