import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { VOUCHERS as MOCK_VOUCHERS } from '../../constants/mockData';
import useNotificationStore from '../../store/notificationStore';
import DatePickerInput from '../../components/ui/DatePickerInput';
import promotionService from '../../services/promotionService';

const TYPE_LABEL = { percent: 'Phần trăm', fixed: 'Số tiền cố định' };

function fmt(n) {
  return new Intl.NumberFormat('vi-VN').format(n);
}
function fmtDate(d) {
  if (!d) return '—';
  const datePart = String(d).split(' ')[0].split('T')[0];
  const parts = datePart.split(/[-/]/);
  if (parts.length < 3) return d;
  
  // Nếu là yyyy-mm-dd
  if (parts[0].length === 4) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  // Nếu là dd-mm-yyyy hoặc dd/mm/yyyy
  return `${parts[0]}/${parts[1]}/${parts[2]}`;
}

// ── Add Modal ──────────────────────────────────────────────
function AddVoucherModal({ onClose, onAdd }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    code: '', name: '', type: 'percent', value: '', maxDiscount: '',
    minOrder: '', desc: '', startDate: today, expiry: '', stock: '',
    usesPerUser: 1, pointCost: 0,
  });

  const handleAdd = () => {
    if (!form.code || !form.value || !form.expiry || !form.stock) return;
    onAdd({
      id: 'V' + Date.now(),
      code: form.code.toUpperCase(),
      name: form.name || form.code.toUpperCase(),
      type: form.type,
      value: Number(form.value),
      maxDiscount: Number(form.maxDiscount) || 0,
      minOrder: Number(form.minOrder) || 0,
      desc: form.desc || `Giảm ${form.value}${form.type === 'percent' ? '%' : '000đ'}`,
      startDate: form.startDate,
      expiry: form.expiry,
      stock: Number(form.stock),
      usedCount: 0,
      usesPerUser: Number(form.usesPerUser) || 1,
      active: true,
      isPublic: true,
      pointCost: Number(form.pointCost) || 0,
    });
    onClose();
  };

  const f = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-cinema-card border border-cinema-border rounded-2xl p-6 w-full max-w-lg shadow-card-hover overflow-y-auto max-h-[90vh]">
        <h3 className="font-heading font-bold text-white text-lg mb-5">➕ Thêm Voucher Mới</h3>
        <div className="space-y-3">
          <div>
            <label className="text-cinema-muted text-xs mb-1 block">Tên chương trình</label>
            <input className="input-field" placeholder="VD: Ưu đãi mùa hè" value={form.name} onChange={e => f('name', e.target.value)} />
          </div>
          <div>
            <label className="text-cinema-muted text-xs mb-1 block">Mã voucher *</label>
            <input className="input-field uppercase" placeholder="VD: SUMMER20" value={form.code} onChange={e => f('code', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-cinema-muted text-xs mb-1 block">Loại giảm giá *</label>
              <select className="input-field cursor-pointer" value={form.type} onChange={e => f('type', e.target.value)}>
                <option value="percent">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (đ)</option>
              </select>
            </div>
            <div>
              <label className="text-cinema-muted text-xs mb-1 block">Giá trị *</label>
              <input type="number" className="input-field" placeholder={form.type === 'percent' ? '20' : '50000'} value={form.value} onChange={e => f('value', e.target.value)} />
            </div>
          </div>
          {form.type === 'percent' && (
            <div>
              <label className="text-cinema-muted text-xs mb-1 block">Giảm tối đa (đ)</label>
              <input type="number" className="input-field" placeholder="100000" value={form.maxDiscount} onChange={e => f('maxDiscount', e.target.value)} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-cinema-muted text-xs mb-1 block">Đơn tối thiểu (đ)</label>
              <input type="number" className="input-field" placeholder="100000" value={form.minOrder} onChange={e => f('minOrder', e.target.value)} />
            </div>
            <div>
              <label className="text-cinema-muted text-xs mb-1 block">Số lượng *</label>
              <input type="number" className="input-field" placeholder="100" value={form.stock} onChange={e => f('stock', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-cinema-muted text-xs mb-1 block">Ngày bắt đầu</label>
              <DatePickerInput
                value={form.startDate}
                onChange={iso => f('startDate', iso)}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-cinema-muted text-xs mb-1 block">Ngày kết thúc *</label>
              <DatePickerInput
                value={form.expiry}
                onChange={iso => f('expiry', iso)}
                className="input-field"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-cinema-muted text-xs mb-1 block">Số lần dùng/user</label>
              <input type="number" className="input-field" min={1} value={form.usesPerUser} onChange={e => f('usesPerUser', e.target.value)} />
            </div>
            <div>
              <label className="text-cinema-muted text-xs mb-1 block">Điểm đổi (0 = tặng)</label>
              <input type="number" className="input-field" placeholder="0" value={form.pointCost} onChange={e => f('pointCost', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-cinema-muted text-xs mb-1 block">Mô tả</label>
            <input className="input-field" placeholder="Mô tả ngắn về voucher" value={form.desc} onChange={e => f('desc', e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 btn-outline py-2.5 text-sm">Hủy</button>
          <button onClick={handleAdd} className="flex-1 btn-primary py-2.5 text-sm">Thêm Voucher</button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────
function EditVoucherModal({ voucher, onClose, onSave }) {
  const today = new Date().toISOString().split('T')[0];
  const hasUsed = voucher.usedCount > 0;
  const startedAlready = voucher.startDate && voucher.startDate <= today;
  const [form, setForm] = useState({ ...voucher });
  const [errors, setErrors] = useState({});

  const locked = (field) => {
    if (!hasUsed) return false;
    return ['code', 'type', 'value', 'maxDiscount'].includes(field);
  };

  const f = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: null }));
  };

  const validate = () => {
    const errs = {};
    if (hasUsed) {
      if (Number(form.stock) < voucher.usedCount)
        errs.stock = `Không được nhỏ hơn số đã dùng (${voucher.usedCount})`;
      if (startedAlready && form.startDate !== voucher.startDate)
        errs.startDate = 'Không thể sửa ngày bắt đầu khi voucher đã chạy';
      if (form.expiry < voucher.expiry)
        errs.expiry = 'Không được rút ngắn ngày kết thúc';
    }
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSave({ ...form, value: Number(form.value), stock: Number(form.stock), usesPerUser: Number(form.usesPerUser), minOrder: Number(form.minOrder), maxDiscount: Number(form.maxDiscount), pointCost: Number(form.pointCost) });
    onClose();
  };

  const Field = ({ label, fieldKey, type = 'text', children, note }) => (
    <div>
      <label className="text-cinema-muted text-xs mb-1 block">
        {label}
        {locked(fieldKey) && <span className="ml-1 text-red-400 text-[10px]">🔒 Không thể sửa</span>}
        {note && <span className="ml-1 text-yellow-400 text-[10px]">{note}</span>}
      </label>
      {children || (
        <input
          type={type}
          disabled={locked(fieldKey)}
          className={`input-field ${locked(fieldKey) ? 'opacity-50 cursor-not-allowed bg-cinema-dark' : ''}`}
          value={form[fieldKey] || ''}
          onChange={e => f(fieldKey, e.target.value)}
        />
      )}
      {errors[fieldKey] && <p className="text-red-400 text-xs mt-1">{errors[fieldKey]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-cinema-card border border-cinema-border rounded-2xl p-6 w-full max-w-lg shadow-card-hover overflow-y-auto max-h-[90vh]">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-heading font-bold text-white text-lg">✏️ Cập Nhật Voucher</h3>
            <p className="text-cinema-muted text-xs mt-1">
              {hasUsed
                ? <span className="text-yellow-400">⚠️ Voucher đã có {voucher.usedCount} lượt dùng – một số trường bị khoá</span>
                : <span className="text-green-400">✅ Chưa có lượt dùng – được sửa tất cả</span>}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Field label="Tên chương trình" fieldKey="name" />
          <Field label="Mã voucher" fieldKey="code" note={hasUsed ? '🔒' : ''} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Loại giảm giá" fieldKey="type">
              <select disabled={locked('type')} className={`input-field cursor-pointer ${locked('type') ? 'opacity-50 cursor-not-allowed bg-cinema-dark' : ''}`}
                value={form.type} onChange={e => f('type', e.target.value)}>
                <option value="percent">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (đ)</option>
              </select>
            </Field>
            <Field label="Giá trị" fieldKey="value" type="number" />
          </div>
          {form.type === 'percent' && (
            <Field label="Giảm tối đa (đ)" fieldKey="maxDiscount" type="number" />
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-cinema-muted text-xs mb-1 block">
                Số lượng
                {hasUsed && <span className="ml-1 text-yellow-400 text-[10px]">⚠️ Chỉ được tăng (đã dùng: {voucher.usedCount})</span>}
              </label>
              <input type="number" min={voucher.usedCount} className="input-field"
                value={form.stock} onChange={e => f('stock', e.target.value)} />
              {errors.stock && <p className="text-red-400 text-xs mt-1">{errors.stock}</p>}
            </div>
            <Field label="Số lần dùng/user" fieldKey="usesPerUser" type="number" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-cinema-muted text-xs mb-1 block">
                Ngày bắt đầu
                {hasUsed && startedAlready && <span className="ml-1 text-red-400 text-[10px]">🔒 Đã bắt đầu</span>}
                {hasUsed && !startedAlready && <span className="ml-1 text-yellow-400 text-[10px]">⚠️ Chưa bắt đầu – được sửa</span>}
              </label>
              <DatePickerInput
                value={form.startDate || ''}
                onChange={iso => {
                  if (hasUsed && startedAlready) return;
                  f('startDate', iso);
                }}
                disabled={hasUsed && startedAlready}
                className={`input-field ${hasUsed && startedAlready ? 'opacity-50' : ''}`}
              />
              {errors.startDate && <p className="text-red-400 text-xs mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="text-cinema-muted text-xs mb-1 block">
                Ngày kết thúc
                {hasUsed && <span className="ml-1 text-yellow-400 text-[10px]">⚠️ Chỉ được gia hạn thêm</span>}
              </label>
              <DatePickerInput
                value={form.expiry}
                onChange={iso => f('expiry', iso)}
                minISO={hasUsed ? voucher.expiry : undefined}
                className="input-field"
              />
              {errors.expiry && <p className="text-red-400 text-xs mt-1">{errors.expiry}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Đơn tối thiểu (đ)" fieldKey="minOrder" type="number" />
            <Field label="Điểm đổi" fieldKey="pointCost" type="number" />
          </div>
          <Field label="Mô tả" fieldKey="desc" />
          <div>
            <label className="text-cinema-muted text-xs mb-1 block">Trạng thái</label>
            <select className="input-field cursor-pointer" value={form.active ? 'true' : 'false'}
              onChange={e => f('active', e.target.value === 'true')}>
              <option value="true">● Hoạt động</option>
              <option value="false">○ Vô hiệu</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 btn-outline py-2.5 text-sm">Hủy</button>
          <button onClick={handleSave} className="flex-1 btn-primary py-2.5 text-sm">Lưu thay đổi</button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────
export default function AdminVouchers() {
  const [vouchers, setVouchers] = useState(MOCK_VOUCHERS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);

  const { addNotification, addToast } = useNotificationStore();

  useEffect(() => {
    setLoading(true);
    promotionService.getAll()
      .then((res) => {
        console.log("Raw promotions response:", res);
        // Cấu trúc thực tế: { data: [...] }
        const data = res?.data || res?.content || (Array.isArray(res) ? res : []);
        
        if (data.length > 0) {
          const normalized = data.map(v => ({
            ...v,
            id: v.id,
            code: v.promotionCode || v.code || 'NO_CODE',
            name: v.promotionName || v.name || v.description || '',
            type: String(v.discountType || v.type || '').toLowerCase().includes('percent') ? 'percent' : 'fixed',
            value: v.discountValue || v.value || 0,
            maxDiscount: v.maxDiscountAmount || v.maxDiscount || 0,
            minOrder: v.minOrderAmount || v.minOrder || 0,
            desc: v.description || v.desc || '',
            // Định dạng từ BE: dd-MM-yyyy HH:mm:ss -> cần đổi sang yyyy-MM-dd để dùng DatePicker
            startDate: formatBEToISO(v.startDate),
            expiry: formatBEToISO(v.endDate || v.expiry),
            stock: v.usageLimit || v.stock || 0,
            usedCount: v.usageCount || v.usedCount || 0,
            usesPerUser: v.usagePerUser || v.usesPerUser || 1,
            active: String(v.status || '').toLowerCase() === 'active',
            pointCost: v.pointCost || 0,
          }));
          setVouchers(normalized);
        } else {
          setVouchers([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch vouchers:", err);
        addToast('Lỗi kết nối API Voucher.', 'error');
        setVouchers(MOCK_VOUCHERS);
      })
      .finally(() => setLoading(false));
  }, []);

  // Helper để đổi dd-MM-yyyy sang yyyy-MM-dd
  const formatBEToISO = (str) => {
    if (!str || typeof str !== 'string') return '';
    const datePart = str.split(' ')[0]; // dd-MM-yyyy
    const parts = datePart.split('-');
    if (parts.length === 3) {
      // Nếu là dd-MM-yyyy
      if (parts[0].length === 2) return `${parts[2]}-${parts[1]}-${parts[0]}`;
      // Nếu đã là yyyy-MM-dd
      return datePart;
    }
    return '';
  };

  const filtered = vouchers.filter(v => {
    const matchSearch = v.code.toLowerCase().includes(search.toLowerCase()) ||
      v.desc.toLowerCase().includes(search.toLowerCase()) ||
      (v.name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || (filterStatus === 'active' ? v.active : !v.active);
    return matchSearch && matchStatus;
  });



  const toggleActive = (id) => {
    const v = vouchers.find(x => x.id === id);
    if (v) {
      addNotification({ title: 'Trạng thái voucher', message: `Đã ${v.active ? 'vô hiệu hóa' : 'kích hoạt'} voucher: ${v.code}`, type: v.active ? 'warn' : 'success', isAdmin: true });
    }
    setVouchers(prev => prev.map(v => v.id === id ? { ...v, active: !v.active } : v));
  };
  
  const deleteVoucher = (id) => {
    const v = vouchers.find(x => x.id === id);
    if (v) {
      addNotification({ title: 'Thành công', message: `Đã xoá hiển thị voucher: ${v.code}`, type: 'success', isAdmin: true });
    }
    setVouchers(prev => prev.filter(v => v.id !== id));
  };
  
  const handleAdd = (nv) => {
    setVouchers(prev => [nv, ...prev]);
    addNotification({ title: 'Thành công', message: `Đã thêm voucher mới: ${nv.code}`, type: 'success', isAdmin: true });
  };
  
  const handleSave = (updated) => {
    setVouchers(prev => prev.map(v => v.id === updated.id ? updated : v));
    addNotification({ title: 'Thành công', message: `Đã cập nhật voucher: ${updated.code}`, type: 'success', isAdmin: true });
  };

  const stats = {
    total: vouchers.length,
    active: vouchers.filter(v => v.active).length,
    expired: vouchers.filter(v => new Date(v.expiry) < new Date()).length,
    pointBased: vouchers.filter(v => v.pointCost > 0).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-extrabold text-2xl text-white">Quản lý Voucher</h2>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm Voucher
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Tổng voucher',   value: stats.total,     icon: '🎫', color: 'border-blue-500/30 bg-blue-500/5' },
          { label: 'Đang hoạt động', value: stats.active,    icon: '✅', color: 'border-green-500/30 bg-green-500/5' },
          { label: 'Hết hạn',        value: stats.expired,   icon: '⏰', color: 'border-red-500/30 bg-red-500/5' },
          { label: 'Đổi bằng điểm',  value: stats.pointBased, icon: '⭐', color: 'border-primary/30 bg-primary/5' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`rounded-xl border p-4 ${stat.color}`}>
            <div className="text-2xl mb-2">{stat.icon}</div>
            <p className="font-heading font-bold text-xl text-white">{stat.value}</p>
            <p className="text-cinema-muted text-xs mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Tìm theo mã, tên, mô tả..." className="input-field max-w-xs" />
        <div className="flex gap-1 bg-cinema-surface rounded-lg p-1 border border-cinema-border">
          {[{ key: 'all', label: 'Tất cả' }, { key: 'active', label: '✅ Hoạt động' }, { key: 'inactive', label: '🔴 Vô hiệu' }].map(f => (
            <button key={f.key} onClick={() => setFilterStatus(f.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filterStatus === f.key ? 'bg-primary text-cinema-black' : 'text-cinema-muted hover:text-white'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-cinema-surface rounded-xl border border-cinema-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cinema-border bg-cinema-dark">
                {['Mã / Tên', 'Giá trị', 'Tối đa', 'Đơn tối thiểu', 'Số lượng', 'Lần/user', 'Ngày BĐ – KT', 'Điểm', 'Trạng thái', 'Thao tác'].map(h => (
                  <th key={h} className="text-left px-3 py-3 text-cinema-muted text-xs font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cinema-border/50">
              {filtered.map(v => {
                const isExpired = new Date(v.expiry) < new Date();
                const daysLeft = Math.ceil((new Date(v.expiry) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <tr key={v.id} className="hover:bg-cinema-card/50 transition-colors">
                    <td className="px-3 py-3">
                      <span className="font-mono font-bold text-primary tracking-wider bg-primary/10 px-2 py-0.5 rounded text-xs">{v.code}</span>
                      <p className="text-cinema-muted text-xs mt-1 max-w-[140px] truncate">{v.name || v.desc}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`font-heading font-bold text-base ${v.type === 'percent' ? 'text-accent' : 'text-primary'}`}>
                        {v.type === 'percent' ? `${v.value}%` : `${(v.value / 1000).toFixed(0)}K`}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-cinema-muted text-sm">
                      {v.maxDiscount > 0 ? `${(v.maxDiscount / 1000).toFixed(0)}K` : '—'}
                    </td>
                    <td className="px-3 py-3 text-cinema-muted text-sm">
                      {v.minOrder > 0 ? `${(v.minOrder / 1000).toFixed(0)}K` : '—'}
                    </td>
                    <td className="px-3 py-3 text-sm">
                      <span className="text-white font-semibold">{v.stock}</span>
                      {v.usedCount > 0 && <span className="text-cinema-muted text-[10px] ml-1">(dùng: {v.usedCount})</span>}
                    </td>
                    <td className="px-3 py-3 text-white text-sm text-center">{v.usesPerUser || 1}</td>
                    <td className="px-3 py-3">
                      <p className="text-cinema-muted text-[11px]">{fmtDate(v.startDate)}</p>
                      <p className={`text-[11px] font-semibold ${isExpired ? 'text-red-400' : daysLeft <= 7 ? 'text-orange-400' : 'text-green-400'}`}>
                        → {fmtDate(v.expiry)}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-sm">
                      {v.pointCost > 0 ? <span className="flex items-center gap-1 text-yellow-400">⭐ {v.pointCost}</span> : <span className="text-cinema-muted">—</span>}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`badge text-xs border ${!v.active ? 'bg-red-500/20 border-red-500/30 text-red-400' : isExpired ? 'bg-orange-500/20 border-orange-500/30 text-orange-400' : 'bg-green-500/20 border-green-500/30 text-green-400'}`}>
                        {!v.active ? '○ Vô hiệu' : isExpired ? '⏰ Hết hạn' : '● Hoạt động'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => setEditingVoucher(v)}
                          className="px-2.5 py-1.5 rounded-lg border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 text-xs transition-all">Sửa</button>
                        <button onClick={() => toggleActive(v.id)}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs transition-all ${v.active ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'}`}>
                          {v.active ? 'Tắt' : 'Bật'}
                        </button>
                        <button onClick={() => deleteVoucher(v.id)}
                          className="px-2.5 py-1.5 rounded-lg border border-cinema-border text-cinema-muted hover:border-red-500/50 hover:text-red-400 text-xs transition-all">Xóa</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="text-center py-12 text-cinema-muted">
                  <p className="text-4xl mb-3">🎫</p><p>Không tìm thấy voucher nào</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <AddVoucherModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
      {editingVoucher && <EditVoucherModal voucher={editingVoucher} onClose={() => setEditingVoucher(null)} onSave={handleSave} />}
    </div>
  );
}
