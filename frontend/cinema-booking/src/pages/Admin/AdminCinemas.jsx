import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CINEMAS, CINEMA_ROOMS, PROVINCES } from '../../constants/mockData';
import useNotificationStore from '../../store/notificationStore';

// ── Cinema Modal (Add / Edit) ─────────────────────────────
function CinemaModal({ initialData, onClose, onSave }) {
  const isEdit = !!initialData;
  const [form, setForm] = useState(
    initialData || { name: '', address: '', city: '', province: '', image: '', rating: 0 }
  );

  const handleSave = () => {
    if (!form.name || !form.province || !form.address) return;
    onSave({ ...form, id: isEdit ? form.id : Date.now(), city: form.province, rating: Number(form.rating) || 0 });
    onClose();
  };

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-cinema-card border border-cinema-border rounded-2xl p-6 w-full max-w-lg shadow-card-hover">
        <h3 className="font-heading font-bold text-white text-lg mb-5">
          {isEdit ? '✏️ Cập Nhật Rạp Phim' : '➕ Thêm Rạp Mới'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-cinema-muted text-xs mb-1 block">Tên Rạp *</label>
            <input className="input-field" placeholder="VD: CGV Vincom Center" value={form.name} onChange={e => f('name', e.target.value)} />
          </div>
          <div>
            <label className="text-cinema-muted text-xs mb-1 block">Tỉnh / Thành Phố *</label>
            <select className="input-field cursor-pointer" value={form.province} onChange={e => f('province', e.target.value)}>
              <option value="">Chọn tỉnh thành...</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-cinema-muted text-xs mb-1 block">Địa chỉ *</label>
            <input className="input-field" placeholder="VD: 72 Lê Thánh Tôn, Q.1" value={form.address} onChange={e => f('address', e.target.value)} />
          </div>
          <div>
            <label className="text-cinema-muted text-xs mb-1 block">Link ảnh (URL)</label>
            <input className="input-field" placeholder="https://..." value={form.image} onChange={e => f('image', e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 btn-outline py-2.5 text-sm">Hủy</button>
          <button onClick={handleSave} className="flex-1 btn-primary py-2.5 text-sm">{isEdit ? 'Lưu Thay Đổi' : 'Thêm Rạp'}</button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────
export default function AdminCinemas() {
  const [cinemas, setCinemas] = useState(CINEMAS);
  const [rooms, setRooms] = useState(CINEMA_ROOMS);
  
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
  const [roomForm, setRoomForm] = useState({ name: '', format: '2D', roomType: 'Standard', seatsStandard: 50, seatsVIP: 30, seatsCouple: 20 });

  const [editingRoomId, setEditingRoomId] = useState(null);
  const [editRoomForm, setEditRoomForm] = useState({ format: '', roomType: '', seatsStandard: 0, seatsVIP: 0, seatsCouple: 0 });

  const { addNotification } = useNotificationStore();

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCinema, setEditingCinema] = useState(null);

  const toggleCinema = (id) => {
    if (expandedCinemaId === id) {
      setExpandedCinemaId(null);
      setShowRoomForm(null);
    } else {
      setExpandedCinemaId(id);
      setShowRoomForm(null);
    }
  };

  const handleAddRoom = (cinemaId) => {
    if (!roomForm.name || !roomForm.format) return;
    const std = parseInt(roomForm.seatsStandard) || 0;
    const vip = parseInt(roomForm.seatsVIP) || 0;
    const couple = parseInt(roomForm.seatsCouple) || 0;
    const newRoom = {
      id: Date.now(),
      cinemaId,
      name: roomForm.name,
      format: roomForm.format,
      roomType: roomForm.roomType,
      seatsStandard: std,
      seatsVIP: vip,
      seatsCouple: couple,
      totalSeats: std + vip + couple
    };
    setRooms(prev => [...prev, newRoom]);
    setRoomForm({ name: '', format: '2D', roomType: 'Standard', seatsStandard: 50, seatsVIP: 30, seatsCouple: 20 });
    setShowRoomForm(null);
    const cinema = cinemas.find(c => c.id === cinemaId);
    addNotification({ title: 'Thành công', message: `Đã thêm phòng chiếu "${roomForm.name}" cho rạp ${cinema?.name}`, type: 'success', isAdmin: true });
  };

  const startEditRoom = (room) => {
    setEditingRoomId(room.id);
    setEditRoomForm({ 
      format: room.format, 
      roomType: room.roomType || 'Standard', 
      seatsStandard: room.seatsStandard || 0, 
      seatsVIP: room.seatsVIP || 0, 
      seatsCouple: room.seatsCouple || 0 
    });
  };

  const saveEditRoom = () => {
    const std = parseInt(editRoomForm.seatsStandard) || 0;
    const vip = parseInt(editRoomForm.seatsVIP) || 0;
    const couple = parseInt(editRoomForm.seatsCouple) || 0;
    setRooms(prev => prev.map(r => r.id === editingRoomId ? { 
      ...r, 
      format: editRoomForm.format, 
      roomType: editRoomForm.roomType,
      seatsStandard: std,
      seatsVIP: vip,
      seatsCouple: couple,
      totalSeats: std + vip + couple 
    } : r));
    setEditingRoomId(null);
    const room = rooms.find(r => r.id === editingRoomId);
    const cinema = cinemas.find(c => c.id === room?.cinemaId);
    addNotification({ title: 'Thành công', message: `Đã cập nhật phòng chiếu "${room?.name}" tại ${cinema?.name}`, type: 'success', isAdmin: true });
  };

  const openAddModal = () => { setEditingCinema(null); setShowModal(true); };
  const openEditModal = (c, e) => { e.stopPropagation(); setEditingCinema(c); setShowModal(true); };

  const handleSaveCinema = (cinemaData) => {
    if (editingCinema) {
      setCinemas(prev => prev.map(c => c.id === cinemaData.id ? cinemaData : c));
      addNotification({ title: 'Thành công', message: `Đã cập nhật rạp: ${cinemaData.name}`, type: 'success', isAdmin: true });
    } else {
      setCinemas(prev => [{...cinemaData, status: 'active'}, ...prev]);
      addNotification({ title: 'Thành công', message: `Đã thêm rạp mới: ${cinemaData.name}`, type: 'success', isAdmin: true });
    }
  };

  const handleDeleteCinema = (id, e) => {
    e.stopPropagation();
    const cinema = cinemas.find(c => c.id === id);
    setCinemas(prev => prev.filter(c => c.id !== id));
    addNotification({ title: 'Thành công', message: `Đã xoá hiển thị rạp: ${cinema?.name}`, type: 'success', isAdmin: true });
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
          {PROVINCES.map(p => (
            <option key={p} value={p}>{p}</option>
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
                  <span className="text-sm">{rooms.filter(r => r.cinemaId === cinema.id).length} phòng chiếu</span>
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
                          <label className="block text-cinema-muted text-xs mb-1">Tên phòng</label>
                          <input value={roomForm.name} onChange={e => setRoomForm({...roomForm, name: e.target.value})} className="input-field py-1.5" placeholder="VD: Cinema 1" />
                        </div>
                        <div>
                          <label className="block text-cinema-muted text-xs mb-1">Định dạng</label>
                          <select value={roomForm.format} onChange={e => setRoomForm({...roomForm, format: e.target.value})} className="input-field py-1.5 pr-8">
                            {['2D', '3D', 'IMAX', '4DX'].map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-cinema-muted text-xs mb-1">Loại phòng</label>
                          <select value={roomForm.roomType} onChange={e => setRoomForm({...roomForm, roomType: e.target.value})} className="input-field py-1.5 pr-8">
                            {['Standard', 'VIP'].map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-cinema-muted text-xs mb-1">Ghế Thường</label>
                          <input type="number" value={roomForm.seatsStandard} onChange={e => setRoomForm({...roomForm, seatsStandard: e.target.value})} className="input-field py-1.5 w-20" />
                        </div>
                        <div>
                          <label className="block text-cinema-muted text-xs mb-1">Ghế VIP</label>
                          <input type="number" value={roomForm.seatsVIP} onChange={e => setRoomForm({...roomForm, seatsVIP: e.target.value})} className="input-field py-1.5 w-20" />
                        </div>
                        <div>
                          <label className="block text-cinema-muted text-xs mb-1">Ghế Đôi</label>
                          <input type="number" value={roomForm.seatsCouple} onChange={e => setRoomForm({...roomForm, seatsCouple: e.target.value})} className="input-field py-1.5 w-20" />
                        </div>
                        <button onClick={() => handleAddRoom(cinema.id)} className="btn-primary px-4 py-1.5 text-sm h-[38px]">Lưu</button>
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {rooms.filter(r => r.cinemaId === cinema.id).map(room => (
                        <div key={room.id} className="bg-cinema-card p-3 rounded-lg border border-cinema-border">
                          {editingRoomId === room.id ? (
                            <div className="space-y-2">
                              <p className="text-white font-semibold text-sm">{room.name}</p>
                              <div className="flex gap-2">
                                <select value={editRoomForm.format} onChange={e => setEditRoomForm({...editRoomForm, format: e.target.value})} className="input-field py-1 text-xs w-20">
                                  {['2D', '3D', 'IMAX', '4DX'].map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                                <select value={editRoomForm.roomType} onChange={e => setEditRoomForm({...editRoomForm, roomType: e.target.value})} className="input-field py-1 text-xs w-24">
                                  {['Standard', 'VIP'].map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                              </div>
                              <div className="flex gap-2 items-center text-xs">
                                <span className="text-cinema-muted">Thường:</span>
                                <input type="number" value={editRoomForm.seatsStandard} onChange={e => setEditRoomForm({...editRoomForm, seatsStandard: e.target.value})} className="input-field py-1 text-xs w-14" />
                                <span className="text-cinema-muted ml-1">VIP:</span>
                                <input type="number" value={editRoomForm.seatsVIP} onChange={e => setEditRoomForm({...editRoomForm, seatsVIP: e.target.value})} className="input-field py-1 text-xs w-14" />
                                <span className="text-cinema-muted ml-1">Đôi:</span>
                                <input type="number" value={editRoomForm.seatsCouple} onChange={e => setEditRoomForm({...editRoomForm, seatsCouple: e.target.value})} className="input-field py-1 text-xs w-14" />
                              </div>
                              <div className="flex gap-2">
                                <button onClick={saveEditRoom} className="text-green-400 text-xs hover:underline">Lưu</button>
                                <button onClick={() => setEditingRoomId(null)} className="text-cinema-muted text-xs hover:underline">Huỷ</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="text-white font-semibold text-sm">{room.name}</h5>
                                <p className="text-cinema-muted text-xs mt-1">Định dạng: <span className="text-white">{room.format}</span> - <span className="text-primary">{room.roomType || 'Standard'}</span></p>
                                <p className="text-cinema-muted text-xs mt-1">
                                  Ghế: {room.seatsStandard || 0} Thường, {room.seatsVIP || 0} VIP, {room.seatsCouple || 0} Đôi
                                </p>
                                <p className="text-cinema-muted text-xs mt-0.5">Tổng ghế: <span className="text-white font-medium">{room.totalSeats}</span></p>
                              </div>
                              <button onClick={() => startEditRoom(room)} className="text-cinema-muted hover:text-primary text-xs">
                                ✏️
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
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
        <CinemaModal initialData={editingCinema} onClose={() => setShowModal(false)} onSave={handleSaveCinema} />
      )}
    </div>
  );
}
