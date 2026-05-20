import { useState, useMemo, useEffect, useCallback } from 'react';
import useNotificationStore from '../../store/notificationStore';
import DatePickerInput from '../../components/ui/DatePickerInput';
import movieService from '../../services/movieService';
import cinemaService from '../../services/cinemaService';
import roomService from '../../services/roomService';
import slotService from '../../services/slotService';

// Hiển thị YYYY-MM-DD thành DD/MM/YYYY
function fmtDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function fmtPrice(n) {
  if (!n && n !== 0) return '';
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

const DEFAULT_SEAT_PRICES = { standard: 75000, vip: 110000, couple: 200000 };

export default function AdminShowtimes() {
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Helper: chuyển SlotDTO -> local showtime object
  const normalizeSlot = useCallback((s, fetchedRooms) => {
    const allRooms = fetchedRooms || rooms;
    const showTimeStr = s.showTime
      ? (typeof s.showTime === 'string' ? s.showTime : new Date(s.showTime).toISOString())
      : '2024-01-01T00:00:00';
    const dateObj = new Date(showTimeStr);
    const date = dateObj.toISOString().split('T')[0];
    const time = dateObj.toTimeString().substring(0, 5);
    const room = allRooms.find(r => r.id === s.roomId);
    return {
      id: s.id,
      movieId: s.movieId,
      roomId: s.roomId,
      cinemaId: room?.cinemaId,
      cinemaName: s.cinemaName,
      date,
      time,
      hall: s.roomName || room?.roomName || room?.name || '',
      type: room?.roomType || '2D',
      availableSeats: s.emptySeats || 0,
      price: s.price,
      seatPrices: { standard: Number(s.price) || 75000, vip: Number(s.price) || 110000, couple: Number(s.price) || 200000 }
    };
  }, [rooms]);

  const fetchSlots = useCallback(async (fetchedRooms) => {
    try {
      const slotsData = await slotService.getAll({ size: 1000 });
      const slotsRaw = Array.isArray(slotsData) ? slotsData : (slotsData?.content || slotsData?.data || []);
      setShowtimes(slotsRaw.map(s => normalizeSlot(s, fetchedRooms)));
    } catch (err) {
      console.error('[AdminShowtimes] fetchSlots error:', err.message);
    }
  }, [normalizeSlot]);

  useEffect(() => {
    Promise.all([
      movieService.getAll(),
      cinemaService.getAll(),
      roomService.getAll({ size: 500 }),
    ]).then(([moviesData, cinemasData, roomsData]) => {
      setMovies(Array.isArray(moviesData) ? moviesData : (moviesData?.content || moviesData?.data || []));
      setCinemas(Array.isArray(cinemasData) ? cinemasData : (cinemasData?.content || cinemasData?.data || []));
      const fetchedRooms = Array.isArray(roomsData) ? roomsData : (roomsData?.content || roomsData?.data || []);
      setRooms(fetchedRooms);
      return fetchedRooms;
    }).then(fetchedRooms => fetchSlots(fetchedRooms))
      .catch(err => console.error('[AdminShowtimes] init error:', err))
      .finally(() => setLoading(false));
  }, []);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    movieId: '', cinemaId: '', roomId: '', date: '', time: '', hall: '', type: '2D', availableSeats: 0,
    seatPrices: { standard: 75000, vip: 110000, couple: 200000 },
  });

  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [formatFilter, setFormatFilter] = useState('all');

  const filteredShowtimes = useMemo(() => {
    return showtimes.filter(st => {
      const movie = movies.find(m => m.id === st.movieId);
      const cinema = cinemas.find(c => c.id === st.cinemaId);
      const matchSearch = (movie?.title || '').toLowerCase().includes(search.toLowerCase()) || 
                          (cinema?.name || '').toLowerCase().includes(search.toLowerCase());
      const matchDate = !dateFilter || st.date === dateFilter;
      const matchFormat = formatFilter === 'all' || st.type === formatFilter;
      return matchSearch && matchDate && matchFormat;
    });
  }, [showtimes, search, dateFilter, formatFilter, movies, cinemas]);

  const { addNotification } = useNotificationStore();

  // Tạo datetime string theo format backend: "yyyy-MM-dd HH:mm:ss"
  const toDateTimeStr = (date, time) => `${date} ${time}:00`;

  const handleAdd = async () => {
    if (!form.movieId || !form.cinemaId || !form.roomId || !form.date || !form.time) return;
    setSaving(true);
    try {
      const showTime = toDateTimeStr(form.date, form.time);
      // endTime = showTime + duration phim (nếu không có thì +2h)
      const movie = movies.find(m => m.id === +form.movieId);
      const durationMs = (movie?.duration || 120) * 60 * 1000;
      const endTimeDate = new Date(new Date(`${form.date}T${form.time}:00`).getTime() + durationMs);
      const endTime = `${endTimeDate.toISOString().split('T')[0]} ${endTimeDate.toTimeString().substring(0,5)}:00`;

      if (editingId) {
        await slotService.update(editingId, {
          movieId: +form.movieId,
          roomId: +form.roomId,
          showTime,
          endTime,
        });
        addNotification({ title: 'Thành công', message: `Đã cập nhật suất chiếu phim "${movie?.title}"`, type: 'success', isAdmin: true });
      } else {
        await slotService.create({
          movieId: +form.movieId,
          roomId: +form.roomId,
          showTime,
          endTime,
        });
        addNotification({ title: 'Thành công', message: `Đã tạo suất chiếu phim "${movie?.title}" lúc ${form.time}`, type: 'success', isAdmin: true });
      }
      await fetchSlots();
      setForm({ movieId: '', cinemaId: '', roomId: '', date: '', time: '', hall: '', type: '2D', availableSeats: 0, seatPrices: { ...DEFAULT_SEAT_PRICES } });
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể lưu suất chiếu';
      addNotification({ title: 'Lỗi', message: msg, type: 'error', isAdmin: true });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (st) => {
    setForm({
      movieId: st.movieId,
      cinemaId: st.cinemaId || '',
      roomId: st.roomId || '',
      date: st.date,
      time: st.time,
      hall: st.hall,
      type: st.type,
      availableSeats: st.availableSeats,
      seatPrices: st.seatPrices || { ...DEFAULT_SEAT_PRICES },
    });
    setEditingId(st.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xoá suất chiếu này?')) return;
    setDeletingId(id);
    try {
      await slotService.remove(id);
      const st = showtimes.find(s => s.id === id);
      const movie = movies.find(m => m.id === st?.movieId);
      addNotification({ title: 'Thành công', message: `Đã xoá suất chiếu phim "${movie?.title}" lúc ${st?.time}`, type: 'success', isAdmin: true });
      await fetchSlots();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể xoá suất chiếu';
      addNotification({ title: 'Lỗi', message: msg, type: 'error', isAdmin: true });
    } finally {
      setDeletingId(null);
    }
  };

  const cancelEdit = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ movieId: '', cinemaId: '', roomId: '', date: '', time: '', hall: '', type: '2D', availableSeats: 0, seatPrices: { ...DEFAULT_SEAT_PRICES } });
  };

  // Khi chọn phòng, tự động điền giá vé mặc định từ phòng đó
  const handleRoomChange = (e) => {
    const room = rooms.find(r => r.id === +e.target.value);
    setForm(prev => ({
      ...prev,
      roomId: e.target.value,
      hall: room?.name || '',
      type: room?.format || '',
      availableSeats: room?.totalSeats || 0,
      seatPrices: room?.seatPrices ? { ...room.seatPrices } : { ...DEFAULT_SEAT_PRICES },
    }));
  };

  const groupedData = useMemo(() => {
    const tree = {};
    cinemas.forEach(cinema => {
      const p = cinema.province;
      if (!tree[p]) tree[p] = {};
      if (!tree[p][cinema.id]) tree[p][cinema.id] = { cinema, rooms: [] };
    });

    rooms.forEach(room => {
      const c = cinemas.find(c => c.id === room.cinemaId);
      if (c && tree[c.province] && tree[c.province][c.id]) {
        tree[c.province][c.id].rooms.push(room);
      }
    });

    return tree;
  }, [cinemas, rooms]);

  const SEAT_LABELS = {
    standard: { label: 'Ghế thường', icon: '🪑', color: 'text-white' },
    vip:      { label: 'Ghế VIP',    icon: '⭐', color: 'text-yellow-400' },
    couple:   { label: 'Ghế đôi',   icon: '💑', color: 'text-pink-400' },
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-extrabold text-2xl text-white">Quản lý Suất Chiếu</h2>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ movieId: '', cinemaId: '', roomId: '', date: '', time: '', hall: '', type: '2D', availableSeats: 0, seatPrices: { ...DEFAULT_SEAT_PRICES } }); }} className="btn-primary text-sm px-4 py-2">
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
              <select value={form.cinemaId} onChange={e => setForm({...form, cinemaId: e.target.value, roomId: '', hall: '', type: '', availableSeats: 0, seatPrices: { ...DEFAULT_SEAT_PRICES }})} className="input-field cursor-pointer">
                <option value="">Chọn rạp...</option>
                {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Phòng chiếu *</label>
              <select 
                value={form.roomId} 
                onChange={handleRoomChange}
                className="input-field cursor-pointer"
                disabled={!form.cinemaId}
              >
                <option value="">Chọn phòng chiếu...</option>
                {rooms.filter(r => {
                  // rooms từ API có thể có cinemaId hoặc cinemasName — filter theo cinemaId
                  const cinemaIdNum = +form.cinemaId;
                  return r.cinemaId === cinemaIdNum;
                }).map(r => (
                  <option key={r.id} value={r.id}>{r.roomName || r.name} - {r.roomType || r.format} ({r.totalSeats} ghế)</option>
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
              <label className="block text-cinema-muted text-xs mb-1.5">Định dạng &amp; Ghế</label>
              <div className="flex gap-2">
                <input value={form.type || '2D'} disabled className="input-field w-1/3 opacity-50 bg-cinema-dark cursor-not-allowed" />
                <input value={form.availableSeats || 0} disabled className="input-field w-2/3 opacity-50 bg-cinema-dark cursor-not-allowed" title="Số ghế" />
              </div>
            </div>
          </div>

          {/* ── Bảng giá vé theo hạng ghế ─────────────────── */}
          <div className="mt-5 border-t border-cinema-border pt-4">
            <p className="text-white text-sm font-semibold mb-3">🎟️ Giá vé theo hạng ghế</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(SEAT_LABELS).map(([key, meta]) => (
                <div key={key} className="bg-cinema-card rounded-lg border border-cinema-border p-3">
                  <label className={`block text-xs font-medium mb-1.5 ${meta.color}`}>
                    {meta.icon} {meta.label}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step={5000}
                      value={form.seatPrices?.[key] ?? 0}
                      onChange={e => setForm(prev => ({
                        ...prev,
                        seatPrices: { ...prev.seatPrices, [key]: Number(e.target.value) }
                      }))}
                      className="input-field pr-8 text-sm"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cinema-muted text-xs pointer-events-none">đ</span>
                  </div>
                  {form.seatPrices?.[key] > 0 && (
                    <p className="text-cinema-muted text-[10px] mt-1">{fmtPrice(form.seatPrices[key])}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button onClick={cancelEdit} disabled={saving} className="btn-outline text-sm px-5 py-2">Huỷ</button>
            <button onClick={handleAdd} disabled={saving} className="btn-primary text-sm px-5 py-2">
              {saving ? 'Đang lưu...' : (editingId ? 'Lưu thay đổi' : 'Tạo suất chiếu')}
            </button>
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
                    <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">🍿 {cinema.name}
                      <span className="text-cinema-muted text-xs font-normal ml-1">({rooms.length} phòng chiếu)</span>
                    </h4>
                    {/* Cuộn ngang nếu hơn 3 phòng, grid nếu ≤ 3 */}
                    <div className={rooms.length > 3
                      ? 'flex gap-4 overflow-x-auto pb-2'
                      : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                    }>
                      {rooms.map(room => {
                        const roomShowtimes = filteredShowtimes.filter(s => s.cinemaId === cinema.id && s.hall === room.name);
                        
                        if ((search || dateFilter || formatFilter !== 'all') && roomShowtimes.length === 0) return null;

                        return (
                          <div key={room.id}
                            className={`bg-cinema-card rounded-lg border border-cinema-border p-4 shadow-sm${rooms.length > 3 ? ' flex-shrink-0 w-64' : ''}`}
                          >
                            <h5 className="font-semibold text-white mb-2 text-sm border-b border-cinema-border pb-2">
                              Phòng: {room.name}
                              <span className="text-cinema-muted text-xs font-normal ml-1">({room.totalSeats} ghế · {room.format})</span>
                            </h5>
                            {roomShowtimes.length === 0 ? (
                              <p className="text-cinema-muted text-xs italic py-2">Chưa có suất chiếu</p>
                            ) : (
                              <div className="space-y-3">
                                {roomShowtimes.sort((a,b) => new Date(a.date+'T'+a.time) - new Date(b.date+'T'+b.time)).map(st => {
                                  const movie = movies.find(m => m.id === st.movieId);
                                  const booked = room.totalSeats - st.availableSeats;
                                  const canEdit = booked === 0;
                                  // Giá vé của suất chiếu này (ưu tiên suất chiếu > phòng > mặc định)
                                  const prices = st.seatPrices || room.seatPrices || DEFAULT_SEAT_PRICES;
                                  return (
                                    <div key={st.id} className="bg-cinema-dark rounded border border-cinema-border p-3 hover:border-primary/50 transition-colors group">
                                      <p className="text-white text-sm font-medium leading-tight mb-1 truncate" title={movie?.title}>{movie?.title}</p>
                                      <div className="flex justify-between items-center mb-1">
                                        <p className="text-primary text-sm font-bold">{st.time} <span className="text-cinema-muted text-xs font-normal">({fmtDate(st.date)})</span></p>
                                        <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-cinema-surface text-cinema-muted border border-cinema-border">{st.type}</span>
                                      </div>
                                      <p className="text-cinema-muted text-xs mb-2">Vé đã đặt: <span className={booked > 0 ? "text-yellow-400 font-medium" : "text-green-400 font-medium"}>{booked}</span> / {room.totalSeats}</p>
                                      {/* Giá vé theo hạng */}
                                      <div className="flex flex-wrap gap-x-2 gap-y-0.5 mb-2 py-1 bg-cinema-surface/50 rounded px-2">
                                        <span className="text-[10px] text-white/70">🪑 {fmtPrice(prices.standard)}</span>
                                        <span className="text-[10px] text-yellow-400/80">⭐ {fmtPrice(prices.vip)}</span>
                                        <span className="text-[10px] text-pink-400/80">💑 {fmtPrice(prices.couple)}</span>
                                      </div>
                                      
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
                                          disabled={!canEdit || deletingId === st.id}
                                          onClick={() => handleDelete(st.id)} 
                                          className={`flex-1 text-xs py-1.5 border rounded transition-colors ${canEdit ? 'text-red-400 border-red-400/50 hover:bg-red-500/10' : 'text-gray-500 border-gray-700 cursor-not-allowed bg-cinema-surface/50'}`}
                                          title={!canEdit ? 'Đã có khách đặt vé, không thể xoá' : 'Xoá suất chiếu'}
                                        >
                                          {deletingId === st.id ? 'Đang xoá...' : '🗑️ Xoá'}
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
