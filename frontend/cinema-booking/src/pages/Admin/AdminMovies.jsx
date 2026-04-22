import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { movieApi } from '../../api';

/**
 * Tính trạng thái thực tế dựa trên ngày khởi chiếu (releaseDate).
 * - releaseDate > hôm nay → COMING_SOON
 * - releaseDate <= hôm nay → NOW_SHOWING
 * - Nếu không có releaseDate → dùng status từ backend
 */
function computeStatus(movie) {
  if (movie.releaseDate) {
    const release = new Date(movie.releaseDate);
    release.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (release > today) return 'COMING_SOON';
    return 'NOW_SHOWING';
  }
  // Fallback: dùng status từ backend (normalize về uppercase)
  const s = (movie.status || '').toUpperCase();
  if (s === 'COMING_SOON') return 'COMING_SOON';
  if (s === 'ENDED') return 'ENDED';
  return 'NOW_SHOWING';
}

function StatusBadge({ status }) {
  if (status === 'COMING_SOON') {
    return (
      <span className="badge text-xs font-semibold border bg-blue-500/20 border-blue-500/30 text-blue-400">
        ⏳ Sắp chiếu
      </span>
    );
  }
  if (status === 'ENDED') {
    return (
      <span className="badge text-xs font-semibold border bg-gray-500/20 border-gray-500/30 text-gray-400">
        ✓ Đã kết thúc
      </span>
    );
  }
  return (
    <span className="badge text-xs font-semibold border bg-green-500/20 border-green-500/30 text-green-400">
      ● Đang chiếu
    </span>
  );
}

