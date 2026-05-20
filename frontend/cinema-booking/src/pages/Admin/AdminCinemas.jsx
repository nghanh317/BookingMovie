import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useNotificationStore from '../../store/notificationStore';
import useAuthStore from '../../store/authStore';
import cinemaService from '../../services/cinemaService';
import provinceService from '../../services/provinceService';
import roomService from '../../services/roomService';
import seatService from '../../services/seatService';
import seatTypeService from '../../services/seatTypeService';

// ── Cinema Modal (Add / Edit) ─────────────────────────────
function CinemaModal({ initialData, onClose, onSave, provinces }) {
  const isEdit = !!initialData;
  const [form, setForm] = useState(
    initialData
      ? { ...initialData, newProvinceName: '' }
      : { name: '', address: '', phone: '', email: '', provinceId: '', newProvinceName: '', image: '', latitude: '', longitude: '' }
  );
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Auto-geocode khi địa chỉ thay đổi (debounce 1.5s)
  useEffect(() => {
    if (!form.address || (initialData && form.address === initialData.address)) return;
    const timer = setTimeout(handleGeocode, 1500);
    return () => clearTimeout(timer);
  }, [form.address]);

  const handleGeocode = async () => {
    if (!form.address) return;
    setIsGeocoding(true);
    try {
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(form.address)}&limit=1`);
      if (!res.ok) return;
      const data = await res.json();
      if (data?.features?.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates;
        setForm(prev => ({ ...prev, latitude: parseFloat(lat), longitude: parseFloat(lng) }));
      }
    } catch (_) {
      // Geocoding thất bại — không ảnh hưởng đến luồng chính
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSave = async () => {
    // Validate bắt buộc
    if (!form.name.trim() || !form.address.trim()) {
      setError('Vui lòng nhập Tên Rạp và Địa chỉ.');
      return;
    }

    let finalProvinceId = form.provinceId;

    // Nếu chọn "Thêm tỉnh mới"
    if (form.provinceId === 'new') {
      if (!form.newProvinceName.trim()) {
        setError('Vui lòng nhập tên tỉnh/thành phố mới.');
        return;
      }
      setSaving(true);
      try {
        // Backend trả void → re-fetch để tìm ID tỉnh vừa tạo
        await provinceService.create({ provinceName: form.newProvinceName.trim() });
        const freshProvinces = await provinceService.getAll();
        const provList = Array.isArray(freshProvinces)
          ? freshProvinces
          : (freshProvinces?.content || freshProvinces?.data || []);
        const created = provList.find(p => (p.provinceName || p.name) === form.newProvinceName.trim());
        if (!created) throw new Error('Không tìm thấy tỉnh vừa tạo.');
        finalProvinceId = created.id;
      } catch (err) {
        setError(`Tạo tỉnh thất bại: ${err.message}`);
        setSaving(false);
        return;
      }
    }

    if (!finalProvinceId) {
      setError('Vui lòng chọn Tỉnh / Thành Phố.');
      setSaving(false);
      return;
    }

    setError('');
    setSaving(true);
    try {
      // Truyền dữ liệu sạch lên parent — parent gọi API và đóng modal khi thành công
      await onSave({
        id: form.id,
        name: form.name.trim(),
        address: form.address.trim(),
        phone: form.phone || '',
        email: form.email || '',
        provinceId: finalProvinceId,
        image: form.image || '',
        latitude: form.latitude || null,
        longitude: form.longitude || null,
      });
    } catch (_) {
      // Lỗi đã được xử lý bởi handleSaveCinema (parent)
    } finally {
      setSaving(false);
    }
  };

  const f = (key, val) => { setError(''); setForm(prev => ({ ...prev, [key]: val })); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-cinema-card border border-cinema-border rounded-2xl p-6 w-full max-w-lg shadow-card-hover">
        <h3 className="font-heading font-bold text-white text-lg mb-5">
          {isEdit ? '✏️ Cập Nhật Rạp Phim' : '➕ Thêm Rạp Mới'}
        </h3>

        {error && (
          <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
            ⚠️ {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-cinema-muted text-xs mb-1 block">Tên Rạp *</label>
            <input className="input-field" placeholder="VD: CGV Vincom Center" value={form.name} onChange={e => f('name', e.target.value)} />
          </div>
          <div>
            <label className="text-cinema-muted text-xs mb-1 block">Tỉnh / Thành Phố *</label>
            <div className="flex gap-2">
              <select className="input-field cursor-pointer flex-1" value={form.provinceId || ''}
                onChange={e => f('provinceId', e.target.value === 'new' ? 'new' : Number(e.target.value))}>
                <option value="">Chọn tỉnh thành...</option>
                {provinces.map(p => <option key={p.id} value={p.id}>{p.provinceName || p.name}</option>)}
                <option value="new">➕ Thêm tỉnh thành khác...</option>
              </select>
              {form.provinceId === 'new' && (
                <input className="input-field flex-1" placeholder="Nhập tên tỉnh mới..."
                  value={form.newProvinceName} onChange={e => f('newProvinceName', e.target.value)} autoFocus />
              )}
            </div>
          </div>
          <div>
            <label className="text-cinema-muted text-xs mb-1 block">Địa chỉ *</label>
            <div className="flex gap-2 items-center">
              <input className="input-field flex-1" placeholder="VD: Tầng 3, TTTM Vincom..."
                value={form.address} onChange={e => f('address', e.target.value)} />
              <button type="button" onClick={handleGeocode} disabled={isGeocoding}
                className="btn-outline px-3 text-xs">📍 Quét</button>
            </div>
            {isGeocoding && <span className="text-xs text-primary mt-1 inline-block animate-pulse">Đang dò toạ độ...</span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-cinema-muted text-xs mb-1 block">Số điện thoại</label>
              <input className="input-field" placeholder="VD: 0924783748" value={form.phone} onChange={e => f('phone', e.target.value)} />
            </div>
            <div>
              <label className="text-cinema-muted text-xs mb-1 block">Email</label>
              <input className="input-field" placeholder="VD: email@cgv.vn" value={form.email} onChange={e => f('email', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-cinema-muted text-xs mb-1 block">Vĩ độ (Latitude)</label>
              <input type="number" className="input-field opacity-60 cursor-not-allowed" readOnly disabled
                placeholder="Tự động từ địa chỉ..." value={form.latitude ?? ''} />
            </div>
            <div>
              <label className="text-cinema-muted text-xs mb-1 block">Kinh độ (Longitude)</label>
              <input type="number" className="input-field opacity-60 cursor-not-allowed" readOnly disabled
                placeholder="Tự động từ địa chỉ..." value={form.longitude ?? ''} />
            </div>
          </div>
          <div>
            <label className="text-cinema-muted text-xs mb-1 block">Link ảnh (URL)</label>
            <input className="input-field" placeholder="https://..." value={form.image} onChange={e => f('image', e.target.value)} />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} disabled={saving} className="flex-1 btn-outline py-2.5 text-sm">Hủy</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary py-2.5 text-sm">
            {saving ? 'Đang lưu...' : (isEdit ? 'Lưu Thay Đổi' : 'Thêm Rạp')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────
export default function AdminCinemas() {
  const [cinemas, setCinemas] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  // roomsByCinema: { [cinemaId]: RoomDTO[] }
  const [roomsByCinema, setRoomsByCinema] = useState({});
  const [roomsLoading, setRoomsLoading] = useState({});
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  const isAuthenticated = accessToken && accessToken.startsWith('eyJ');

  useEffect(() => {
    Promise.all([
      cinemaService.getAll(),
      provinceService.getAll()
    ]).then(([cinemasData, provincesData]) => {
      setCinemas(Array.isArray(cinemasData) ? cinemasData : []);
      const provs = Array.isArray(provincesData) ? provincesData : (provincesData?.content || provincesData?.data || []);
      setProvinces(provs);
    }).catch(err => {
      console.error(err);
      setCinemas([]);
      setProvinces([]);
    }).finally(() => setLoading(false));
  }, []);

  // Fetch rooms của một rạp theo cinemaId
  const fetchRoomsForCinema = useCallback(async (cinemaId) => {
    setRoomsLoading(prev => ({ ...prev, [cinemaId]: true }));
    try {
      const res = await roomService.getAll({ cinemaId, size: 100 });
      const list = Array.isArray(res) ? res : (res?.content || res?.data || []);
      setRoomsByCinema(prev => ({ ...prev, [cinemaId]: list }));
    } catch (err) {
      console.error('[AdminCinemas] fetchRooms error:', err.message);
      setRoomsByCinema(prev => ({ ...prev, [cinemaId]: [] }));
    } finally {
      setRoomsLoading(prev => ({ ...prev, [cinemaId]: false }));
    }
  }, []);
  
  const [search, setSearch] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('all');

  const filteredCinemas = useMemo(() => {
    return cinemas.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.address.toLowerCase().includes(search.toLowerCase());
      const matchProvince = provinceFilter === 'all' || c.province === provinceFilter;
      return matchSearch && matchProvince;
    });
  }, [cinemas, search, provinceFilter]);

  const groupedCinemas = useMemo(() => {
    const map = {};
    filteredCinemas.forEach(c => {
      if (!map[c.province]) map[c.province] = [];
      map[c.province].push(c);
    });
    return map;
  }, [filteredCinemas]);

  const [expandedCinemaId, setExpandedCinemaId] = useState(null);
  const [showRoomForm, setShowRoomForm] = useState(null);
  const [roomForm, setRoomForm] = useState({ name: '', roomType: 'Standard' });
  const [savingRoom, setSavingRoom] = useState(false);

  const [editingRoomId, setEditingRoomId] = useState(null);
  const [editRoomForm, setEditRoomForm] = useState({ roomName: '', roomType: 'Standard' });

  const { addNotification } = useNotificationStore();

  const [showModal, setShowModal] = useState(false);
  const [editingCinema, setEditingCinema] = useState(null);

  // ── Seat management state ──
  const [seatsModalRoom, setSeatsModalRoom] = useState(null); // room object
  const [seatsByRoom, setSeatsByRoom] = useState({});         // { roomId: SeatDTO[] }
  const [seatsLoading, setSeatsLoading] = useState({});
  const [seatTypes, setSeatTypes] = useState([]);

  // Fetch seat types once
  useEffect(() => {
    seatTypeService.getAll({ size: 100 })
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.content || data?.data || []);
        setSeatTypes(list);
      })
      .catch(() => {});
  }, []);

  const fetchSeatsForRoom = useCallback(async (roomId) => {
    setSeatsLoading(prev => ({ ...prev, [roomId]: true }));
    try {
      const data = await seatService.getAll({ roomId, size: 500 });
      const list = Array.isArray(data) ? data : (data?.content || data?.data || []);
      list.sort((a, b) => {
        const r = (a.seatRow || '').localeCompare(b.seatRow || '');
        return r !== 0 ? r : (a.seatNumber || 0) - (b.seatNumber || 0);
      });
      setSeatsByRoom(prev => ({ ...prev, [roomId]: list }));
    } catch (err) {
      console.error('[AdminCinemas] fetchSeats error:', err.message);
      setSeatsByRoom(prev => ({ ...prev, [roomId]: [] }));
    } finally {
      setSeatsLoading(prev => ({ ...prev, [roomId]: false }));
    }
  }, []);

  const openSeatsModal = (room) => {
    setSeatsModalRoom(room);
    if (!seatsByRoom[room.id]) fetchSeatsForRoom(room.id);
  };


  const toggleCinema = (id) => {
    if (expandedCinemaId === id) {
      setExpandedCinemaId(null);
      setShowRoomForm(null);
    } else {
      setExpandedCinemaId(id);
      setShowRoomForm(null);
      // Chỉ fetch nếu chưa có dữ liệu
      if (!roomsByCinema[id]) fetchRoomsForCinema(id);
    }
  };

  const handleAddRoom = async (cinemaId) => {
    if (!roomForm.name.trim()) return;
    setSavingRoom(true);
    try {
      await roomService.create({
        cinemaId,
        roomName: roomForm.name.trim(),
        roomType: roomForm.roomType,
      });
      const cinema = cinemas.find(c => c.id === cinemaId);
      addNotification({ title: 'Thành công', message: `Đã thêm phòng "${roomForm.name}" cho rạp ${cinema?.name}`, type: 'success', isAdmin: true });
      setRoomForm({ name: '', roomType: 'Standard' });
      setShowRoomForm(null);
      await fetchRoomsForCinema(cinemaId);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể thêm phòng';
      addNotification({ title: 'Lỗi', message: msg, type: 'error', isAdmin: true });
    } finally {
      setSavingRoom(false);
    }
  };

  const startEditRoom = (room) => {
    setEditingRoomId(room.id);
    setEditRoomForm({ roomName: room.roomName || room.name || '', roomType: room.roomType || 'Standard' });
  };

  const saveEditRoom = async (cinemaId) => {
    if (!editRoomForm.roomName.trim()) return;
    try {
      await roomService.update(editingRoomId, {
        roomName: editRoomForm.roomName.trim(),
        roomType: editRoomForm.roomType,
      });
      addNotification({ title: 'Thành công', message: `Đã cập nhật phòng chiếu`, type: 'success', isAdmin: true });
      setEditingRoomId(null);
      await fetchRoomsForCinema(cinemaId);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể cập nhật phòng';
      addNotification({ title: 'Lỗi', message: msg, type: 'error', isAdmin: true });
    }
  };

  const handleDeleteRoom = async (roomId, cinemaId) => {
    if (!window.confirm('Xoá phòng chiếu này?')) return;
    try {
      await roomService.remove(roomId);
      addNotification({ title: 'Thành công', message: 'Đã xoá phòng chiếu', type: 'success', isAdmin: true });
      await fetchRoomsForCinema(cinemaId);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể xoá phòng';
      addNotification({ title: 'Lỗi', message: msg, type: 'error', isAdmin: true });
    }
  };

  const openAddModal = () => { setEditingCinema(null); setShowModal(true); };
  const openEditModal = (c, e) => { e.stopPropagation(); setEditingCinema(c); setShowModal(true); };

  const handleSaveCinema = async (cinemaData) => {
    if (!isAuthenticated) {
      addNotification({
        title: 'Chưa đăng nhập',
        message: 'Phiên đăng nhập đã hết hoặc chưa đăng nhập. Vui lòng đăng nhập lại.',
        type: 'error',
        isAdmin: true
      });
      return;
    }
    try {
      if (editingCinema) {
        await cinemaService.update(cinemaData.id, cinemaData);
        addNotification({ title: 'Thành công', message: `Đã cập nhật rạp: ${cinemaData.name}`, type: 'success', isAdmin: true });
      } else {
        await cinemaService.create(cinemaData);
        addNotification({ title: 'Thành công', message: `Đã thêm rạp mới: ${cinemaData.name}`, type: 'success', isAdmin: true });
      }
      const freshCinemas = await cinemaService.getAll();
      setCinemas(freshCinemas);
      setShowModal(false);
    } catch (error) {
      console.error('[AdminCinemas] handleSaveCinema error:', error.response?.data || error.message);
      if (error.response?.status === 403) {
        addNotification({ title: 'Không có quyền', message: 'Tài khoản không có quyền Admin.', type: 'error', isAdmin: true });
        return;
      }
      const errMsg = error.response?.data?.detailMessage || error.response?.data?.message || error.message || 'Không thể lưu rạp chiếu phim';
      addNotification({ title: 'Lỗi', message: errMsg, type: 'error', isAdmin: true });
    }
  };

  const handleDeleteCinema = async (id, e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      addNotification({ title: 'Chưa đăng nhập', message: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', type: 'error', isAdmin: true });
      return;
    }
    try {
      await cinemaService.remove(id);
      const cinema = cinemas.find(c => c.id === id);
      setCinemas(prev => prev.filter(c => c.id !== id));
      addNotification({ title: 'Thành công', message: `Đã xoá rạp: ${cinema?.name}`, type: 'success', isAdmin: true });
    } catch (error) {
      console.error('[AdminCinemas] handleDeleteCinema error:', error.response?.data || error.message);
      if (error.response?.status === 403) {
        addNotification({ title: 'Không có quyền', message: 'Tài khoản không có quyền Admin để xoá rạp.', type: 'error', isAdmin: true });
        return;
      }
      const errMsg = error.response?.data?.detailMessage || error.response?.data?.message || error.message || 'Không thể xoá rạp chiếu phim';
      addNotification({ title: 'Lỗi', message: errMsg, type: 'error', isAdmin: true });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-extrabold text-2xl text-white">Quản lý Rạp Phim</h2>
        <button onClick={openAddModal} className="btn-primary text-sm px-4 py-2">
          ➕ Thêm rạp mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="🔍 Tìm theo tên hoặc địa chỉ rạp..." 
          className="input-field max-w-xs" 
        />
        <select 
          value={provinceFilter} 
          onChange={e => setProvinceFilter(e.target.value)} 
          className="input-field max-w-[200px] cursor-pointer bg-cinema-surface"
        >
          <option value="all">Tất cả khu vực</option>
          {provinces.map(p => (
            <option key={p.id} value={p.provinceName || p.name}>{p.provinceName || p.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {Object.keys(groupedCinemas).length > 0 ? Object.entries(groupedCinemas).map(([province, groupCinemas]) => (
          <div key={province} className="mb-8">
            <h3 className="font-heading font-bold text-white text-xl mb-4 pl-2 border-l-4 border-primary">{province}</h3>
            <div className="space-y-4">
              {groupCinemas.map(cinema => (
                <div key={cinema.id} className="bg-cinema-surface border border-cinema-border rounded-xl overflow-hidden">
            {/* Cinema Header */}
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-cinema-card transition-colors"
              onClick={() => toggleCinema(cinema.id)}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={cinema.image || `https://placehold.co/100x100/1E1E2C/A0A0B4?text=${encodeURIComponent(cinema.name)}`} alt={cinema.name} className="w-16 h-16 object-cover rounded-lg" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    {cinema.name}
                  </h3>
                  <p className="text-cinema-muted text-sm">{cinema.address} • <span className="text-primary">{cinema.province}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <button onClick={(e) => openEditModal(cinema, e)} className="px-3 py-1 rounded text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-colors">
                    ✏️ Sửa
                  </button>
                  <button onClick={(e) => handleDeleteCinema(cinema.id, e)} className="px-3 py-1 rounded text-xs border transition-colors bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20">
                    🗑️ Xoá
                  </button>
                </div>
                <div className="flex items-center gap-2 text-cinema-muted ml-2 border-l border-cinema-border pl-4">
                  <span className="text-sm">{(roomsByCinema[cinema.id] || []).length} phòng chiếu</span>
                  <svg className={`w-5 h-5 transition-transform ${expandedCinemaId === cinema.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Cinema Rooms Expanded Area */}
            <AnimatePresence>
              {expandedCinemaId === cinema.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-cinema-border bg-cinema-dark/50"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-semibold text-sm">Danh sách phòng chiếu</h4>
                      <button 
                        onClick={() => setShowRoomForm(showRoomForm === cinema.id ? null : cinema.id)}
                        className="text-primary text-sm hover:underline"
                      >
                        {showRoomForm === cinema.id ? 'Huỷ thêm' : '+ Thêm phòng chiếu'}
                      </button>
                    </div>

                    {showRoomForm === cinema.id && (
                      <div className="mb-4 bg-cinema-card p-4 rounded-lg border border-primary/30 flex items-end gap-3 flex-wrap">
                        <div>
                          <label className="block text-cinema-muted text-xs mb-1">Tên phòng *</label>
                          <input value={roomForm.name} onChange={e => setRoomForm({...roomForm, name: e.target.value})} className="input-field py-1.5" placeholder="VD: Phòng 1" />
                        </div>
                        <div>
                          <label className="block text-cinema-muted text-xs mb-1">Loại phòng</label>
                          <select value={roomForm.roomType} onChange={e => setRoomForm({...roomForm, roomType: e.target.value})} className="input-field py-1.5 pr-8">
                            {['Standard', 'VIP', 'IMAX', '4DX'].map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                        </div>
                        <button onClick={() => handleAddRoom(cinema.id)} disabled={savingRoom} className="btn-primary px-4 py-1.5 text-sm h-[38px]">
                          {savingRoom ? 'Đang lưu...' : 'Lưu'}
                        </button>
                      </div>
                    )}

                    {roomsLoading[cinema.id] ? (
                      <p className="text-cinema-muted text-sm animate-pulse py-4 text-center">Đang tải phòng chiếu...</p>
                    ) : (
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {(roomsByCinema[cinema.id] || []).length === 0 ? (
                          <p className="text-cinema-muted text-xs col-span-3 py-2">Chưa có phòng chiếu nào.</p>
                        ) : (roomsByCinema[cinema.id] || []).map(room => (
                          <div key={room.id} className="bg-cinema-card p-3 rounded-lg border border-cinema-border">
                            {editingRoomId === room.id ? (
                              <div className="space-y-2">
                                <div>
                                  <label className="text-cinema-muted text-xs">Tên phòng</label>
                                  <input value={editRoomForm.roomName} onChange={e => setEditRoomForm({...editRoomForm, roomName: e.target.value})} className="input-field py-1 text-xs mt-1" />
                                </div>
                                <div>
                                  <label className="text-cinema-muted text-xs">Loại phòng</label>
                                  <select value={editRoomForm.roomType} onChange={e => setEditRoomForm({...editRoomForm, roomType: e.target.value})} className="input-field py-1 text-xs mt-1 w-full">
                                    {['Standard', 'VIP', 'IMAX', '4DX'].map(f => <option key={f} value={f}>{f}</option>)}
                                  </select>
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={() => saveEditRoom(cinema.id)} className="text-green-400 text-xs hover:underline">Lưu</button>
                                  <button onClick={() => setEditingRoomId(null)} className="text-cinema-muted text-xs hover:underline">Huỷ</button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="text-white font-semibold text-sm">{room.roomName || room.name}</h5>
                                  <p className="text-cinema-muted text-xs mt-1">Loại: <span className="text-primary">{room.roomType || 'Standard'}</span></p>
                                  <p className="text-cinema-muted text-xs mt-0.5">Tổng ghế: <span className="text-white font-medium">{room.totalSeats ?? 0}</span></p>
                                  <p className="text-cinema-muted text-xs mt-0.5">Trạng thái: <span className={room.status === 'active' ? 'text-green-400' : 'text-red-400'}>{room.status || 'active'}</span></p>
                                </div>
                                <div className="flex flex-col gap-1 items-end">
                                  <button onClick={() => startEditRoom(room)} className="text-cinema-muted hover:text-primary text-xs">✏️</button>
                                  <button onClick={() => handleDeleteRoom(room.id, cinema.id)} className="text-cinema-muted hover:text-red-400 text-xs">🗑️</button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Seats button per room */}
                    {(roomsByCinema[cinema.id] || []).length > 0 && !roomsLoading[cinema.id] && (
                      <div className="mt-3 pt-3 border-t border-cinema-border/50">
                        <p className="text-cinema-muted text-xs mb-2">Nhấn vào phòng để quản lý ghế:</p>
                        <div className="flex flex-wrap gap-2">
                          {(roomsByCinema[cinema.id] || []).map(room => (
                            <button
                              key={room.id}
                              onClick={() => openSeatsModal(room)}
                              className="text-xs px-2 py-1 rounded bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors"
                            >
                              💺 {room.roomName || room.name} ({room.totalSeats ?? 0} ghế)
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
            </div>
          </div>
        )) : (
          <div className="text-center py-10">
            <p className="text-cinema-muted">Không tìm thấy rạp nào phù hợp với bộ lọc.</p>
          </div>
        )}
      </div>

      {showModal && (
        <CinemaModal initialData={editingCinema} onClose={() => setShowModal(false)} onSave={handleSaveCinema} provinces={provinces} />
      )}

      {/* Seat Management Modal */}
      {seatsModalRoom && (
        <SeatManagementModal
          room={seatsModalRoom}
          seats={seatsByRoom[seatsModalRoom.id] || []}
          loading={!!seatsLoading[seatsModalRoom.id]}
          seatTypes={seatTypes}
          onClose={() => setSeatsModalRoom(null)}
          onRefresh={() => fetchSeatsForRoom(seatsModalRoom.id)}
          addNotification={addNotification}
        />
      )}
    </div>
  );
}

// ── Seat Management Modal ──────────────────────────────────
function SeatManagementModal({ room, seats, loading, seatTypes, onClose, onRefresh, addNotification }) {
  const roomName = room.roomName || room.name || `Phòng ${room.id}`;
  const [addForm, setAddForm] = useState({ seatRow: 'A', seatNumber: 1, seatTypesId: '' });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulk, setBulk] = useState({ fromRow: 'A', toRow: 'E', seatsPerRow: 10, seatTypesId: '' });
  const [bulkSaving, setBulkSaving] = useState(false);

  // Group by row
  const seatsByRow = seats.reduce((acc, s) => {
    const r = s.seatRow || '?';
    if (!acc[r]) acc[r] = [];
    acc[r].push(s);
    return acc;
  }, {});
  const rows = Object.keys(seatsByRow).sort();

  const handleAdd = async () => {
    if (!addForm.seatRow || !addForm.seatNumber || !addForm.seatTypesId) return;
    setSaving(true);
    try {
      await seatService.create({
        roomsId: room.id,
        seatRow: addForm.seatRow.toUpperCase(),
        seatNumber: +addForm.seatNumber,
        seatTypesId: +addForm.seatTypesId,
      });
      addNotification({ title: 'Thành công', message: `Đã thêm ghế ${addForm.seatRow}${addForm.seatNumber}`, type: 'success', isAdmin: true });
      onRefresh();
    } catch (err) {
      addNotification({ title: 'Lỗi', message: err.response?.data?.message || err.message, type: 'error', isAdmin: true });
    } finally { setSaving(false); }
  };

  const handleDelete = async (seatId, label) => {
    if (!window.confirm(`Xoá ghế ${label}?`)) return;
    setDeletingId(seatId);
    try {
      await seatService.remove(seatId);
      addNotification({ title: 'Thành công', message: `Đã xoá ghế ${label}`, type: 'success', isAdmin: true });
      onRefresh();
    } catch (err) {
      addNotification({ title: 'Lỗi', message: err.response?.data?.message || err.message, type: 'error', isAdmin: true });
    } finally { setDeletingId(null); }
  };

  const handleBulkAdd = async () => {
    if (!bulk.seatTypesId) { addNotification({ title: 'Lỗi', message: 'Chọn loại ghế', type: 'error', isAdmin: true }); return; }
    const startCode = bulk.fromRow.toUpperCase().charCodeAt(0);
    const endCode = bulk.toRow.toUpperCase().charCodeAt(0);
    if (startCode > endCode) { addNotification({ title: 'Lỗi', message: 'Hàng bắt đầu phải <= hàng kết thúc', type: 'error', isAdmin: true }); return; }
    setBulkSaving(true);
    let count = 0;
    try {
      for (let c = startCode; c <= endCode; c++) {
        const row = String.fromCharCode(c);
        for (let n = 1; n <= +bulk.seatsPerRow; n++) {
          await seatService.create({ roomsId: room.id, seatRow: row, seatNumber: n, seatTypesId: +bulk.seatTypesId });
          count++;
        }
      }
      addNotification({ title: 'Thành công', message: `Đã tạo ${count} ghế cho ${roomName}`, type: 'success', isAdmin: true });
      onRefresh();
      setBulkMode(false);
    } catch (err) {
      addNotification({ title: 'Lỗi (tạo được ' + count + ' ghế)', message: err.response?.data?.message || err.message, type: 'error', isAdmin: true });
    } finally { setBulkSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-cinema-card border border-cinema-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-card-hover">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-cinema-border flex-shrink-0">
          <div>
            <h3 className="font-heading font-bold text-white text-lg">💺 Quản lý ghế — {roomName}</h3>
            <p className="text-cinema-muted text-xs mt-0.5">Loại phòng: {room.roomType || 'Standard'} · {seats.length} ghế hiện tại</p>
          </div>
          <button onClick={onClose} className="text-cinema-muted hover:text-white text-xl leading-none">✕</button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">

          {/* Add single seat */}
          <div className="bg-cinema-surface rounded-xl p-4 border border-cinema-border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold text-sm">Thêm ghế</h4>
              <button onClick={() => setBulkMode(!bulkMode)} className="text-xs text-primary hover:underline">
                {bulkMode ? '← Thêm 1 ghế' : '⚡ Thêm hàng loạt'}
              </button>
            </div>

            {!bulkMode ? (
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="text-cinema-muted text-xs block mb-1">Hàng (Row)</label>
                  <input value={addForm.seatRow} maxLength={2} onChange={e => setAddForm(p => ({...p, seatRow: e.target.value.toUpperCase()}))}
                    className="input-field py-1.5 w-20 text-center uppercase" placeholder="A" />
                </div>
                <div>
                  <label className="text-cinema-muted text-xs block mb-1">Số ghế</label>
                  <input type="number" min={1} value={addForm.seatNumber} onChange={e => setAddForm(p => ({...p, seatNumber: e.target.value}))}
                    className="input-field py-1.5 w-20 text-center" />
                </div>
                <div>
                  <label className="text-cinema-muted text-xs block mb-1">Loại ghế</label>
                  <select value={addForm.seatTypesId} onChange={e => setAddForm(p => ({...p, seatTypesId: e.target.value}))}
                    className="input-field py-1.5 pr-8">
                    <option value="">Chọn loại...</option>
                    {seatTypes.map(t => <option key={t.id} value={t.id}>{t.seatTypeName || t.name}</option>)}
                  </select>
                </div>
                <button onClick={handleAdd} disabled={saving} className="btn-primary px-4 py-1.5 text-sm h-[38px]">
                  {saving ? 'Đang lưu...' : '+ Thêm'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-cinema-muted text-xs">Tạo nhiều ghế theo hàng (A-Z) cùng lúc.</p>
                <div className="flex flex-wrap gap-3 items-end">
                  <div>
                    <label className="text-cinema-muted text-xs block mb-1">Từ hàng</label>
                    <input value={bulk.fromRow} maxLength={1} onChange={e => setBulk(p => ({...p, fromRow: e.target.value.toUpperCase()}))}
                      className="input-field py-1.5 w-16 text-center uppercase" />
                  </div>
                  <div>
                    <label className="text-cinema-muted text-xs block mb-1">Đến hàng</label>
                    <input value={bulk.toRow} maxLength={1} onChange={e => setBulk(p => ({...p, toRow: e.target.value.toUpperCase()}))}
                      className="input-field py-1.5 w-16 text-center uppercase" />
                  </div>
                  <div>
                    <label className="text-cinema-muted text-xs block mb-1">Ghế / hàng</label>
                    <input type="number" min={1} max={30} value={bulk.seatsPerRow} onChange={e => setBulk(p => ({...p, seatsPerRow: e.target.value}))}
                      className="input-field py-1.5 w-20 text-center" />
                  </div>
                  <div>
                    <label className="text-cinema-muted text-xs block mb-1">Loại ghế</label>
                    <select value={bulk.seatTypesId} onChange={e => setBulk(p => ({...p, seatTypesId: e.target.value}))}
                      className="input-field py-1.5 pr-8">
                      <option value="">Chọn loại...</option>
                      {seatTypes.map(t => <option key={t.id} value={t.id}>{t.seatTypeName || t.name}</option>)}
                    </select>
                  </div>
                  <button onClick={handleBulkAdd} disabled={bulkSaving}
                    className="btn-primary px-4 py-1.5 text-sm h-[38px]">
                    {bulkSaving ? 'Đang tạo...' : '⚡ Tạo hàng loạt'}
                  </button>
                </div>
                {!bulkSaving && bulk.fromRow && bulk.toRow && bulk.seatsPerRow && (
                  <p className="text-cinema-muted text-xs">
                    → Sẽ tạo {(bulk.toRow.toUpperCase().charCodeAt(0) - bulk.fromRow.toUpperCase().charCodeAt(0) + 1) * +bulk.seatsPerRow} ghế
                    (hàng {bulk.fromRow.toUpperCase()}→{bulk.toRow.toUpperCase()}, {bulk.seatsPerRow} ghế/hàng)
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Seat map */}
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              <span className="text-cinema-muted ml-3 text-sm">Đang tải ghế...</span>
            </div>
          ) : seats.length === 0 ? (
            <div className="text-center py-10 text-cinema-muted">
              <p className="text-3xl mb-2">💺</p>
              <p className="text-sm">Phòng này chưa có ghế nào. Hãy thêm ghế ở trên!</p>
            </div>
          ) : (
            <div className="space-y-2">
              <h4 className="text-white font-semibold text-sm mb-2">Sơ đồ ghế ({seats.length} ghế)</h4>
              {rows.map(row => (
                <div key={row} className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-cinema-muted text-xs w-5 font-mono">{row}</span>
                  {seatsByRow[row].map(seat => {
                    const label = `${seat.seatRow}${seat.seatNumber}`;
                    const isBooked = seat.status?.toString().toUpperCase() === 'BOOKED';
                    return (
                      <button
                        key={seat.id}
                        title={`${label} - ${seat.seatTypeName || 'N/A'} - ${seat.status || 'ACTIVE'}${isBooked ? ' (Đã đặt)' : ''}`}
                        disabled={deletingId === seat.id}
                        onClick={() => !isBooked && handleDelete(seat.id, label)}
                        className={`w-9 h-9 rounded-lg border text-[10px] font-mono font-bold transition-all ${
                          deletingId === seat.id
                            ? 'opacity-40 cursor-wait bg-cinema-border/20 border-cinema-border/30 text-cinema-muted'
                            : isBooked
                            ? 'bg-red-500/20 border-red-500/50 text-red-400 cursor-not-allowed'
                            : seat.seatTypeName?.toUpperCase().includes('VIP')
                            ? 'bg-yellow-900/30 border-yellow-600/50 text-yellow-400 hover:bg-red-500/20 hover:border-red-500/50 cursor-pointer'
                            : seat.seatTypeName?.toUpperCase().includes('COUPLE') || seat.seatTypeName?.toUpperCase().includes('ĐÔI')
                            ? 'bg-pink-900/30 border-pink-600/50 text-pink-400 hover:bg-red-500/20 hover:border-red-500/50 cursor-pointer'
                            : 'bg-cinema-surface/80 border-cinema-border text-cinema-muted hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 cursor-pointer'
                        }`}
                      >
                        {deletingId === seat.id ? '...' : seat.seatNumber}
                      </button>
                    );
                  })}
                </div>
              ))}
              <p className="text-cinema-muted text-[10px] mt-2">💡 Click vào ghế để xoá (ghế đã đặt không thể xoá)</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

