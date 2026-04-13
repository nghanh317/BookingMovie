import { useState } from 'react';
import { motion } from 'framer-motion';
import { VOUCHERS } from '../../constants/mockData';

const TYPE_LABEL = { percent: 'Phần trăm', fixed: 'Số tiền cố định' };

function AddVoucherModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    code: '', type: 'percent', value: '', minOrder: '', desc: '', expiry: '', stock: '', pointCost: 0,
  });

  const handleAdd = () => {
    if (!form.code || !form.value || !form.expiry || !form.stock) return;
    onAdd({
      id: 'V' + Date.now(),
      code: form.code.toUpperCase(),
      type: form.type,
      value: Number(form.value),
      minOrder: Number(form.minOrder) || 0,
      desc: form.desc || `Giảm ${form.value}${form.type === 'percent' ? '%' : '000đ'}`,
      expiry: form.expiry,
      stock: Number(form.stock),
      active: true,
      isPublic: true,
      pointCost: Number(form.pointCost) || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-cinema-card border border-cinema-border rounded-2xl p-6 w-full max-w-md shadow-card-hover"
      >
        <h3 className="font-heading font-bold text-white text-lg mb-5">➕ Thêm Voucher Mới</h3>
        <div className="space-y-3">
          <div>
            <label className="text-cinema-muted text-xs mb-1 block">Mã voucher *</label>
            <input className="input-field uppercase" placeholder="VD: SUMMER20"
              value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-cinema-muted text-xs mb-1 block">Loại giảm giá *</label>
              <select className="input-field cursor-pointer" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="percent">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (đ)</option>
              </select>
            </div>
            <div>
              <label className="text-cinema-muted text-xs mb-1 block">Giá trị *</label>
              <input type="number" className="input-field" placeholder={form.type === 'percent' ? '20' : '50000'}
                value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-cinema-muted text-xs mb-1 block">Đơn tối thiểu (đ)</label>
              <input type="number" className="input-field" placeholder="100000"
                value={form.minOrder} onChange={e => setForm({ ...form, minOrder: e.target.value })} />
            </div>
            <div>
              <label className="text-cinema-muted text-xs mb-1 block">Số lượng *</label>
              <input type="number" className="input-field" placeholder="100"
                value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-cinema-muted text-xs mb-1 block">Hạn sử dụng *</label>
            <input type="date" className="input-field" value={form.expiry}
              onChange={e => setForm({ ...form, expiry: e.target.value })} />
          </div>
          <div>
            <label className="text-cinema-muted text-xs mb-1 block">Điểm cần đổi (0 = tặng tự động)</label>
            <input type="number" className="input-field" placeholder="0"
              value={form.pointCost} onChange={e => setForm({ ...form, pointCost: e.target.value })} />
          </div>
          <div>
            <label className="text-cinema-muted text-xs mb-1 block">Mô tả</label>
            <input className="input-field" placeholder="Mô tả ngắn về voucher"
              value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} />
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

export default function AdminVouchers() {
  const [vouchers, setVouchers] = useState(VOUCHERS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAdd, setShowAdd] = useState(false);

  const filtered = vouchers.filter(v => {
    const matchSearch = v.code.toLowerCase().includes(search.toLowerCase()) || v.desc.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || (filterStatus === 'active' ? v.active : !v.active);
    return matchSearch && matchStatus;
  });

  const toggleActive = (id) => {
    setVouchers(prev => prev.map(v => v.id === id ? { ...v, active: !v.active } : v));
  };

  const deleteVoucher = (id) => {
    setVouchers(prev => prev.filter(v => v.id !== id));
  };

  const handleAdd = (newVoucher) => {
    setVouchers(prev => [newVoucher, ...prev]);
  };

  const stats = {
    total: vouchers.length,
    active: vouchers.filter(v => v.active).length,
    expired: vouchers.filter(v => new Date(v.expiry) < new Date()).length,
    pointBased: vouchers.filter(v => v.pointCost > 0).length,
  };

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
          { label: 'Tổng voucher',     value: stats.total,     icon: '🎫', color: 'border-blue-500/30 bg-blue-500/5' },
          { label: 'Đang hoạt động',   value: stats.active,    icon: '✅', color: 'border-green-500/30 bg-green-500/5' },
          { label: 'Hết hạn',          value: stats.expired,   icon: '⏰', color: 'border-red-500/30 bg-red-500/5' },
          { label: 'Đổi bằng điểm',    value: stats.pointBased, icon: '⭐', color: 'border-primary/30 bg-primary/5' },
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
          placeholder="🔍 Tìm theo mã hoặc mô tả..." className="input-field max-w-xs" />
        <div className="flex gap-1 bg-cinema-surface rounded-lg p-1 border border-cinema-border">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'active', label: '✅ Hoạt động' },
            { key: 'inactive', label: '🔴 Vô hiệu' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilterStatus(f.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filterStatus === f.key ? 'bg-primary text-cinema-black' : 'text-cinema-muted hover:text-white'
              }`}>{f.label}
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
                {['Mã voucher', 'Mô tả', 'Giá trị', 'Đơn tối thiểu', 'Đổi điểm', 'Số lượng', 'Hạn dùng', 'Trạng thái', 'Thao tác'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-cinema-muted text-xs font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cinema-border/50">
              {filtered.map(v => {
                const isExpired = new Date(v.expiry) < new Date();
                const daysLeft = Math.ceil((new Date(v.expiry) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <tr key={v.id} className="hover:bg-cinema-card/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-primary tracking-widest bg-primary/10 px-2 py-0.5 rounded text-sm">
                        {v.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-cinema-muted text-sm max-w-[180px]">
                      <p className="line-clamp-2">{v.desc}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-heading font-bold text-base ${v.type === 'percent' ? 'text-accent' : 'text-primary'}`}>
                        {v.type === 'percent' ? `${v.value}%` : `${(v.value/1000).toFixed(0)}K`}
                      </span>
                      <p className="text-cinema-muted text-[10px]">{TYPE_LABEL[v.type]}</p>
                    </td>
                    <td className="px-4 py-3 text-cinema-muted text-sm">
                      {v.minOrder > 0 ? `${(v.minOrder/1000).toFixed(0)}K` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {v.pointCost > 0
                        ? <span className="flex items-center gap-1 text-yellow-400">⭐ {v.pointCost}</span>
                        : <span className="text-cinema-muted">—</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-white font-semibold text-sm">{v.stock}</td>
                    <td className="px-4 py-3">
                      <p className="text-cinema-muted text-xs">{new Date(v.expiry).toLocaleDateString('vi-VN')}</p>
                      {!isExpired
                        ? <p className={`text-[10px] mt-0.5 ${daysLeft <= 7 ? 'text-orange-400' : 'text-green-400'}`}>
                            Còn {daysLeft} ngày
                          </p>
                        : <p className="text-[10px] mt-0.5 text-red-400">Đã hết hạn</p>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs border ${
                        !v.active
                          ? 'bg-red-500/20 border-red-500/30 text-red-400'
                          : isExpired
                          ? 'bg-orange-500/20 border-orange-500/30 text-orange-400'
                          : 'bg-green-500/20 border-green-500/30 text-green-400'
                      }`}>
                        {!v.active ? '○ Vô hiệu' : isExpired ? '⏰ Hết hạn' : '● Hoạt động'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => toggleActive(v.id)}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
                            v.active
                              ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                              : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                          }`}>
                          {v.active ? 'Tắt' : 'Bật'}
                        </button>
                        <button onClick={() => deleteVoucher(v.id)}
                          className="px-2.5 py-1.5 rounded-lg border border-cinema-border text-cinema-muted hover:border-red-500/50 hover:text-red-400 text-xs transition-all">
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-cinema-muted">
                    <p className="text-4xl mb-3">🎫</p>
                    <p>Không tìm thấy voucher nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <AddVoucherModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
    </div>
  );
}
