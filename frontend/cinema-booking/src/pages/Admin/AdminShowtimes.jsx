import { useState, useMemo, useEffect, useCallback } from 'react';
import useNotificationStore from '../../store/notificationStore';
import DatePickerInput from '../../components/ui/DatePickerInput';
import movieService from '../../services/movieService';
import cinemaService from '../../services/cinemaService';
import roomService from '../../services/roomService';
import slotService from '../../services/slotService';

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

/** Chuyển SlotDTO -> object chuẩn cho UI */
function normalizeSlot(s) {
  let date = '';
  let time = '';
  if (s.showTime) {
    if (typeof s.showTime === 'string') {
      const parts = s.showTime.split(' ');
      if (parts.length === 2) {
        date = parts[0];
        time = parts[1].substring(0, 5);
      } else {
        const d = new Date(s.showTime);
        if (!isNaN(d)) {
          date = d.toISOString().split('T')[0];
          time = d.toTimeString().substring(0, 5);
        }
      }
    } else {
      const d = new Date(s.showTime);
      if (!isNaN(d)) {
        date = d.toISOString().split('T')[0];
        time = d.toTimeString().substring(0, 5);
      }
    }
  }
  return {
    id: s.id,
    movieId: s.movieId,
    roomId: s.roomId,
    roomName: s.roomName || '',
    cinemaName: s.cinemaName || '',
    provinceName: s.provinceName || '',
    date,
    time,
    availableSeats: s.emptySeats || 0,
    price: s.price,
  };
}

