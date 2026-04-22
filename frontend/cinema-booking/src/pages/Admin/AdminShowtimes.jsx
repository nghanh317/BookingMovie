import { useState, useEffect } from 'react';
import slotApi from '../../api/slotApi';
import movieApi from '../../api/movieApi';
import roomApi from '../../api/roomApi';
import provinceApi from '../../api/provinceApi';

export default function AdminShowtimes() {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cinemaNames, setCinemaNames] = useState([]); // tên rạp thuộc tỉnh đang chọn
  const [loadingCinemas, setLoadingCinemas] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [toast, setToast] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    provinceId: '', movieId: '', roomId: '', date: '', time: '', type: '2D', price: 50000, emptySeats: 50
  });
  const [saving, setSaving] = useState(false);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // Parse Spring Page<DTO> hoặc plain array
  const parseList = (res) => {
    const d = res.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.content)) return d.content;  // Spring Page
    if (Array.isArray(d?.data)) return d.data;         // wrapper {data:[]}
    return [];
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [slotRes, movieRes, roomRes, provinceRes] = await Promise.all([
        slotApi.getAll({ size: 500, page: 0 }),
        movieApi.getAll({ size: 200, page: 0 }),
        roomApi.getAll({ size: 200, page: 0 }),
        provinceApi.getAll({ size: 100, page: 0 })
      ]);
      const slots = parseList(slotRes).sort((a, b) => b.id - a.id);
      setShowtimes(slots);
      setMovies(parseList(movieRes));
      setRooms(parseList(roomRes));
      setProvinces(parseList(provinceRes));
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu', err);
      showToast('error', 'Không thể tải dữ liệu. Kiểm tra kết nối backend!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Khi chọn tỉnh → gọi API lấy danh sách rạp thuộc tỉnh đó
  useEffect(() => {
    if (!form.provinceId) {
      setCinemaNames([]);
      return;
    }
    setLoadingCinemas(true);
    provinceApi.getCinemasByProvinceId(form.provinceId, { size: 100 })
      .then(res => {
        const d = res.data;
        const cinemas = Array.isArray(d) ? d
          : Array.isArray(d?.content) ? d.content
          : Array.isArray(d?.data) ? d.data
          : [];
        // Lưu tên các rạp để dùng filter rooms
        const names = cinemas.map(c => c.name || c.cinemasName || c.cinemaName || '');
        setCinemaNames(names);
      })
      .catch(() => setCinemaNames([]))
      .finally(() => setLoadingCinemas(false));
  }, [form.provinceId]);

  const handleSave = async () => {
    if (!form.movieId || !form.roomId || !form.date || !form.time) {
      showToast('error', 'Vui lòng điền đủ thông tin bắt buộc (*)');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        const payload = {
          movieId: parseInt(form.movieId),
          roomId: parseInt(form.roomId),
          showTime: `${form.date}T${form.time}:00`,
          endTime: `${form.date}T${form.time}:00`,
          price: parseInt(form.price),
          emptySeats: parseInt(form.emptySeats || 50)
        };
        await slotApi.update(editId, payload);
        showToast('success', '✅ Cập nhật suất chiếu thành công!');
      } else {
        // Backend nhận format: "yyyy-MM-dd HH:mm:ss"
        const payload = {
          movieId: parseInt(form.movieId),
          roomId: parseInt(form.roomId),
          showTime: `${form.date} ${form.time}:00`,
          endTime: `${form.date} ${form.time}:00`,
          price: form.price ? parseFloat(form.price) : null,
          emptySeats: form.emptySeats ? parseInt(form.emptySeats) : null
        };
        await slotApi.create(payload);
        showToast('success', '✅ Tạo suất chiếu thành công!');
      }
      setForm({ provinceId: '', movieId: '', roomId: '', date: '', time: '', type: '2D', price: 50000, emptySeats: 50 });
      setShowForm(false);
      setEditId(null);
      await fetchData();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.message || 'Lỗi không xác định';
      showToast('error', `❌ Lỗi lưu suất chiếu: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (st) => {
    let dateStr = '';
    let timeStr = '';
    if (st.showTime) {
      // showTime có thể là "2026-05-25 10:00:00" hoặc "2026-05-25T10:00:00"
      const normalized = st.showTime.replace('T', ' ');
      const [d, t] = normalized.split(' ');
      dateStr = d;
      timeStr = t ? t.substring(0, 5) : '';
    }
    setForm({
      movieId: st.movieId || '',
      roomId: st.roomId || '',
      date: dateStr,
      time: timeStr,
      type: '2D',
      price: st.price || 50000,
      emptySeats: st.emptySeats || 50
    });
    setEditId(st.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xoá suất chiếu này?')) return;
    try {
      await slotApi.delete(id);
      showToast('success', '✅ Xoá suất chiếu thành công!');
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('error', '❌ Lỗi xoá suất chiếu!');
    }
  };

  // Filter theo search text (tên phim hoặc rạp)
  const filtered = showtimes.filter(st => {
    if (!searchText.trim()) return true;
    const q = searchText.toLowerCase();
    return (
      (st.movieName || '').toLowerCase().includes(q) ||
      (st.cinemaName || '').toLowerCase().includes(q) ||
      (st.roomName || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium transition-all ${
          toast.type === 'success'
            ? 'bg-green-500/20 border border-green-500/50 text-green-300'
            : 'bg-red-500/20 border border-red-500/50 text-red-300'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-white">Quản lý Suất Chiếu</h2>
          {!loading && (
            <p className="text-cinema-muted text-sm mt-0.5">
              Tổng: <span className="text-primary font-semibold">{showtimes.length}</span> suất chiếu
              {searchText && ` | Kết quả: ${filtered.length}`}
            </p>
          )}
        </div>
        <button
        onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ provinceId: '', movieId: '', roomId: '', date: '', time: '', type: '2D', price: 50000, emptySeats: 50 }); }}
          className="btn-primary text-sm px-4 py-2"
        >
          ➕ Thêm suất chiếu
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-cinema-surface border border-primary/30 rounded-xl p-5">
          <h3 className="font-heading font-bold text-white mb-4">
            {editId ? '✏️ Chỉnh sửa suất chiếu' : '🎬 Tạo suất chiếu mới'}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Phim */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-cinema-muted text-xs mb-1.5">Phim *</label>
              <select value={form.movieId} onChange={e => setForm({...form, movieId: e.target.value})} className="input-field cursor-pointer">
                <option value="">Chọn phim...</option>
                {movies.map(m => <option key={m.id} value={m.id}>{m.title || m.name}</option>)}
              </select>
            </div>

            {/* Tỉnh */}
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Tỉnh / Thành phố *</label>
              <select
                value={form.provinceId}
                onChange={e => setForm({ ...form, provinceId: e.target.value, roomId: '' })}
                className="input-field cursor-pointer"
              >
                <option value="">Chọn tỉnh...</option>
                {provinces.map(p => (
                  <option key={p.id} value={p.id}>{p.name || p.provinceName}</option>
                ))}
              </select>
            </div>

            {/* Phòng chiếu — chỉ hiện khi đã chọn tỉnh */}
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">
                Phòng chiếu *
                {!form.provinceId && <span className="text-cinema-muted/50 ml-1">(chọn tỉnh trước)</span>}
              </label>
              <select
                value={form.roomId}
                onChange={e => setForm({...form, roomId: e.target.value})}
                className="input-field cursor-pointer disabled:opacity-50"
                disabled={!form.provinceId || loadingCinemas}
              >
                <option value="">
                  {!form.provinceId
                    ? '— Chọn tỉnh trước —'
                    : loadingCinemas
                    ? 'Đang tải rạp...'
                    : 'Chọn phòng chiếu...'}
                </option>
                {!loadingCinemas && rooms
                  .filter(r => {
                    if (!form.provinceId || cinemaNames.length === 0) return false;
                    // Filter rooms có cinemasName nằm trong danh sách rạp của tỉnh
                    return cinemaNames.some(name =>
                      name && r.cinemasName &&
                      (r.cinemasName === name || r.cinemasName.includes(name) || name.includes(r.cinemasName))
                    );
                  })
                  .map(c => (
                    <option key={c.id} value={c.id}>
                      {c.cinemasName} — {c.roomName}
                    </option>
                  ))
                }
              </select>
            </div>

            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Ngày chiếu *</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Giờ chiếu *</label>
              <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">
                Giá vé (VNĐ)
                {!editId && <span className="text-cinema-muted/60 ml-1">(bỏ trống = tự tính)</span>}
              </label>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm({...form, price: e.target.value})}
                className="input-field"
                placeholder="50000"
                min="0"
              />
            </div>
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">
                Số ghế trống
                {!editId && <span className="text-cinema-muted/60 ml-1">(bỏ trống = lấy từ phòng)</span>}
              </label>
              <input
                type="number"
                value={form.emptySeats}
                onChange={e => setForm({...form, emptySeats: e.target.value})}
                className="input-field"
                placeholder="50"
                min="0"
              />
            </div>
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Định dạng</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input-field cursor-pointer">
                {['2D', '3D', 'IMAX'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="btn-outline text-sm px-4 py-2" disabled={saving}>Huỷ</button>
            <button onClick={handleSave} className="btn-primary text-sm px-4 py-2" disabled={saving}>
              {saving ? '⏳ Đang lưu...' : (editId ? '💾 Cập nhật' : '🎬 Tạo suất chiếu')}
            </button>
          </div>
        </div>
      )}

      {/* Search bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cinema-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Tìm theo tên phim, rạp, phòng..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="input-field pl-9 text-sm"
          />
        </div>
        {searchText && (
          <button onClick={() => setSearchText('')} className="text-cinema-muted hover:text-white text-sm transition-colors">
            ✕ Xoá filter
          </button>
        )}
        <button onClick={fetchData} className="btn-outline text-sm px-3 py-2" title="Làm mới">
          🔄
        </button>
      </div>

      {/* Table */}
      <div className="bg-cinema-surface rounded-xl border border-cinema-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cinema-border bg-cinema-dark">
                {['#', 'Phim', 'Rạp', 'Phòng', 'TG Bắt đầu', 'Giá vé', 'Ghế trống', 'Thao tác'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-cinema-muted text-xs font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cinema-border/50">
              {loading ? (
                <tr><td colSpan="8" className="text-center py-10 text-cinema-muted">⏳ Đang tải dữ liệu...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-10 text-cinema-muted">
                  {searchText ? `Không tìm thấy suất chiếu với từ khoá "${searchText}"` : 'Chưa có suất chiếu nào'}
                </td></tr>
              ) : filtered.map((st, idx) => {
                // Parse showTime: "2026-05-25 10:00:00" hoặc ISO
                const raw = (st.showTime || st.createDate || '').replace(' ', 'T');
                const dateObj = raw ? new Date(raw) : null;
                const dateStr = dateObj ? dateObj.toLocaleDateString('vi-VN') : '—';
                const timeStr = dateObj ? dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—';

                return (
                  <tr key={st.id} className="hover:bg-cinema-card/50 transition-colors">
                    <td className="px-4 py-3 text-cinema-muted text-xs">{idx + 1}</td>
                    <td className="px-4 py-3 text-white text-sm max-w-[140px] truncate">{st.movieName || '—'}</td>
                    <td className="px-4 py-3 text-cinema-muted text-xs max-w-[150px] truncate">{st.cinemaName || '—'}</td>
                    <td className="px-4 py-3 text-cinema-muted text-sm">{st.roomName || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-primary font-bold text-sm block">{timeStr}</span>
                      <span className="text-cinema-muted text-xs">{dateStr}</span>
                    </td>
                    <td className="px-4 py-3 text-cinema-muted text-sm">{(st.price || 0).toLocaleString()}đ</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${
                        (st.emptySeats || 0) > 30 ? 'text-green-400' :
                        (st.emptySeats || 0) > 10 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>{st.emptySeats ?? st.availableSeats ?? 0}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(st)}
                          className="px-2.5 py-1.5 rounded-lg bg-cinema-card border border-cinema-border text-cinema-muted hover:text-primary hover:border-primary text-xs transition-all"
                          title="Chỉnh sửa">
                          ✏️
                        </button>
                        <button onClick={() => handleDelete(st.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-cinema-card border border-cinema-border text-cinema-muted hover:text-red-400 hover:border-red-400 text-xs transition-all"
                          title="Xoá">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
