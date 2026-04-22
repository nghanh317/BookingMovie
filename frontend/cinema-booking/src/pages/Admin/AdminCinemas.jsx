import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import cinemaApi from '../../api/cinemaApi';
import provinceApi from '../../api/provinceApi';

const parseList = (res) => {
  const d = res.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.content)) return d.content;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

function CinemaFormModal({ cinema, provinces, onClose, onSave }) {
  const [form, setForm] = useState(cinema ? {
    cinemaName: cinema.cinemaName || cinema.name || '',
    address: cinema.address || '',
    phone: cinema.phone || '',
    email: cinema.email || '',
    provinceId: cinema.provinceId || '',
    latitude: cinema.latitude || '',
    longitude: cinema.longitude || '',
  } : {
    cinemaName: '', address: '', phone: '', email: '', provinceId: '', latitude: '', longitude: '',
  });
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  // Tự động tìm tọa độ khi địa chỉ thay đổi (debounce)
  useEffect(() => {
    if (!form.address || form.address.length < 5) return;
    
    const timer = setTimeout(async () => {
      setGeocoding(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.address)}&limit=1`);
        const data = await res.json();
        if (data && data.length > 0) {
          setForm(prev => ({
            ...prev,
            latitude: data[0].lat,
            longitude: data[0].lon
          }));
        }
      } catch (err) {
        console.error('Lỗi lấy tọa độ:', err);
      } finally {
        setGeocoding(false);
      }
    }, 1500); // 1.5s delay
    
    return () => clearTimeout(timer);
  }, [form.address]);

  const [isAddingProvince, setIsAddingProvince] = useState(false);
  const [newProvinceName, setNewProvinceName] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-cinema-card border border-cinema-border rounded-2xl p-6 max-w-lg w-full shadow-card-hover"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading font-bold text-white text-lg">
            {cinema ? '✏️ Chỉnh sửa rạp' : '🏛️ Thêm rạp mới'}
          </h3>
          <button onClick={onClose} className="text-cinema-muted hover:text-white p-1">✕</button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-cinema-muted text-xs">Tỉnh / Thành phố *</label>
              {!cinema && (
                <button 
                  type="button"
                  onClick={() => setIsAddingProvince(!isAddingProvince)}
                  className="text-primary text-[10px] hover:underline"
                >
                  {isAddingProvince ? '↩ Chọn từ danh sách' : '➕ Thêm tỉnh mới'}
                </button>
              )}
            </div>
            
            {isAddingProvince ? (
              <input
                value={newProvinceName}
                onChange={e => setNewProvinceName(e.target.value)}
                placeholder="Nhập tên tỉnh mới (VD: Long An)"
                className="input-field border-primary/40 focus:border-primary"
                autoFocus
              />
            ) : (
              <select
                value={form.provinceId}
                onChange={e => setForm({ ...form, provinceId: e.target.value })}
                className="input-field cursor-pointer"
              >
                <option value="">Chọn tỉnh...</option>
                {provinces.map(p => (
                  <option key={p.id} value={p.id}>{p.provinceName || p.name}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-cinema-muted text-xs mb-1.5">Tên rạp *</label>
            <input
              value={form.cinemaName}
              onChange={e => setForm({ ...form, cinemaName: e.target.value })}
              placeholder="CGV Vincom Bà Triệu"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-cinema-muted text-xs mb-1.5">Địa chỉ *</label>
            <div className="relative">
              <input
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder="191 Bà Triệu, Hai Bà Trưng, Hà Nội"
                className="input-field"
              />
              {geocoding && (
                <div className="absolute right-3 top-2.5">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Kinh độ (Longitude)</label>
              <input
                value={form.longitude}
                onChange={e => setForm({ ...form, longitude: e.target.value })}
                className="input-field bg-cinema-dark/50"
                placeholder="105.xxx"
              />
            </div>
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Vĩ độ (Latitude)</label>
              <input
                value={form.latitude}
                onChange={e => setForm({ ...form, latitude: e.target.value })}
                className="input-field bg-cinema-dark/50"
                placeholder="21.xxx"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Số điện thoại *</label>
              <input
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="0901234567"
                className="input-field"
                maxLength={10}
              />
            </div>
            <div>
              <label className="block text-cinema-muted text-xs mb-1.5">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="cgv@example.com"
                className="input-field"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 btn-outline py-2.5 text-sm" disabled={saving}>Huỷ</button>
            <button
              onClick={async () => {
                if (isAddingProvince && !newProvinceName) {
                  alert('Vui lòng nhập tên tỉnh mới');
                  return;
                }
                if (!isAddingProvince && !form.provinceId) {
                  alert('Vui lòng chọn tỉnh / thành phố');
                  return;
                }
                if (!form.cinemaName || !form.address || !form.phone || !form.email) {
                  alert('Vui lòng điền đầy đủ thông tin bắt buộc (*)');
                  return;
                }

                setSaving(true);
                try {
                  let finalForm = { ...form };
                  
                  // Nếu thêm tỉnh mới, gọi API tạo tỉnh trước
                  if (isAddingProvince) {
                    const res = await provinceApi.create({ provinceName: newProvinceName });
                    // Lưu ý: Tùy vào API của bạn trả về ID hay không. 
                    // Ở đây giả sử ta cần reload lại list provinces để lấy ID mới nhất 
                    // HOẶC backend tự gán nếu ta gửi tên tỉnh (nhưng thường là gửi ID).
                    // Để an toàn, ta sẽ cần ID. Nếu API create không trả về ID, ta sẽ báo admin chọn lại.
                    alert('Đã thêm tỉnh mới: ' + newProvinceName + '. Hệ thống sẽ tải lại danh sách tỉnh. Vui lòng chọn tỉnh vừa thêm và Lưu rạp.');
                    await onSave(null); // Chỉ trigger reload
                    onClose();
                    return;
                  }

                  await onSave(finalForm);
                  onClose();
                } catch (err) {
                  console.error(err);
                } finally {
                  setSaving(false);
                }
              }}
              className="flex-1 btn-primary py-2.5 text-sm"
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : (cinema ? 'Lưu thay đổi' : 'Thêm rạp')}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminCinemas() {
  const [cinemas, setCinemas] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterProvince, setFilterProvince] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | cinemaObj
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cinemaRes, provinceRes] = await Promise.all([
        cinemaApi.getAll({ size: 200, page: 0 }),
        provinceApi.getAll({ size: 100, page: 0 }),
      ]);
      setCinemas(parseList(cinemaRes));
      setProvinces(parseList(provinceRes));
    } catch (err) {
      console.error(err);
      showToast('error', '❌ Không thể tải dữ liệu!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (form) => {
    if (!form) {
      await fetchData();
      return;
    }
    try {
      const payload = {
        cinemaName: form.cinemaName,
        address: form.address,
        phone: form.phone,
        email: form.email,
        provinceId: parseInt(form.provinceId),
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      };
      if (modal && modal !== 'add') {
        await cinemaApi.update(modal.id, payload);
        showToast('success', '✅ Cập nhật rạp thành công!');
      } else {
        await cinemaApi.create(payload);
        showToast('success', '✅ Thêm rạp thành công!');
      }
      await fetchData();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Lỗi không xác định';
      showToast('error', `❌ Lỗi: ${msg}`);
      throw err;
    }
  };

  const handleDelete = async (id) => {
    try {
      await cinemaApi.delete(id);
      showToast('success', '✅ Xoá rạp thành công!');
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('error', '❌ Lỗi xoá rạp!');
    } finally {
      setDeleteId(null);
    }
  };

  // CinemaDTO trả về field 'provincesName' (không phải provinceId)
  const getProvinceName = (cinema) => {
    return cinema.provincesName || cinema.provinceName || '—';
  };

  const filtered = cinemas.filter(c => {
    const name = (c.cinemaName || '').toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase());
    // filter theo tên tỉnh (provincesName từ CinemaDTO)
    const matchProvince = !filterProvince || (c.provincesName === filterProvince);
    return matchSearch && matchProvince;
  });

  // Thống kê: đếm rạp theo tên tỉnh từ CinemaDTO.provincesName
  const provinceStats = provinces
    .map(p => ({
      ...p,
      count: cinemas.filter(c => c.provincesName === (p.provinceName || p.name)).length,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium ${
          toast.type === 'success'
            ? 'bg-green-500/20 border border-green-500/40 text-green-300'
            : 'bg-red-500/20 border border-red-500/40 text-red-300'
        }`}>
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} className="ml-1 opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-white">Quản lý Rạp Chiếu</h2>
          {!loading && (
            <p className="text-cinema-muted text-sm mt-0.5">
              Tổng: <span className="text-primary font-semibold">{cinemas.length}</span> rạp
              tại <span className="text-primary font-semibold">
                {[...new Set(cinemas.map(c => c.provincesName).filter(Boolean))].length}
              </span> tỉnh/thành
            </p>
          )}
        </div>
        <button onClick={() => setModal('add')} className="btn-primary text-sm px-4 py-2">
          🏛️ Thêm rạp mới
        </button>
      </div>

      {/* Thống kê theo tỉnh — horizontal scroll, không tràn */}
      {!loading && provinceStats.length > 0 && (
        <div className="overflow-x-auto pb-1">
          <div className="flex gap-2" style={{ minWidth: 'max-content' }}>
            <button
              onClick={() => setFilterProvince('')}
              className={`flex-shrink-0 rounded-xl px-3 py-2 text-left border transition-all min-w-[90px] ${
                !filterProvince
                  ? 'bg-primary/20 border-primary/50'
                  : 'bg-cinema-surface border-cinema-border hover:border-primary/30'
              }`}
            >
              <p className="text-xs text-cinema-muted">Tất cả</p>
              <p className="text-base font-bold text-white mt-0.5">
                {cinemas.length} <span className="text-xs font-normal text-cinema-muted">rạp</span>
              </p>
            </button>
            {provinceStats.map(p => (
              <button
                key={p.id}
                onClick={() => setFilterProvince(
                  filterProvince === (p.provinceName || p.name) ? '' : (p.provinceName || p.name)
                )}
                className={`flex-shrink-0 rounded-xl px-3 py-2 text-left border transition-all min-w-[110px] ${
                  filterProvince === (p.provinceName || p.name)
                    ? 'bg-primary/20 border-primary/50'
                    : p.count > 0
                    ? 'bg-cinema-surface border-cinema-border hover:border-primary/30'
                    : 'bg-cinema-surface/50 border-cinema-border/30 opacity-50'
                }`}
              >
                <p className="text-xs text-cinema-muted truncate max-w-[100px]">{p.provinceName || p.name}</p>
                <p className={`text-base font-bold mt-0.5 ${p.count > 0 ? 'text-white' : 'text-cinema-muted/40'}`}>
                  {p.count} <span className="text-xs font-normal text-cinema-muted">rạp</span>
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Tìm tên rạp..."
          className="input-field max-w-xs"
        />
        <select
          value={filterProvince}
          onChange={e => setFilterProvince(e.target.value)}
          className="input-field max-w-xs cursor-pointer"
        >
          <option value="">Tất cả tỉnh</option>
          {provinces.map(p => (
            <option key={p.id} value={p.provinceName || p.name}>{p.provinceName || p.name}</option>
          ))}
        </select>
        {(search || filterProvince) && (
          <button onClick={() => { setSearch(''); setFilterProvince(''); }} className="text-cinema-muted hover:text-white text-sm transition-colors">
            ✕ Xoá filter
          </button>
        )}
        <span className="text-cinema-muted text-sm self-center ml-auto">{filtered.length} rạp</span>
      </div>

      {/* Table */}
      <div className="bg-cinema-surface rounded-xl border border-cinema-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cinema-border bg-cinema-dark">
                {['Tên rạp', 'Tỉnh / TP', 'Địa chỉ', 'SĐT', 'Email', 'Thao tác'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-cinema-muted text-xs font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cinema-border/50">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-10 text-cinema-muted">⏳ Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-cinema-muted">
                    <div className="text-4xl mb-2">🏜️</div>
                    <p>{search || filterProvince ? 'Không tìm thấy rạp phù hợp' : 'Chưa có rạp nào. Hãy thêm rạp mới!'}</p>
                    {!search && !filterProvince && (
                      <button onClick={() => setModal('add')} className="btn-primary text-sm px-4 py-2 mt-3">
                        🏛️ Thêm rạp ngay
                      </button>
                    )}
                  </td>
                </tr>
              ) : filtered.map(cinema => (
                <motion.tr key={cinema.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="hover:bg-cinema-card/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white text-sm font-medium">{cinema.cinemaName || cinema.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                      {getProvinceName(cinema)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-cinema-muted text-xs max-w-[200px] truncate">{cinema.address || '—'}</td>
                  <td className="px-4 py-3 text-cinema-muted text-sm">{cinema.phone || '—'}</td>
                  <td className="px-4 py-3 text-cinema-muted text-xs">{cinema.email || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setModal(cinema)}
                        className="px-2.5 py-1.5 rounded-lg bg-cinema-card border border-cinema-border text-cinema-muted hover:text-primary hover:border-primary text-xs transition-all">
                        ✏️
                      </button>
                      <button onClick={() => setDeleteId(cinema.id)}
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

      {/* Modal Form */}
      <AnimatePresence>
        {modal && (
          <CinemaFormModal
            cinema={modal === 'add' ? null : modal}
            provinces={provinces}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="bg-cinema-card border border-cinema-border rounded-2xl p-6 max-w-sm w-full text-center">
              <div className="text-4xl mb-3">🗑️</div>
              <h3 className="font-heading font-bold text-white text-lg mb-2">Xác nhận xoá?</h3>
              <p className="text-cinema-muted text-sm mb-5">Xoá rạp sẽ ảnh hưởng đến các phòng chiếu và suất chiếu liên quan.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 btn-outline text-sm py-2.5">Huỷ</button>
                <button onClick={() => handleDelete(deleteId)}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors">
                  Xoá rạp
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