export default function AdminShowtimes() {
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchSlots = useCallback(async () => {
    try {
      const data = await slotService.getAll({ size: 1000 });
      const raw = Array.isArray(data) ? data : (data?.content || data?.data || []);
      setShowtimes(raw.map(normalizeSlot));
    } catch (err) {
      console.error('[AdminShowtimes] fetchSlots error:', err.message);
    }
  }, []);

  useEffect(() => {
    Promise.all([
      movieService.getAll(),
      cinemaService.getAll({ size: 1000 }),
      roomService.getAll({ size: 500 }),
    ]).then(([moviesData, cinemasData, roomsData]) => {
      setMovies(Array.isArray(moviesData) ? moviesData : (moviesData?.content || moviesData?.data || []));
      setCinemas(Array.isArray(cinemasData) ? cinemasData : (cinemasData?.content || cinemasData?.data || []));
      setRooms(Array.isArray(roomsData) ? roomsData : (roomsData?.content || roomsData?.data || []));
      return fetchSlots();
    })
      .catch(err => console.error('[AdminShowtimes] init error:', err))
      .finally(() => setLoading(false));
  }, [fetchSlots]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    movieId: '', cinemaId: '', roomId: '', date: '', time: '',
    seatPrices: { ...DEFAULT_SEAT_PRICES },
  });

  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [formatFilter, setFormatFilter] = useState('all');

  const { addNotification } = useNotificationStore();

  const toDateTimeStr = (date, time) => `${date} ${time}:00`;

  const handleAdd = async () => {
    if (!form.movieId || !form.roomId || !form.date || !form.time) return;
    setSaving(true);
    try {
      const showTime = toDateTimeStr(form.date, form.time);
      const movie = movies.find(m => m.id === +form.movieId);
      const durationMs = (movie?.duration || 120) * 60 * 1000;
      const endTimeDate = new Date(new Date(`${form.date}T${form.time}:00`).getTime() + durationMs);
      const endTime = `${endTimeDate.toISOString().split('T')[0]} ${endTimeDate.toTimeString().substring(0, 5)}:00`;

      const payload = {
        movieId: +form.movieId,
        roomId: +form.roomId,
        showTime,
        endTime,
        price: form.seatPrices?.standard,
        vipPrice: form.seatPrices?.vip,
        couplePrice: form.seatPrices?.couple
      };

      if (editingId) {
        await slotService.update(editingId, payload);
        addNotification({ title: 'Thành công', message: `Đã cập nhật suất chiếu`, type: 'success', isAdmin: true });
      } else {
        await slotService.create(payload);
        addNotification({ title: 'Thành công', message: `Đã tạo suất chiếu lúc ${form.time}`, type: 'success', isAdmin: true });
      }
      await fetchSlots();
      closeForm();
    } catch (err) {
      const data = err.response?.data;
      if (data && data.code === 4001) {
        addNotification({ title: data.message || 'Lỗi trùng lịch', message: data.detailMessage, type: 'error', isAdmin: true });
      } else {
        const msg = data?.detailMessage || data?.message || err.message || 'Không thể lưu suất chiếu';
        addNotification({ title: 'Lỗi', message: msg, type: 'error', isAdmin: true });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (st) => {
    // Tìm cinemaId từ rooms dựa trên roomId của slot
    const room = rooms.find(r => r.id === st.roomId);
    // cinemaId từ cinema list, khớp theo cinemasName
    const cinema = cinemas.find(c => (c.name || c.cinemaName) === (room?.cinemasName || st.cinemaName));
    setForm({
      movieId: st.movieId,
      cinemaId: cinema?.id || '',
      roomId: st.roomId || '',
      date: st.date,
      time: st.time,
      seatPrices: {
        standard: st.price || 0,
        vip: st.vipPrice || 0,
        couple: st.couplePrice || 0
      },
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
      addNotification({ title: 'Thành công', message: 'Đã xoá suất chiếu', type: 'success', isAdmin: true });
      await fetchSlots();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể xoá';
      addNotification({ title: 'Lỗi', message: msg, type: 'error', isAdmin: true });
    } finally {
      setDeletingId(null);
    }
  };

  // Chỉ reset các field, KHÔNG đụng showForm
  const resetFormFields = () => {
    setEditingId(null);
    setForm({ movieId: '', cinemaId: '', roomId: '', date: '', time: '', seatPrices: { ...DEFAULT_SEAT_PRICES } });
  };

  // Đóng form và reset
  const closeForm = () => {
    setShowForm(false);
    resetFormFields();
  };

  // Rooms theo cinemaId đã chọn: khớp qua cinemasName === cinema.name
  const roomsForSelectedCinema = useMemo(() => {
    if (!form.cinemaId) return [];
    const cinema = cinemas.find(c => c.id === +form.cinemaId);
    if (!cinema) return [];
    const cinemaName = cinema.name || cinema.cinemaName || '';
    return rooms.filter(r => r.cinemasName === cinemaName);
  }, [form.cinemaId, cinemas, rooms]);

  // Lọc showtimes
  const filteredShowtimes = useMemo(() => {
    const now = new Date();
    // Tạo danh sách tên rạp đang hoạt động để lọc các suất chiếu của rạp đã bị xoá mềm
    const activeCinemaNames = new Set(cinemas.map(c => c.name || c.cinemaName));

    return showtimes.filter(st => {
      // Ẩn suất chiếu nếu rạp đã bị xoá
      if (!activeCinemaNames.has(st.cinemaName)) return false;

      // Bỏ qua các suất chiếu trong quá khứ
      const stDateTime = new Date(`${st.date}T${st.time}`);
      if (stDateTime < now) return false;

      const movie = movies.find(m => m.id === st.movieId);
      const matchSearch =
        (movie?.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (st.cinemaName || '').toLowerCase().includes(search.toLowerCase());
      const matchDate = !dateFilter || st.date === dateFilter;
      // roomType từ rooms list
      const room = rooms.find(r => r.id === st.roomId);
      const matchFormat = formatFilter === 'all' || (room?.roomType || '') === formatFilter;
      return matchSearch && matchDate && matchFormat;
    });
  }, [showtimes, search, dateFilter, formatFilter, movies, rooms]);

  /**
   * groupedData: { [provinceName]: { [cinemaName]: { cinemaName, province, roomsList: [...] } } }
   * Xây dựng từ slots (vì slots có provinceName + cinemaName) + rooms (có roomName + cinemasName)
   */
  const groupedData = useMemo(() => {
    const tree = {}; // { province -> { cinemaName -> { rooms: Set<roomId> } } }

    // Bước 1: thu thập tất cả tổ hợp province + cinemaName từ slots
    const activeCinemaNames = new Set(cinemas.map(c => c.name || c.cinemaName));
    showtimes.forEach(st => {
      if (!activeCinemaNames.has(st.cinemaName)) return; // Bỏ qua suất chiếu của rạp đã bị xoá
      const prov = st.provinceName || 'Khác';
      const cn = st.cinemaName || 'Không xác định';
      if (!tree[prov]) tree[prov] = {};
      if (!tree[prov][cn]) tree[prov][cn] = { roomIds: new Set() };
      if (st.roomId) tree[prov][cn].roomIds.add(st.roomId);
    });

    // Bước 2: với mỗi cinemaName trong tree, thêm rooms của rạp đó (dù chưa có slot)
    cinemas.forEach(cinema => {
      const cn = cinema.name || cinema.cinemaName || '';
      const prov = cinema.province || cinema.provincesName || 'Khác';
      if (!tree[prov]) tree[prov] = {};
      if (!tree[prov][cn]) tree[prov][cn] = { roomIds: new Set() };
      // Thêm tất cả rooms của rạp này
      rooms.filter(r => r.cinemasName === cn).forEach(r => tree[prov][cn].roomIds.add(r.id));
    });

    // Bước 3: chuyển thành mảng rooms đầy đủ
    const result = {};
    Object.entries(tree).forEach(([prov, cinemaMap]) => {
      result[prov] = {};
      Object.entries(cinemaMap).forEach(([cn, { roomIds }]) => {
        const roomList = [...roomIds]
          .map(rid => rooms.find(r => r.id === rid))
          .filter(Boolean);
        result[prov][cn] = { cinemaName: cn, province: prov, roomList };
      });
    });

    return result;
  }, [showtimes, cinemas, rooms]);

  const SEAT_LABELS = {
    standard: { label: 'Ghế thường', icon: '🪑', color: 'text-white' },
    vip: { label: 'Ghế VIP', icon: '⭐', color: 'text-yellow-400' },
    couple: { label: 'Ghế đôi', icon: '💑', color: 'text-pink-400' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-cinema-muted">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-extrabold text-2xl text-white">Quản lý Suất Chiếu</h2>
        <button
          onClick={() => {
            if (showForm && !editingId) {
              closeForm();
            } else {
              resetFormFields();
              setShowForm(true);
            }
          }}
          className="btn-primary text-sm px-4 py-2"
        >
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
          {[{ v: 'all', l: 'Tất cả' }, { v: '2D', l: '2D' }, { v: '3D', l: '3D' }, { v: 'IMAX', l: 'IMAX' }].map(tab => (
            <button key={tab.v} onClick={() => setFormatFilter(tab.v)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${formatFilter === tab.v ? 'bg-primary text-cinema-black' : 'text-cinema-muted hover:text-white'}`}>
              {tab.l}
            </button>
          ))}
        </div>
      </div>

      {/* Form thêm / sửa */}
      {showForm && (
        <div className="bg-cinema-surface border border-primary/30 rounded-xl p-5 mb-8">
          <h3 className="font-heading font-bold text-white mb-4">{editingId ? '✏️ Cập nhật suất chiếu' : 'Tạo suất chiếu mới'}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Phim */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-cinema-muted text-xs mb-1.5">Phim *</label>
              <select value={form.movieId} onChange={e => setForm({ ...form, movieId: e.target.value })} className="input-field cursor-pointer">
                <option value="">Chọn phim...</option>
                {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>
            {/* Rạp */}
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Rạp *</label>
              <select
                value={form.cinemaId}
                onChange={e => setForm({ ...form, cinemaId: e.target.value, roomId: '' })}
                className="input-field cursor-pointer"
              >
                <option value="">Chọn rạp...</option>
                {cinemas.map(c => <option key={c.id} value={c.id}>{c.name || c.cinemaName}</option>)}
              </select>
            </div>
            {/* Phòng chiếu */}
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Phòng chiếu *</label>
              <select
                value={form.roomId}
                onChange={e => setForm({ ...form, roomId: e.target.value })}
                className="input-field cursor-pointer"
                disabled={!form.cinemaId}
              >
                <option value="">Chọn phòng...</option>
                {roomsForSelectedCinema.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.roomName} - {r.roomType} ({r.totalSeats} ghế)
                  </option>
                ))}
              </select>
            </div>
            {/* Ngày */}
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Ngày chiếu *</label>
              <DatePickerInput value={form.date} onChange={iso => setForm({ ...form, date: iso })} className="input-field" />
            </div>
            {/* Giờ */}
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Giờ chiếu *</label>
              <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="input-field" />
            </div>
          </div>

          {/* Giá vé */}
          <div className="mt-5 border-t border-cinema-border pt-4">
            <p className="text-white text-sm font-semibold mb-3">🎟️ Giá vé theo hạng ghế</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(SEAT_LABELS).map(([key, meta]) => (
                <div key={key} className="bg-cinema-card rounded-lg border border-cinema-border p-3">
                  <label className={`block text-xs font-medium mb-1.5 ${meta.color}`}>{meta.icon} {meta.label}</label>
                  <div className="relative">
                    <input
                      type="number" min={0} step={5000}
                      value={form.seatPrices?.[key] ?? 0}
                      onChange={e => setForm(prev => ({ ...prev, seatPrices: { ...prev.seatPrices, [key]: Number(e.target.value) } }))}
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
            <button onClick={closeForm} disabled={saving} className="btn-outline text-sm px-5 py-2">Huỷ</button>
            <button onClick={handleAdd} disabled={saving || !form.movieId || !form.roomId || !form.date || !form.time} className="btn-primary text-sm px-5 py-2">
              {saving ? 'Đang lưu...' : (editingId ? 'Lưu thay đổi' : 'Tạo suất chiếu')}
            </button>
          </div>
        </div>
      )}

      {/* Danh sách theo Province → Cinema → Room */}
      <div className="space-y-8">
        {Object.keys(groupedData).length === 0 ? (
          <div className="text-center py-16 bg-cinema-surface rounded-xl border border-cinema-border">
            <p className="text-5xl mb-3">🎬</p>
            <p className="text-white font-semibold">Chưa có dữ liệu suất chiếu</p>
            <p className="text-cinema-muted text-sm mt-1">Hãy thêm suất chiếu mới để bắt đầu</p>
          </div>
        ) : (
          Object.entries(groupedData).map(([province, cinemaMap]) => (
            <div key={province} className="mb-8">
              <h3 className="font-heading font-bold text-white text-xl mb-4 pl-3 border-l-4 border-primary">
                📍 {province}
              </h3>
              <div className="space-y-6">
                {Object.values(cinemaMap).map(({ cinemaName, roomList }) => {
                  // Lọc showtimes hiển thị (theo filter)
                  const cinemaShowtimes = filteredShowtimes.filter(s => s.cinemaName === cinemaName);

                  // Nếu đang filter và rạp này không có suất nào khớp thì ẩn
                  if ((search || dateFilter || formatFilter !== 'all') && cinemaShowtimes.length === 0) return null;

                  return (
                    <div key={cinemaName} className="bg-cinema-surface border border-cinema-border rounded-xl p-4">
                      <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                        🍿 {cinemaName}
                        <span className="text-cinema-muted text-xs font-normal ml-1">({roomList.length} phòng chiếu)</span>
                      </h4>

                      {roomList.length === 0 ? (
                        <p className="text-cinema-muted text-sm italic">Chưa có phòng chiếu</p>
                      ) : (
                        <div className="flex gap-4 overflow-x-auto pb-2">
                          {roomList.map(room => {
                            // Slots của phòng này, qua filter
                            const roomShowtimes = filteredShowtimes.filter(s =>
                              s.cinemaName === cinemaName && s.roomId === room.id
                            );

                            if ((search || dateFilter || formatFilter !== 'all') && roomShowtimes.length === 0) return null;

                            return (
                              <div key={room.id}
                                className="bg-cinema-card rounded-lg border border-cinema-border p-4 shadow-sm flex-shrink-0 w-72"
                              >
                                {/* Header phòng */}
                                <h5 className="font-semibold text-white mb-3 text-sm border-b border-cinema-border pb-2 flex items-center justify-between">
                                  <span>🎥 {room.roomName}</span>
                                  <span className="text-cinema-muted text-[11px] font-normal">
                                    {room.totalSeats} ghế · <span className="text-primary">{room.roomType}</span>
                                  </span>
                                </h5>

                                {roomShowtimes.length === 0 ? (
                                  <p className="text-cinema-muted text-xs italic py-2 text-center">Chưa có suất chiếu</p>
                                ) : (
                                  <div className="space-y-3 max-h-[640px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-cinema-border [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-primary/50">
                                    {[...roomShowtimes]
                                      .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
                                      .map(st => {
                                        const movie = movies.find(m => m.id === st.movieId);
                                        const booked = (room.totalSeats || 0) - st.availableSeats;
                                        const canEdit = booked === 0;

                                        return (
                                          <div key={st.id}
                                            className="bg-cinema-dark rounded-lg border border-cinema-border p-3 hover:border-primary/50 transition-colors group"
                                          >
                                            <p className="text-white text-sm font-medium leading-tight mb-1 truncate" title={movie?.title}>
                                              {movie?.title || `Phim #${st.movieId}`}
                                            </p>
                                            <div className="flex justify-between items-center mb-1">
                                              <p className="text-primary text-sm font-bold">
                                                {st.time}
                                                <span className="text-cinema-muted text-xs font-normal ml-1">({fmtDate(st.date)})</span>
                                              </p>
                                              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${booked > 0 ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' : 'text-green-400 border-green-400/30 bg-green-400/10'}`}>
                                                {booked > 0 ? `${booked} đã đặt` : 'Trống'}
                                              </span>
                                            </div>
                                            <p className="text-cinema-muted text-xs mb-2">
                                              Ghế còn: <span className="text-white font-medium">{st.availableSeats}</span> / {room.totalSeats || '?'}
                                            </p>
                                            {st.price && (
                                              <p className="text-[11px] text-cinema-muted mb-2">
                                                Giá: <span className="text-primary font-semibold">{fmtPrice(Number(st.price))}</span>
                                              </p>
                                            )}
                                            <div className="flex gap-2">
                                              <button
                                                disabled={!canEdit}
                                                onClick={() => handleEdit(st)}
                                                className={`flex-1 text-xs py-1.5 border rounded transition-colors ${canEdit ? 'text-blue-400 border-blue-400/50 hover:bg-blue-500/10' : 'text-gray-500 border-gray-700 cursor-not-allowed'}`}
                                                title={!canEdit ? 'Đã có vé đặt, không thể sửa' : ''}
                                              >
                                                ✏️ Sửa
                                              </button>
                                              <button
                                                disabled={!canEdit || deletingId === st.id}
                                                onClick={() => handleDelete(st.id)}
                                                className={`flex-1 text-xs py-1.5 border rounded transition-colors ${canEdit ? 'text-red-400 border-red-400/50 hover:bg-red-500/10' : 'text-gray-500 border-gray-700 cursor-not-allowed'}`}
                                                title={!canEdit ? 'Đã có vé đặt, không thể xoá' : ''}
                                              >
                                                {deletingId === st.id ? 'Xoá...' : '🗑️ Xoá'}
                                              </button>
                                            </div>
                                            {!canEdit && (
                                              <p className="text-[10px] text-red-400/70 mt-1 text-center hidden group-hover:block">
                                                * Không thể sửa/xoá do đã có vé
                                              </p>
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
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
