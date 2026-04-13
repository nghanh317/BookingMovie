import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOVIES } from '../../constants/mockData';

function MovieFormModal({ movie, onClose, onSave }) {
  const [form, setForm] = useState(movie || {
    title: '', originalTitle: '', rating: '', genre: [], duration: '',
    language: 'Tiếng Anh', releaseDate: '', director: '', description: '',
    ageRating: 'T13', status: 'coming_soon',
  });

  const GENRE_OPTIONS = ['Hành động','Tình cảm','Hài','Kinh dị','Hoạt hình','Khoa học viễn tưởng','Drama','Gia đình','Phiêu lưu'];

  const toggleGenre = (g) => {
    setForm(prev => ({
      ...prev,
      genre: prev.genre.includes(g) ? prev.genre.filter(x => x !== g) : [...prev.genre, g]
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-cinema-card border border-cinema-border rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-card-hover"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading font-bold text-white text-lg">
            {movie ? '✏️ Chỉnh sửa phim' : '➕ Thêm phim mới'}
          </h3>
          <button onClick={onClose} className="text-cinema-muted hover:text-white p-1">✕</button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-cinema-muted text-xs mb-1.5">Tên phim *</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                placeholder="Avengers: Secret Wars" className="input-field" />
            </div>
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Tên gốc</label>
              <input value={form.originalTitle || ''} onChange={e => setForm({...form, originalTitle: e.target.value})}
                className="input-field" />
            </div>
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Đạo diễn</label>
              <input value={form.director || ''} onChange={e => setForm({...form, director: e.target.value})}
                className="input-field" />
            </div>
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Thời lượng (phút)</label>
              <input type="number" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})}
                placeholder="120" className="input-field" />
            </div>
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Đánh giá (1-10)</label>
              <input type="number" step="0.1" min="0" max="10" value={form.rating} onChange={e => setForm({...form, rating: e.target.value})}
                placeholder="8.5" className="input-field" />
            </div>
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Ngày khởi chiếu</label>
              <input type="date" value={form.releaseDate} onChange={e => setForm({...form, releaseDate: e.target.value})}
                className="input-field" />
            </div>
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Ngôn ngữ</label>
              <select value={form.language} onChange={e => setForm({...form, language: e.target.value})} className="input-field cursor-pointer">
                <option>Tiếng Anh</option>
                <option>Tiếng Việt</option>
                <option>Tiếng Hàn</option>
              </select>
            </div>
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Xếp hạng tuổi</label>
              <select value={form.ageRating} onChange={e => setForm({...form, ageRating: e.target.value})} className="input-field cursor-pointer">
                {['P','K','T13','T16','T18'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Trạng thái</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-field cursor-pointer">
                <option value="now_showing">Đang chiếu</option>
                <option value="coming_soon">Sắp chiếu</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-cinema-muted text-xs mb-1.5">Thể loại</label>
              <div className="flex flex-wrap gap-2">
                {GENRE_OPTIONS.map(g => (
                  <button key={g} type="button" onClick={() => toggleGenre(g)}
                    className={`badge text-xs border transition-all cursor-pointer ${
                      form.genre.includes(g)
                        ? 'bg-primary border-primary text-cinema-black font-bold'
                        : 'border-cinema-border text-cinema-muted hover:border-primary hover:text-primary'
                    }`}
                  >{g}</button>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-cinema-muted text-xs mb-1.5">Mô tả</label>
              <textarea value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})}
                rows={3} placeholder="Nội dung phim..." className="input-field resize-none" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 btn-outline py-2.5 text-sm">Huỷ</button>
            <button onClick={() => { onSave(form); onClose(); }} className="flex-1 btn-primary py-2.5 text-sm">
              {movie ? 'Lưu thay đổi' : 'Thêm phim'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminMovies() {
  const [movies, setMovies] = useState(MOVIES);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [modal, setModal] = useState(null); // null | 'add' | movieObj
  const [deleteId, setDeleteId] = useState(null);

  const filtered = movies.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || m.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSave = (form) => {
    if (modal && modal !== 'add') {
      setMovies(prev => prev.map(m => m.id === modal.id ? { ...m, ...form } : m));
    } else {
      setMovies(prev => [...prev, { ...form, id: Date.now(), cast: [], poster: '', backdrop: '', trailer: '' }]);
    }
  };

  const handleDelete = (id) => {
    setMovies(prev => prev.filter(m => m.id !== id));
    setDeleteId(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-extrabold text-2xl text-white">Quản lý Phim</h2>
        <button onClick={() => setModal('add')} className="btn-primary text-sm px-4 py-2">
          ➕ Thêm phim mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Tìm kiếm phim..."
          className="input-field max-w-xs" />
        <div className="flex gap-1 bg-cinema-surface rounded-lg p-1 border border-cinema-border">
          {[{v:'all',l:'Tất cả'},{v:'now_showing',l:'Đang chiếu'},{v:'coming_soon',l:'Sắp chiếu'}].map(tab => (
            <button key={tab.v} onClick={() => setFilterStatus(tab.v)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filterStatus === tab.v ? 'bg-primary text-cinema-black' : 'text-cinema-muted hover:text-white'
              }`}>{tab.l}</button>
          ))}
        </div>
        <span className="text-cinema-muted text-sm self-center ml-auto">{filtered.length} phim</span>
      </div>

      {/* Table */}
      <div className="bg-cinema-surface rounded-xl border border-cinema-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cinema-border bg-cinema-dark">
                {['Phim', 'Thể loại', 'Thời lượng', 'Đánh giá', 'Độ tuổi', 'Trạng thái', 'Thao tác'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-cinema-muted text-xs font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cinema-border/50">
              {filtered.map(movie => (
                <motion.tr key={movie.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="hover:bg-cinema-card/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={movie.poster} alt={movie.title}
                        className="w-10 h-14 object-cover rounded flex-shrink-0"
                        onError={e => { e.target.src = 'https://placehold.co/50x70/1E1E2C/A0A0B4'; }} />
                      <div>
                        <p className="text-white text-sm font-medium leading-snug max-w-[160px] truncate">{movie.title}</p>
                        <p className="text-cinema-muted text-xs">{movie.director}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[120px]">
                      {movie.genre.slice(0,2).map(g => (
                        <span key={g} className="badge bg-cinema-card border border-cinema-border text-cinema-muted text-[10px]">{g}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-cinema-muted text-sm">{movie.duration} phút</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <span className="text-primary font-semibold text-sm">{movie.rating}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs font-bold ${
                      movie.ageRating === 'P' ? 'bg-green-500 text-white' :
                      movie.ageRating === 'K' ? 'bg-blue-500 text-white' :
                      movie.ageRating === 'T13' ? 'bg-yellow-500 text-black' :
                      movie.ageRating === 'T16' ? 'bg-orange-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>{movie.ageRating}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs font-semibold border ${
                      movie.status === 'now_showing'
                        ? 'bg-green-500/20 border-green-500/30 text-green-400'
                        : 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                    }`}>
                      {movie.status === 'now_showing' ? '● Đang chiếu' : '⏳ Sắp chiếu'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setModal(movie)}
                        className="px-2.5 py-1.5 rounded-lg bg-cinema-card border border-cinema-border text-cinema-muted hover:text-primary hover:border-primary text-xs transition-all">
                        ✏️
                      </button>
                      <button onClick={() => setDeleteId(movie.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-cinema-card border border-cinema-border text-cinema-muted hover:text-red-400 hover:border-red-400 text-xs transition-all">
                        🗑️
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movie Form Modal */}
      <AnimatePresence>
        {modal && (
          <MovieFormModal
            movie={modal === 'add' ? null : modal}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="bg-cinema-card border border-cinema-border rounded-2xl p-6 max-w-sm w-full text-center"
            >
              <div className="text-4xl mb-3">🗑️</div>
              <h3 className="font-heading font-bold text-white text-lg mb-2">Xác nhận xoá?</h3>
              <p className="text-cinema-muted text-sm mb-5">Thao tác này không thể hoàn tác.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 btn-outline text-sm py-2.5">Huỷ</button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors">
                  Xoá phim
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
