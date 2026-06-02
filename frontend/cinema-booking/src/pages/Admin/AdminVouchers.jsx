import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import useNotificationStore from '../../store/notificationStore';
import DatePickerInput from '../../components/ui/DatePickerInput';
import promotionService from '../../services/promotionService';

// ── Field helper — phải đặt NGOÀI VoucherModal để tránh remount mỗi render ──
function Field({ label, fieldKey, type = 'text', note, form, onChange, errors, locked, children }) {
  const isLocked = locked?.(fieldKey);
  return (
    <div>
      <label className="text-cinema-muted text-xs mb-1 block">
        {label}
        {isLocked && <span className="ml-1 text-red-400 text-[10px]">🔒</span>}
        {note && <span className="ml-1 text-yellow-400 text-[10px]">{note}</span>}
      </label>
      {children || (
        <input
          type={type}
          disabled={isLocked}
          className={`input-field ${isLocked ? 'opacity-50 cursor-not-allowed bg-cinema-dark' : ''}`}
          value={form[fieldKey] ?? ''}
          onChange={e => onChange(fieldKey, e.target.value)}
        />
      )}
      {errors?.[fieldKey] && <p className="text-red-400 text-xs mt-1">{errors[fieldKey]}</p>}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────
function fmt(n) { return new Intl.NumberFormat('vi-VN').format(n ?? 0); }
function fmtDate(d) {
  if (!d) return '—';
  const s = typeof d === 'string' ? d : new Date(d).toISOString();
  // if already DD/MM/YYYY or DD-MM-YYYY
  if (/^\d{2}[-/]\d{2}[-/]\d{4}/.test(s)) {
    const [day, month, year] = s.slice(0, 10).split(/[-/]/);
    return `${day}/${month}/${year}`;
  }
  const [y, m, day] = s.slice(0, 10).split('-');
  return `${day}/${m}/${y}`;
}
// "2024-06-01" → "01-06-2024 00:00:00" (BE expects dd-MM-yyyy HH:mm:ss)
function toBackendDate(iso) { 
  if (!iso) return null;
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}-${m}-${y} 00:00:00`;
}
// Date/string → "YYYY-MM-DD"
function toIso(d) {
  if (!d) return '';
  if (typeof d === 'string') {
    if (/^\d{2}-\d{2}-\d{4}/.test(d)) {
      const [day, month, year] = d.split(' ')[0].split('-');
      return `${year}-${month}-${day}`;
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(d)) {
      return d.slice(0, 10);
    }
  }
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch (e) {
    return '';
  }
}

// Normalize PromotionDTO → UI object
function normalize(p) {
  return {
    id: p.id,
    code: p.promotionCode || '',
    name: p.promotionName || '',
    desc: p.description || '',
    type: p.discountType === 'PERCENTAGE' ? 'percent' : 'fixed',   // PERCENTAGE | FIXED_AMOUNT
    value: Number(p.discountValue) || 0,
    maxDiscount: Number(p.maxDiscountAmount) || 0,
    minOrder: Number(p.minOrderAmount) || 0,
    stock: p.usageLimit || 0,
    usedCount: p.usageCount || 0,
    usesPerUser: p.usagePerUser || 1,
    startDate: toIso(p.startDate),
    expiry: toIso(p.endDate),
    active: (p.status?.toString?.()?.toLowerCase?.() ?? '') === 'active',
    imageUrl: p.imageUrl || '',
    applicableDay: p.applicableDay || '',
    applicableMovie: p.applicableMovie || '',
    applicableCinema: p.applicableCinema || '',
    requiredRank: p.requiredRank || 'all',
    requiredPoints: Number(p.requiredPoints) || 0,
  };
}

// Build payload cho BE
function toPayload(form) {
  return {
    promotionCode: form.code.toUpperCase(),
    promotionName: form.name || form.code.toUpperCase(),
    description: form.desc || '',
    discountType: form.type === 'percent' ? 'PERCENTAGE' : 'FIXED_AMOUNT',
    discountValue: Number(form.value) || 0,
    maxDiscountAmount: Number(form.maxDiscount) || 0,
    minOrderAmount: Number(form.minOrder) || 0,
    usageLimit: Number(form.stock) || 0,
    usageCount: 0,
    usagePerUser: Number(form.usesPerUser) || 1,
    startDate: toBackendDate(form.startDate),
    endDate: toBackendDate(form.expiry),
    applicableDay: form.applicableDay || '',
    applicableMovie: form.applicableMovie || '',
    applicableCinema: form.applicableCinema || '',
    requiredRank: form.requiredRank || 'all',
    requiredPoints: Number(form.requiredPoints) || 0,
    status: form.active ? 'ACTIVE' : 'INACTIVE',
    imageUrl: form.imageUrl || '',
  };
}

const EMPTY_FORM = {
  code: '', name: '', type: 'percent', value: '', maxDiscount: '',
  minOrder: '', desc: '', startDate: new Date().toISOString().split('T')[0],
  expiry: '', stock: '', usesPerUser: 1, active: true,
  imageUrl: '', applicableDay: '', applicableMovie: '', applicableCinema: '',
  requiredRank: 'all', requiredPoints: 0,
};

// ── Add / Edit Modal ─────────────────────────────────────────
function VoucherModal({ initial, onClose, onSave, saving }) {
  const isEdit = !!initial?.id;
  const hasUsed = isEdit && (initial.usedCount || 0) > 0;
  const [form, setForm] = useState(initial ? { ...initial } : { ...EMPTY_FORM });
  const [errors, setErrors] = useState({});
  const f = useCallback((key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: null }));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.code.trim()) e.code = 'Bắt buộc';
    if (!form.value || Number(form.value) <= 0) e.value = 'Phải > 0';
    if (!form.expiry) e.expiry = 'Bắt buộc';
    if (!form.stock || Number(form.stock) <= 0) e.stock = 'Phải > 0';
    if (isEdit && hasUsed && Number(form.stock) < initial.usedCount)
      e.stock = `Không được < số đã dùng (${initial.usedCount})`;
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form);
  };

  const locked = useCallback((field) =>
    isEdit && hasUsed && ['code', 'type', 'value', 'maxDiscount'].includes(field)
  , [isEdit, hasUsed]);

  const sharedFieldProps = { form, onChange: f, errors, locked };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-cinema-card border border-cinema-border rounded-2xl p-6 w-full max-w-lg shadow-card-hover overflow-y-auto max-h-[92vh]">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-heading font-bold text-white text-lg">{isEdit ? '✏️ Cập nhật Voucher' : '➕ Thêm Voucher Mới'}</h3>
            {isEdit && (
              <p className="text-xs mt-1">
                {hasUsed
                  ? <span className="text-yellow-400">⚠️ Đã có {initial.usedCount} lượt dùng – một số trường bị khoá</span>
                  : <span className="text-green-400">✅ Chưa dùng – sửa được tất cả</span>}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Field label="Tên chương trình" fieldKey="name" {...sharedFieldProps} />

          {/* Mã voucher — tự toUpperCase */}
          <div>
            <label className="text-cinema-muted text-xs mb-1 block">
              Mã voucher *
              {locked('code') && <span className="ml-1 text-red-400 text-[10px]">🔒</span>}
            </label>
            <input
              disabled={locked('code')}
              className={`input-field uppercase ${locked('code') ? 'opacity-50 cursor-not-allowed bg-cinema-dark' : ''}`}
              placeholder="VD: SUMMER20"
              value={form.code}
              onChange={e => f('code', e.target.value.toUpperCase())}
            />
            {errors.code && <p className="text-red-400 text-xs mt-1">{errors.code}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Loại giảm giá */}
            <div>
              <label className="text-cinema-muted text-xs mb-1 block">
                Loại giảm giá *
                {locked('type') && <span className="ml-1 text-red-400 text-[10px]">🔒</span>}
              </label>
              <select
                disabled={locked('type')}
                className={`input-field cursor-pointer ${locked('type') ? 'opacity-50 cursor-not-allowed bg-cinema-dark' : ''}`}
                value={form.type}
                onChange={e => f('type', e.target.value)}
              >
                <option value="percent">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (đ)</option>
              </select>
            </div>
            <Field label="Giá trị *" fieldKey="value" type="number" {...sharedFieldProps} />
          </div>

          {form.type === 'percent' && (
            <Field label="Giảm tối đa (đ)" fieldKey="maxDiscount" type="number" {...sharedFieldProps} />
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Đơn tối thiểu (đ)" fieldKey="minOrder" type="number" {...sharedFieldProps} />
            <div>
              <label className="text-cinema-muted text-xs mb-1 block">
                Số lượng *
                {isEdit && hasUsed && <span className="ml-1 text-yellow-400 text-[10px]">⚠️ Chỉ tăng (đã dùng: {initial.usedCount})</span>}
              </label>
              <input
                type="number" min={isEdit ? initial.usedCount : 0}
                className="input-field" value={form.stock}
                onChange={e => f('stock', e.target.value)}
              />
              {errors.stock && <p className="text-red-400 text-xs mt-1">{errors.stock}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-cinema-muted text-xs mb-1 block">Hạng thành viên yêu cầu</label>
              <select className="input-field cursor-pointer"
                value={form.requiredRank}
                onChange={e => f('requiredRank', e.target.value)}>
                <option value="all">Tất cả (không giới hạn)</option>
                <option value="bronze">Bronze (Đồng)</option>
                <option value="silver">Silver (Bạc)</option>
                <option value="gold">Gold (Vàng)</option>
                <option value="diamond">Diamond (Kim Cương)</option>
              </select>
            </div>
            <div>
              <label className="text-cinema-muted text-xs mb-1 block">Điểm yêu cầu (0 = Miễn phí)</label>
              <input type="number" min="0" className="input-field w-full"
                value={form.requiredPoints} onChange={e => f('requiredPoints', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Số lần dùng / user" fieldKey="usesPerUser" type="number" {...sharedFieldProps} />
            <div>
              <label className="text-cinema-muted text-xs mb-1 block">Ngày bắt đầu</label>
              <DatePickerInput value={form.startDate} onChange={iso => f('startDate', iso)} className="input-field" />
            </div>
            <div>
              <label className="text-cinema-muted text-xs mb-1 block">Ngày kết thúc *</label>
              <DatePickerInput value={form.expiry} onChange={iso => f('expiry', iso)} className="input-field" />
              {errors.expiry && <p className="text-red-400 text-xs mt-1">{errors.expiry}</p>}
            </div>
          </div>

          <Field label="Mô tả" fieldKey="desc" {...sharedFieldProps} />
          <Field label="URL ảnh" fieldKey="imageUrl" {...sharedFieldProps} />

          {isEdit && (
            <div>
              <label className="text-cinema-muted text-xs mb-1 block">Trạng thái</label>
              <select className="input-field cursor-pointer"
                value={form.active ? 'true' : 'false'}
                onChange={e => f('active', e.target.value === 'true')}>
                <option value="true">● Hoạt động</option>
                <option value="false">○ Vô hiệu</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} disabled={saving} className="flex-1 btn-outline py-2.5 text-sm">Hủy</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary py-2.5 text-sm">
            {saving ? 'Đang lưu...' : (isEdit ? 'Lưu thay đổi' : 'Thêm Voucher')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────
export default function AdminVouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const { addNotification } = useNotificationStore();

  const fetchAll = useCallback(async () => {
    try {
      const data = await promotionService.getAll({ size: 500 });
      const raw = Array.isArray(data) ? data : (data?.content || data?.data || []);
      setVouchers(raw.map(normalize));
    } catch (err) {
      console.error('[AdminVouchers] fetch error:', err);
      addNotification({ title: 'Lỗi', message: 'Không thể tải danh sách voucher', type: 'error', isAdmin: true });
    }
  }, [addNotification]);

  useEffect(() => { fetchAll().finally(() => setLoading(false)); }, [fetchAll]);

  const filtered = useMemo(() => {
    return vouchers.filter(v => {
      const q = search.toLowerCase();
      const matchSearch = v.code.toLowerCase().includes(q) ||
        v.name.toLowerCase().includes(q) ||
        v.desc.toLowerCase().includes(q);
      const matchStatus = filterStatus === 'all'
        || (filterStatus === 'active' && v.active && new Date(v.expiry) >= new Date())
        || (filterStatus === 'inactive' && !v.active)
        || (filterStatus === 'expired' && new Date(v.expiry) < new Date());
      return matchSearch && matchStatus;
    });
  }, [vouchers, search, filterStatus]);

  const stats = useMemo(() => ({
    total: vouchers.length,
    active: vouchers.filter(v => v.active && new Date(v.expiry) >= new Date()).length,
    expired: vouchers.filter(v => new Date(v.expiry) < new Date()).length,
    inactive: vouchers.filter(v => !v.active).length,
  }), [vouchers]);

  // Tạo mới
  const handleAdd = async (form) => {
    setSaving(true);
    try {
      await promotionService.create(toPayload(form));
      addNotification({ title: 'Thành công', message: `Đã thêm voucher: ${form.code.toUpperCase()}`, type: 'success', isAdmin: true });
      setShowAdd(false);
      await fetchAll();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể tạo voucher';
      addNotification({ title: 'Lỗi', message: msg, type: 'error', isAdmin: true });
    } finally {
      setSaving(false);
    }
  };

  // Cập nhật
  const handleSave = async (form) => {
    setSaving(true);
    try {
      const payload = toPayload(form);
      // Giữ usageCount hiện tại
      payload.usageCount = editingVoucher?.usedCount || 0;
      await promotionService.update(form.id, payload);
      addNotification({ title: 'Thành công', message: `Đã cập nhật voucher: ${form.code}`, type: 'success', isAdmin: true });
      setEditingVoucher(null);
      await fetchAll();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể cập nhật';
      addNotification({ title: 'Lỗi', message: msg, type: 'error', isAdmin: true });
    } finally {
      setSaving(false);
    }
  };

  // Bật/tắt
  const toggleActive = async (v) => {
    setSaving(true);
    try {
      const payload = {
        ...toPayload(v),
        usageCount: v.usedCount,
        status: v.active ? 'INACTIVE' : 'ACTIVE',
      };
      await promotionService.update(v.id, payload);
      addNotification({ title: 'Thành công', message: `Đã ${v.active ? 'vô hiệu' : 'kích hoạt'} voucher: ${v.code}`, type: v.active ? 'warn' : 'success', isAdmin: true });
      await fetchAll();
    } catch (err) {
      addNotification({ title: 'Lỗi', message: err.message, type: 'error', isAdmin: true });
    } finally {
      setSaving(false);
    }
  };

  // Xoá
  const handleDelete = async (v) => {
    if (!window.confirm(`Xoá voucher "${v.code}"?`)) return;
    setSaving(true);
    try {
      await promotionService.remove(v.id);
      addNotification({ title: 'Thành công', message: `Đã xoá voucher: ${v.code}`, type: 'success', isAdmin: true });
      await fetchAll();
    } catch (err) {
      addNotification({ title: 'Lỗi', message: err.message || 'Không thể xoá', type: 'error', isAdmin: true });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="ml-3 text-cinema-muted">Đang tải voucher...</span>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
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
          { label: 'Tổng voucher',   value: stats.total,    icon: '🎫', color: 'border-blue-500/30 bg-blue-500/5' },
          { label: 'Đang hoạt động', value: stats.active,   icon: '✅', color: 'border-green-500/30 bg-green-500/5' },
          { label: 'Hết hạn',        value: stats.expired,  icon: '⏰', color: 'border-red-500/30 bg-red-500/5' },
          { label: 'Vô hiệu',        value: stats.inactive, icon: '🔴', color: 'border-gray-500/30 bg-gray-500/5' },
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
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'active', label: '✅ Hoạt động' },
            { key: 'expired', label: '⏰ Hết hạn' },
            { key: 'inactive', label: '🔴 Vô hiệu' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setFilterStatus(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filterStatus === tab.key ? 'bg-primary text-cinema-black' : 'text-cinema-muted hover:text-white'}`}>
              {tab.label}
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
                {['Mã / Tên', 'Loại & Giá trị', 'Điểm đổi', 'Số lượng', 'Lần/user', 'Ngày BĐ – KT', 'Trạng thái', 'Thao tác'].map(h => (
                  <th key={h} className="text-left px-3 py-3 text-cinema-muted text-xs font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cinema-border/50">
              {filtered.map(v => {
                const isExpired = v.expiry && new Date(v.expiry) < new Date();
                const daysLeft = v.expiry ? Math.ceil((new Date(v.expiry) - new Date()) / 86400000) : 0;
                const statusColor = !v.active
                  ? 'bg-gray-500/20 border-gray-500/30 text-gray-400'
                  : isExpired
                    ? 'bg-orange-500/20 border-orange-500/30 text-orange-400'
                    : 'bg-green-500/20 border-green-500/30 text-green-400';
                const statusLabel = !v.active ? '○ Vô hiệu' : isExpired ? '⏰ Hết hạn' : '● Hoạt động';

                return (
                  <tr key={v.id} className="hover:bg-cinema-card/50 transition-colors">
                    <td className="px-3 py-3">
                      <span className="font-mono font-bold text-primary tracking-wider bg-primary/10 px-2 py-0.5 rounded text-xs">{v.code}</span>
                      <p className="text-cinema-muted text-xs mt-1 max-w-[160px] truncate">{v.name || v.desc}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`font-heading font-bold text-base ${v.type === 'percent' ? 'text-accent' : 'text-primary'}`}>
                        {v.type === 'percent' ? `${v.value}%` : `${fmt(v.value)}đ`}
                      </span>
                      <p className="text-cinema-muted text-[10px]">{v.type === 'percent' ? 'Phần trăm' : 'Cố định'}</p>
                    </td>
                    <td className="px-3 py-3 text-sm">
                      <span className="font-bold text-yellow-400">{v.requiredPoints > 0 ? v.requiredPoints : 'Miễn phí'}</span>
                    </td>
                    <td className="px-3 py-3 text-sm">
                      <span className="text-white font-semibold">{v.stock}</span>
                      {v.usedCount > 0 && <span className="text-cinema-muted text-[10px] ml-1">(dùng: {v.usedCount})</span>}
                    </td>
                    <td className="px-3 py-3 text-white text-sm text-center">{v.usesPerUser}</td>
                    <td className="px-3 py-3">
                      <p className="text-cinema-muted text-[11px]">{fmtDate(v.startDate)}</p>
                      <p className={`text-[11px] font-semibold ${isExpired ? 'text-red-400' : daysLeft <= 7 ? 'text-orange-400' : 'text-green-400'}`}>
                        → {fmtDate(v.expiry)}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`badge text-xs border ${statusColor}`}>{statusLabel}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => setEditingVoucher(v)} disabled={saving}
                          className="px-2.5 py-1.5 rounded-lg border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 text-xs transition-all">Sửa</button>
                        <button onClick={() => toggleActive(v)} disabled={saving}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs transition-all ${v.active ? 'border-orange-500/30 text-orange-400 hover:bg-orange-500/10' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'}`}>
                          {v.active ? 'Tắt' : 'Bật'}
                        </button>
                        <button onClick={() => handleDelete(v)} disabled={saving}
                          className="px-2.5 py-1.5 rounded-lg border border-cinema-border text-cinema-muted hover:border-red-500/50 hover:text-red-400 text-xs transition-all">Xóa</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="text-center py-12 text-cinema-muted">
                  <p className="text-4xl mb-3">🎫</p>
                  <p>{vouchers.length === 0 ? 'Chưa có voucher nào' : 'Không tìm thấy voucher khớp'}</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAdd && (
        <VoucherModal
          initial={null}
          onClose={() => setShowAdd(false)}
          onSave={handleAdd}
          saving={saving}
        />
      )}
      {editingVoucher && (
        <VoucherModal
          initial={editingVoucher}
          onClose={() => setEditingVoucher(null)}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}
