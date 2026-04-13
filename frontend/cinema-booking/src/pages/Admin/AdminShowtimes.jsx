import { useState } from 'react';
import { MOVIES, CINEMAS, SHOWTIMES } from '../../constants/mockData';

const MOCK_SHOWTIMES = [
  ...SHOWTIMES,
  { id: 11, movieId: 1, cinemaId: 2, date: '2026-03-19', time: '14:00', hall: 'Hall B', type: '3D', availableSeats: 55 },
  { id: 12, movieId: 3, cinemaId: 3, date: '2026-03-20', time: '20:00', hall: 'Hall C', type: '2D', availableSeats: 90 },
];

export default function AdminShowtimes() {
  const [showtimes, setShowtimes] = useState(MOCK_SHOWTIMES);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    movieId: '', cinemaId: '', date: '', time: '', hall: '', type: '2D', availableSeats: 100
  });

  const handleAdd = () => {
    if (!form.movieId || !form.cinemaId || !form.date || !form.time) return;
    setShowtimes(prev => [...prev, { ...form, id: Date.now(), movieId: +form.movieId, cinemaId: +form.cinemaId, availableSeats: +form.availableSeats }]);
    setForm({ movieId: '', cinemaId: '', date: '', time: '', hall: '', type: '2D', availableSeats: 100 });
    setShowForm(false);
  };

  const handleDelete = (id) => setShowtimes(prev => prev.filter(s => s.id !== id));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-extrabold text-2xl text-white">Quản lý Suất Chiếu</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm px-4 py-2">
          ➕ Thêm suất chiếu
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-cinema-surface border border-primary/30 rounded-xl p-5">
          <h3 className="font-heading font-bold text-white mb-4">Tạo suất chiếu mới</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-cinema-muted text-xs mb-1.5">Phim *</label>
              <select value={form.movieId} onChange={e => setForm({...form, movieId: e.target.value})} className="input-field cursor-pointer">
                <option value="">Chọn phim...</option>
                {MOVIES.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Rạp *</label>
              <select value={form.cinemaId} onChange={e => setForm({...form, cinemaId: e.target.value})} className="input-field cursor-pointer">
                <option value="">Chọn rạp...</option>
                {CINEMAS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
              <label className="block text-cinema-muted text-xs mb-1.5">Phòng chiếu</label>
              <input value={form.hall} onChange={e => setForm({...form, hall: e.target.value})} placeholder="Cinema 1" className="input-field" />
            </div>
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Định dạng</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input-field cursor-pointer">
                {['2D', '3D', 'IMAX'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Số ghế</label>
              <input type="number" value={form.availableSeats} onChange={e => setForm({...form, availableSeats: e.target.value})} className="input-field" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="btn-outline text-sm px-4 py-2">Huỷ</button>
            <button onClick={handleAdd} className="btn-primary text-sm px-4 py-2">Tạo suất chiếu</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-cinema-surface rounded-xl border border-cinema-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cinema-border bg-cinema-dark">
                {['Phim', 'Rạp', 'Ngày', 'Giờ', 'Phòng', 'Loại', 'Ghế trống', 'Thao tác'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-cinema-muted text-xs font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cinema-border/50">
              {showtimes.map(st => {
                const movie = MOVIES.find(m => m.id === st.movieId);
                const cinema = CINEMAS.find(c => c.id === st.cinemaId);
                return (
                  <tr key={st.id} className="hover:bg-cinema-card/50 transition-colors">
                    <td className="px-4 py-3 text-white text-sm max-w-[140px] truncate">{movie?.title || '—'}</td>
                    <td className="px-4 py-3 text-cinema-muted text-xs max-w-[150px] truncate">{cinema?.name || '—'}</td>
                    <td className="px-4 py-3 text-cinema-muted text-sm">{new Date(st.date).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-3 text-primary font-bold text-sm">{st.time}</td>
                    <td className="px-4 py-3 text-cinema-muted text-sm">{st.hall}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs font-bold border ${
                        st.type === 'IMAX' ? 'bg-purple-500/20 border-purple-500/30 text-purple-400' :
                        st.type === '3D' ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' :
                        'bg-cinema-card border-cinema-border text-cinema-muted'
                      }`}>{st.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${
                        st.availableSeats > 30 ? 'text-green-400' :
                        st.availableSeats > 10 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>{st.availableSeats}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(st.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-cinema-card border border-cinema-border text-cinema-muted hover:text-red-400 hover:border-red-400 text-xs transition-all">
                        🗑️
                      </button>
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
