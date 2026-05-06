import { useState, useMemo, useEffect } from 'react';
import { CINEMAS, SHOWTIMES, CINEMA_ROOMS } from '../../constants/mockData';
import useNotificationStore from '../../store/notificationStore';
import DatePickerInput from '../../components/ui/DatePickerInput';
import { movieService } from '../../services';

// Hiển thị YYYY-MM-DD thành DD/MM/YYYY
function fmtDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

const MOCK_SHOWTIMES = [
  ...SHOWTIMES,
  { id: 11, movieId: 1, cinemaId: 2, date: '2026-03-19', time: '14:00', hall: 'Hall B', type: '3D', availableSeats: 55 },
  { id: 12, movieId: 3, cinemaId: 3, date: '2026-03-20', time: '20:00', hall: 'Hall C', type: '2D', availableSeats: 90 },
];

export default function AdminShowtimes() {
  const [movies, setMovies] = useState([]);
  const [showtimes, setShowtimes] = useState(MOCK_SHOWTIMES);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    movieId: '', cinemaId: '', roomId: '', date: '', time: '', hall: '', type: '2D', availableSeats: 0
  });

  useEffect(() => {
    movieService.getAll().then(setMovies);
  }, []);

  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [formatFilter, setFormatFilter] = useState('all');

  const filteredShowtimes = useMemo(() => {
    return showtimes.filter(st => {
      const movie = movies.find(m => m.id === st.movieId);
      const cinema = CINEMAS.find(c => c.id === st.cinemaId);
      const matchSearch = (movie?.title || '').toLowerCase().includes(search.toLowerCase()) || 
                          (cinema?.name || '').toLowerCase().includes(search.toLowerCase());
      // dateFilter là ISO (YYYY-MM-DD) từ DatePickerInput
      const matchDate = !dateFilter || st.date === dateFilter;
      const matchFormat = formatFilter === 'all' || st.type === formatFilter;
      return matchSearch && matchDate && matchFormat;
    });
  }, [showtimes, search, dateFilter, formatFilter]);

  const { addNotification } = useNotificationStore();

  const handleAdd = () => {
    if (!form.movieId || !form.cinemaId || !form.roomId || !form.date || !form.time) return;
    
    if (editingId) {
      setShowtimes(prev => prev.map(s => s.id === editingId ? { ...s, ...form, movieId: +form.movieId, cinemaId: +form.cinemaId, availableSeats: +form.availableSeats } : s));
      const movie = movies.find(m => m.id === +form.movieId);
      addNotification({ title: 'Thành công', message: `Đã cập nhật suất chiếu phim "${movie?.title}" lúc ${form.time}`, type: 'success', isAdmin: true });
    } else {
      setShowtimes(prev => [...prev, { ...form, id: Date.now(), movieId: +form.movieId, cinemaId: +form.cinemaId, availableSeats: +form.availableSeats }]);
      const movie = movies.find(m => m.id === +form.movieId);
      addNotification({ title: 'Thành công', message: `Đã tạo suất chiếu phim "${movie?.title}" lúc ${form.time}`, type: 'success', isAdmin: true });
    }

    setForm({ movieId: '', cinemaId: '', roomId: '', date: '', time: '', hall: '', type: '2D', availableSeats: 0 });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (st) => {
    const room = CINEMA_ROOMS.find(r => r.cinemaId === st.cinemaId && r.name === st.hall);
    setForm({
      movieId: st.movieId,
      cinemaId: st.cinemaId,
      roomId: room ? room.id : '',
      date: st.date,
      time: st.time,
      hall: st.hall,
      type: st.type,
      availableSeats: st.availableSeats
    });
    setEditingId(st.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    const st = showtimes.find(s => s.id === id);
    const movie = movies.find(m => m.id === st?.movieId);
    setShowtimes(prev => prev.filter(s => s.id !== id));
    addNotification({ title: 'Thành công', message: `Đã xoá hiển thị suất chiếu phim "${movie?.title}" lúc ${st?.time}`, type: 'success', isAdmin: true });
  };

  const cancelEdit = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ movieId: '', cinemaId: '', roomId: '', date: '', time: '', hall: '', type: '2D', availableSeats: 0 });
  };

  // Group by Province -> Cinema -> Room
  const groupedData = useMemo(() => {
    const tree = {};
    CINEMAS.forEach(cinema => {
      const p = cinema.province;
      if (!tree[p]) tree[p] = {};
      if (!tree[p][cinema.id]) tree[p][cinema.id] = { cinema, rooms: [] };
    });

    CINEMA_ROOMS.forEach(room => {
      const c = CINEMAS.find(c => c.id === room.cinemaId);
      if (c && tree[c.province] && tree[c.province][c.id]) {
        tree[c.province][c.id].rooms.push(room);
      }
    });

    return tree;
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-extrabold text-2xl text-white">Quản lý Suất Chiếu</h2>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ movieId: '', cinemaId: '', roomId: '', date: '', time: '', hall: '', type: '2D', availableSeats: 0 }); }} className="btn-primary text-sm px-4 py-2">
          {showForm && !editingId ? 'Huỷ thêm' : '➕ Thêm suất chiếu'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="🔍 Tìm theo tên phim hoặc rạp..." 
          className="input-field max-w-xs" 
        />
        <div className="relative max-w-[180px]">
          <DatePickerInput
            value={dateFilter}
            onChange={iso => setDateFilter(iso)}
            placeholder="📅 Lọc theo ngày"
            className="input-field"
          />
        </div>
        <div className="flex gap-1 bg-cinema-surface rounded-lg p-1 border border-cinema-border">
          {[{v:'all', l:'Tất cả'}, {v:'2D', l:'2D'}, {v:'3D', l:'3D'}, {v:'IMAX', l:'IMAX'}].map(tab => (
            <button key={tab.v} onClick={() => setFormatFilter(tab.v)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                formatFilter === tab.v ? 'bg-primary text-cinema-black' : 'text-cinema-muted hover:text-white'
              }`}>
              {tab.l}
            </button>
          ))}
        </div>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-cinema-surface border border-primary/30 rounded-xl p-5 mb-8">
          <h3 className="font-heading font-bold text-white mb-4">{editingId ? '✏️ Cập nhật suất chiếu' : 'Tạo suất chiếu mới'}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-cinema-muted text-xs mb-1.5">Phim *</label>
              <select value={form.movieId} onChange={e => setForm({...form, movieId: e.target.value})} className="input-field cursor-pointer">
                <option value="">Chọn phim...</option>
                {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Rạp *</label>
              <select value={form.cinemaId} onChange={e => setForm({...form, cinemaId: e.target.value, roomId: '', hall: '', type: '', availableSeats: 0})} className="input-field cursor-pointer">
                <option value="">Chọn rạp...</option>
                {CINEMAS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Phòng chiếu *</label>
              <select 
                value={form.roomId} 
                onChange={e => {
                  const room = CINEMA_ROOMS.find(r => r.id === +e.target.value);
                  setForm({...form, roomId: e.target.value, hall: room?.name || '', type: room?.format || '', availableSeats: room?.totalSeats || 0});
                }} 
                className="input-field cursor-pointer"
                disabled={!form.cinemaId}
              >
                <option value="">Chọn phòng chiếu...</option>
                {CINEMA_ROOMS.filter(r => r.cinemaId === +form.cinemaId).map(r => (
                  <option key={r.id} value={r.id}>{r.name} - {r.format} ({r.totalSeats} ghế)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Ngày chiếu *</label>
              <DatePickerInput
                value={form.date}
                onChange={iso => setForm({...form, date: iso})}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Giờ chiếu *</label>
              <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Định dạng & Ghế</label>
              <div className="flex gap-2">
                <input value={form.type || '2D'} disabled className="input-field w-1/3 opacity-50 bg-cinema-dark cursor-not-allowed" />
                <input value={form.availableSeats || 0} disabled className="input-field w-2/3 opacity-50 bg-cinema-dark cursor-not-allowed" title="Số ghế" />
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={cancelEdit} className="btn-outline text-sm px-5 py-2">Huỷ</button>
            <button onClick={handleAdd} className="btn-primary text-sm px-5 py-2">{editingId ? 'Lưu thay đổi' : 'Tạo suất chiếu'}</button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-8">
        {Object.keys(groupedData).length > 0 ? (
          Object.entries(groupedData).map(([province, cinemasMap]) => (
            <div key={province} className="mb-8">
              <h3 className="font-heading font-bold text-white text-xl mb-4 pl-2 border-l-4 border-primary">{province}</h3>
              <div className="space-y-6">
                {Object.values(cinemasMap).map(({ cinema, rooms }) => (
                  <div key={cinema.id} className="bg-cinema-surface border border-cinema-border rounded-xl p-4">
                    <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">🍿 {cinema.name}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {rooms.map(room => {
                        const roomShowtimes = filteredShowtimes.filter(s => s.cinemaId === cinema.id && s.hall === room.name);
                        
                        // Nếu có bất kỳ bộ lọc nào đang bật và phòng này không có suất chiếu thoả mãn, thì ẩn phòng đi
                        if ((search || dateFilter || formatFilter !== 'all') && roomShowtimes.length === 0) return null;

                        return (
                          <div key={room.id} className="bg-cinema-card rounded-lg border border-cinema-border p-4 shadow-sm">
                            <h5 className="font-semibold text-white mb-2 text-sm border-b border-cinema-border pb-2">Phòng: {room.name} ({room.totalSeats} ghế)</h5>
                            {roomShowtimes.length === 0 ? (
                              <p className="text-cinema-muted text-xs italic py-2">Chưa có suất chiếu</p>
                            ) : (
                              <div className="space-y-3">
                                {roomShowtimes.sort((a,b) => new Date(a.date+'T'+a.time) - new Date(b.date+'T'+b.time)).map(st => {
                                  const movie = movies.find(m => m.id === st.movieId);
                                  const booked = room.totalSeats - st.availableSeats;
                                  const canEdit = booked === 0;
                                  return (
                                    <div key={st.id} className="bg-cinema-dark rounded border border-cinema-border p-3 hover:border-primary/50 transition-colors group">
                                      <p className="text-white text-sm font-medium leading-tight mb-1 truncate" title={movie?.title}>{movie?.title}</p>
                                      <div className="flex justify-between items-center mb-1">
                                        <p className="text-primary text-sm font-bold">{st.time} <span className="text-cinema-muted text-xs font-normal">({fmtDate(st.date)})</span></p>
                                        <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-cinema-surface text-cinema-muted border border-cinema-border">{st.type}</span>
                                      </div>
                                      <p className="text-cinema-muted text-xs mb-3">Vé đã đặt: <span className={booked > 0 ? "text-yellow-400 font-medium" : "text-green-400 font-medium"}>{booked}</span> / {room.totalSeats}</p>
                                      
                                      <div className="flex gap-2">
                                        <button 
                                          disabled={!canEdit} 
                                          onClick={() => handleEdit(st)} 
                                          className={`flex-1 text-xs py-1.5 border rounded transition-colors ${canEdit ? 'text-blue-400 border-blue-400/50 hover:bg-blue-500/10' : 'text-gray-500 border-gray-700 cursor-not-allowed bg-cinema-surface/50'}`} 
                                          title={!canEdit ? 'Đã có khách đặt vé, không thể sửa' : 'Cập nhật suất chiếu'}
                                        >
                                          ✏️ Sửa
                                        </button>
                                        <button 
                                          disabled={!canEdit}
                                          onClick={() => handleDelete(st.id)} 
                                          className={`flex-1 text-xs py-1.5 border rounded transition-colors ${canEdit ? 'text-red-400 border-red-400/50 hover:bg-red-500/10' : 'text-gray-500 border-gray-700 cursor-not-allowed bg-cinema-surface/50'}`}
                                          title={!canEdit ? 'Đã có khách đặt vé, không thể xoá' : 'Xoá suất chiếu'}
                                        >
                                          🗑️ Xoá
                                        </button>
                                      </div>
                                      {!canEdit && (
                                        <p className="text-[10px] text-red-400/80 mt-1 italic hidden group-hover:block text-center">* Không thể sửa/xoá do đã có vé đặt</p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-cinema-muted">Không có dữ liệu hệ thống rạp.</p>
          </div>
        )}
      </div>
    </div>
  );
}