function MovieFormModal({ movie, onClose, onSave }) {
  const [form, setForm] = useState(movie || {
    name: '', title: '', time: '', director: '', content: '',
    language: 'Tiếng Anh', releaseDate: '', endDate: '',
    heroImage: '', trailerUrl: ''
  });
  const [saving, setSaving] = useState(false);

  // Tính trạng thái preview dựa trên ngày nhập
  const previewStatus = form.releaseDate
    ? computeStatus({ releaseDate: form.releaseDate })
    : null;

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
              <input value={form.name || form.title || ''} onChange={e => setForm({...form, name: e.target.value, title: e.target.value})}
                placeholder="Avengers: Secret Wars" className="input-field" />
            </div>
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Đạo diễn</label>
              <input value={form.director || ''} onChange={e => setForm({...form, director: e.target.value})}
                className="input-field" />
            </div>
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Thời lượng (phút)</label>
              <input type="number" value={form.duration || form.time || ''} onChange={e => setForm({...form, time: e.target.value, duration: e.target.value})}
                placeholder="120" className="input-field" />
            </div>

            {/* Ngày khởi chiếu — tự động tính status */}
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">
                Ngày khởi chiếu
                <span className="text-cinema-muted/60 ml-1">(quyết định trạng thái)</span>
              </label>
              <input type="date" value={form.releaseDate ? form.releaseDate.split('T')[0] : ''} onChange={e => setForm({...form, releaseDate: e.target.value})}
                className="input-field" />
            </div>

            {/* Preview trạng thái tự động */}
            <div className="flex flex-col justify-end">
              <label className="block text-cinema-muted text-xs mb-1.5">Trạng thái (tự động)</label>
              <div className="input-field flex items-center gap-2 text-sm cursor-default bg-cinema-dark/50">
                {previewStatus ? (
                  <>
                    <StatusBadge status={previewStatus} />
                    <span className="text-cinema-muted text-xs">
                      {previewStatus === 'COMING_SOON' ? '(ngày chiếu chưa đến)' : '(ngày chiếu đã qua)'}
                    </span>
                  </>
                ) : (
                  <span className="text-cinema-muted/60">Chọn ngày khởi chiếu để xem</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Ngôn ngữ</label>
              <select value={form.language || 'Tiếng Anh'} onChange={e => setForm({...form, language: e.target.value})} className="input-field cursor-pointer">
                <option>Tiếng Anh</option>
                <option>Tiếng Việt</option>
                <option>Tiếng Hàn</option>
                <option>Tiếng Nhật</option>
                <option>Tiếng Trung</option>
                <option>Tiếng Thái</option>
                <option>Tiếng Pháp</option>
              </select>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-cinema-muted text-xs mb-1.5">Link Ảnh Poster</label>
              <input value={form.posterUrl || form.heroImage || ''} onChange={e => setForm({...form, heroImage: e.target.value, posterUrl: e.target.value})}
                placeholder="URL ảnh poster" className="input-field" />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-cinema-muted text-xs mb-1.5">Link Video Trailer</label>
              <input value={form.trailerUrl || ''} onChange={e => setForm({...form, trailerUrl: e.target.value})}
                placeholder="Youtube URL" className="input-field" />
            </div>
            <div className="col-span-2">
              <label className="block text-cinema-muted text-xs mb-1.5">Mô tả</label>
              <textarea value={form.description || form.content || ''} onChange={e => setForm({...form, content: e.target.value, description: e.target.value})}
                rows={3} placeholder="Nội dung phim..." className="input-field resize-none" />
            </div>
          </div>

          {/* Info box giải thích logic */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-cinema-muted space-y-0.5">
            <p className="text-primary font-medium mb-1">ℹ️ Trạng thái tự động theo ngày khởi chiếu:</p>
            <p>• Ngày khởi chiếu <strong className="text-white">chưa đến</strong> → <span className="text-blue-400">Sắp chiếu</span></p>
            <p>• Ngày khởi chiếu <strong className="text-white">đã qua hoặc hôm nay</strong> → <span className="text-green-400">Đang chiếu</span></p>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 btn-outline py-2.5 text-sm" disabled={saving}>Huỷ</button>
            <button onClick={async () => {
                setSaving(true);
                try {
                  await onSave(form);
                  onClose(); // chỉ đóng khi thành công
                } catch {
                  // lỗi đã được hiển thị toast từ handleSave, giữ modal mở
                } finally {
                  setSaving(false);
                }
              }}
              className="flex-1 btn-primary py-2.5 text-sm" disabled={saving}>
              {saving ? 'Đang lưu...' : (movie ? 'Lưu thay đổi' : 'Thêm phim')}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const response = await movieApi.getAll({ size: 200, page: 0 });
      const list = response.data?.content || response.data?.data || response.data || [];
      setMovies(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMovies(); }, []);

  // Thêm computed status vào mỗi phim
  const moviesWithStatus = movies.map(m => ({
    ...m,
    computedStatus: computeStatus(m)
  }));

  // Thống kê
  const nowShowingCount = moviesWithStatus.filter(m => m.computedStatus === 'NOW_SHOWING').length;
  const comingSoonCount = moviesWithStatus.filter(m => m.computedStatus === 'COMING_SOON').length;

  const filtered = moviesWithStatus.filter(m => {
    const movieName = m.name || m.title || '';
    const matchSearch = movieName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || m.computedStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSave = async (form) => {
    try {
      // Tự động tính status từ releaseDate
      const autoStatus = form.releaseDate ? computeStatus({ releaseDate: form.releaseDate }) : 'NOW_SHOWING';

      const payload = {
        title: form.title || form.name,
        description: form.description || form.content || '',
        duration: parseInt(form.duration || form.time) || 0,
        director: form.director || '',
        cast: form.cast || '',
        genre: form.genre || '',
        language: form.language || 'Tiếng Anh',
        posterUrl: form.posterUrl || form.heroImage || '',
        trailerUrl: form.trailerUrl || '',
        releaseDate: form.releaseDate || '',
        // Status tự động theo ngày, gửi dạng lowercase cho backend
        status: autoStatus === 'COMING_SOON' ? 'coming_soon' : 'now_showing',
      };

      if (modal && modal !== 'add') {
        await movieApi.update(modal.id, payload);
        showToast('success', '✅ Cập nhật phim thành công!');
      } else {
        await movieApi.create(payload);
        showToast('success', '✅ Thêm phim mới thành công!');
      }
      fetchMovies();
    } catch (error) {
      console.error('Lỗi khi lưu phim:', error);
      showToast('error', '❌ Lỗi: ' + (error.response?.data?.message || 'Không thể lưu phim'));
      throw error; // re-throw để modal biết save thất bại và không đóng
    }
  };

  const handleDelete = async (id) => {
    try {
      await movieApi.delete(id);
      showToast('success', '✅ Xoá phim thành công!');
      fetchMovies();
    } catch (error) {
      console.error('Lỗi khi xoá phim:', error);
      showToast('error', '❌ Lỗi: Không thể xoá phim!');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium transition-all animate-pulse-once ${
          toast.type === 'success'
            ? 'bg-green-500/20 border border-green-500/40 text-green-300'
            : 'bg-red-500/20 border border-red-500/40 text-red-300'
        }`}>
          <span className="text-base">{toast.type === 'success' ? '✅' : '❌'}</span>
          <span>{toast.msg.replace(/^[✅❌]\s*/, '')}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100 text-xs">✕</button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-white">Quản lý Phim</h2>
          {!loading && (
            <p className="text-cinema-muted text-sm mt-0.5">
              <span className="text-green-400 font-semibold">{nowShowingCount} đang chiếu</span>
              <span className="text-cinema-muted mx-2">·</span>
              <span className="text-blue-400 font-semibold">{comingSoonCount} sắp chiếu</span>
              <span className="text-cinema-muted mx-2">·</span>
              <span className="text-cinema-muted">{movies.length} tổng</span>
              <span className="text-cinema-muted/50 ml-2 text-xs">(tính theo ngày thực tế)</span>
            </p>
          )}
        </div>
        <button onClick={() => setModal('add')} className="btn-primary text-sm px-4 py-2">
          ➕ Thêm phim mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Tìm kiếm phim..."
          className="input-field max-w-xs" />
        <div className="flex gap-1 bg-cinema-surface rounded-lg p-1 border border-cinema-border">
          {[
            { v: 'all', l: 'Tất cả' },
            { v: 'NOW_SHOWING', l: '● Đang chiếu' },
            { v: 'COMING_SOON', l: '⏳ Sắp chiếu' },
          ].map(tab => (
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
                {['Phim', 'Thời lượng', 'Ngày khởi chiếu', 'Trạng thái', 'Thao tác'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-cinema-muted text-xs font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cinema-border/50">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-10 text-cinema-muted">⏳ Đang tải dữ liệu...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-10 text-cinema-muted">Không có dữ liệu</td></tr>
              ) : filtered.map(movie => {
                const releaseDateStr = movie.releaseDate
                  ? new Date(movie.releaseDate).toLocaleDateString('vi-VN')
                  : '—';

                return (
                  <motion.tr key={movie.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-cinema-card/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={movie.posterUrl || movie.heroImage || movie.poster || 'https://placehold.co/50x70/1E1E2C/A0A0B4'}
                          alt={movie.name || movie.title}
                          className="w-10 h-14 object-cover rounded flex-shrink-0"
                          onError={e => { e.target.src = 'https://placehold.co/50x70/1E1E2C/A0A0B4'; }}
                        />
                        <div>
                          <p className="text-white text-sm font-medium leading-snug max-w-[160px] truncate">
                            {movie.name || movie.title}
                          </p>
                          <p className="text-cinema-muted text-xs">{movie.language}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-cinema-muted text-sm">
                      {movie.time || movie.duration || '—'} phút
                    </td>
                    <td className="px-4 py-3 text-cinema-muted text-sm">
                      {releaseDateStr}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={movie.computedStatus} />
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
                );
              })}
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
