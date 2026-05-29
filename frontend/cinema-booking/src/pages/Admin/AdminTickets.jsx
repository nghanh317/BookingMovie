import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ticketService from '../../services/ticketService';

// ─── Helpers ───────────────────────────────────────────────────────────────

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  let d;
  if (typeof dateStr === 'string' && dateStr.includes('-') && dateStr.split('-')[0].length === 2) {
    const [datePart, timePart] = dateStr.split(' ');
    const [dd, mm, yyyy] = datePart.split('-');
    d = new Date(`${yyyy}-${mm}-${dd}T${timePart || '00:00:00'}`);
  } else {
    d = new Date(dateStr);
  }
  
  if (isNaN(d.getTime())) return dateStr;
  
  return d.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtMoney(amount) {
  if (amount == null) return '—';
  return Number(amount).toLocaleString('vi-VN') + '₫';
}

const PAYMENT_STATUS_CONFIG = {
  PAID:   { label: 'Đã thanh toán', cls: 'bg-green-500/15 text-green-400 border-green-500/30' },
  UNPAID: { label: 'Chưa thanh toán', cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
};

const STATUS_CONFIG = {
  PENDING:   { label: 'Chờ xác nhận', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  CONFIRMED: { label: 'Đã xác nhận',  cls: 'bg-green-500/15 text-green-400 border-green-500/30' },
  CANCELLED: { label: 'Đã hủy',       cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
};

// ─── Badge component ───────────────────────────────────────────────────────
function Badge({ config, value }) {
  const cfg = config[value] || { label: value, cls: 'bg-cinema-surface text-cinema-muted border-cinema-border' };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ─── Skeleton loading row ──────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-cinema-border animate-pulse">
      {[...Array(8)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 bg-cinema-surface rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

// ─── Ticket Detail Modal ───────────────────────────────────────────────────
function TicketDetailModal({ ticket, onClose, onSave }) {
  const [payStatus, setPayStatus] = useState(ticket.paymentStatus || 'UNPAID');
  const [status, setStatus]       = useState(ticket.status || 'PENDING');
  const [saving, setSaving]       = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await ticketService.update(ticket.id, { paymentStatus: payStatus, status });
      onSave({ ...ticket, paymentStatus: payStatus, status });
    } catch {
      alert('Cập nhật thất bại. Vui lòng thử lại!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative bg-cinema-card border border-cinema-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-cinema-border sticky top-0 bg-cinema-card z-10">
          <div>
            <h3 className="font-heading font-bold text-white text-lg">Chi tiết vé</h3>
            <p className="text-cinema-muted text-xs mt-0.5">#{ticket.ticketsCode || `TK-${ticket.id}`}</p>
          </div>
          <button onClick={onClose} className="text-cinema-muted hover:text-white transition-colors text-xl leading-none">✕</button>
        </div>

        <div className="p-5 space-y-5">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Khách hàng', value: ticket.accountsFullName || '—' },
              { label: 'Ngày đặt', value: fmtDate(ticket.ticketsDate) },
              { label: 'Tổng tiền', value: fmtMoney(ticket.totalAmount) },
              { label: 'Giảm giá', value: fmtMoney(ticket.discountAmount) },
              { label: 'Thành tiền', value: fmtMoney(ticket.finalAmount) },
              { label: 'Ghi chú', value: ticket.note || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-cinema-surface rounded-lg p-3">
                <p className="text-cinema-muted text-[10px] uppercase tracking-wider mb-1">{label}</p>
                <p className="text-white text-sm font-medium">{value}</p>
              </div>
            ))}
          </div>

          {/* QR code */}
          {ticket.qrCodeUrl && (
            <div className="bg-cinema-surface rounded-lg p-3 flex items-center gap-3">
              <img src={ticket.qrCodeUrl} alt="QR Code" className="w-16 h-16 rounded object-contain bg-white p-1" />
              <div>
                <p className="text-cinema-muted text-[10px] uppercase tracking-wider mb-1">QR Code</p>
                <p className="text-white text-xs font-mono break-all">{ticket.qrCodeData || '—'}</p>
              </div>
            </div>
          )}

          {/* Seats */}
          {ticket.seats?.length > 0 && (
            <div>
              <p className="text-cinema-muted text-xs uppercase tracking-wider mb-2">Ghế đã đặt ({ticket.seats.length})</p>
              <div className="flex flex-wrap gap-2">
                {ticket.seats.map(seat => (
                  <div key={seat.seatsId} className="bg-cinema-surface border border-cinema-border rounded-lg px-3 py-1.5 text-xs">
                    <span className="text-white font-bold">{seat.seatsRow}{seat.seatsNumber}</span>
                    <span className="text-cinema-muted ml-1">({seat.seatTypes})</span>
                    <span className="text-primary ml-2">{fmtMoney(seat.seatPrice)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {ticket.ticketsDetails?.length > 0 && (
            <div>
              <p className="text-cinema-muted text-xs uppercase tracking-wider mb-2">Combo / Đồ ăn</p>
              <div className="space-y-1.5">
                {ticket.ticketsDetails.map(d => (
                  <div key={d.id} className="flex items-center justify-between bg-cinema-surface rounded-lg px-3 py-2 text-xs">
                    <span className="text-white">{d.productsName}</span>
                    <div className="flex items-center gap-3 text-cinema-muted">
                      <span>x{d.quantity}</span>
                      <span className="text-primary">{fmtMoney(d.totalPrice)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status update */}
          <div className="border-t border-cinema-border pt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="text-cinema-muted text-[10px] uppercase tracking-wider block mb-1.5">Trạng thái thanh toán</label>
              <select
                value={payStatus}
                onChange={e => setPayStatus(e.target.value)}
                className="input-field w-full text-sm"
              >
                <option value="PAID">Đã thanh toán</option>
                <option value="UNPAID">Chưa thanh toán</option>
              </select>
            </div>
            <div>
              <label className="text-cinema-muted text-[10px] uppercase tracking-wider block mb-1.5">Trạng thái vé</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="input-field w-full text-sm"
              >
                <option value="PENDING">Chờ xác nhận</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="btn-ghost px-5 py-2 text-sm">Đóng</button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary px-5 py-2 text-sm disabled:opacity-60"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Delete confirm modal ──────────────────────────────────────────────────
function DeleteModal({ ticket, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    try {
      await ticketService.remove(ticket.id);
      onDeleted(ticket.id);
    } catch {
      alert('Xóa vé thất bại!');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-cinema-card border border-red-500/30 rounded-2xl shadow-2xl p-6 max-w-sm w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="text-4xl mb-3">🗑️</div>
          <h3 className="font-bold text-white text-lg mb-1">Xác nhận xóa vé</h3>
          <p className="text-cinema-muted text-sm mb-4">
            Bạn có chắc muốn xóa vé <span className="text-white font-medium">#{ticket.ticketsCode || ticket.id}</span>?
            <br />Hành động này không thể hoàn tác.
          </p>
          <div className="flex gap-2 justify-center">
            <button onClick={onClose} className="btn-ghost px-5 py-2 text-sm">Hủy</button>
            <button onClick={handleDelete} disabled={loading}
              className="px-5 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors disabled:opacity-60">
              {loading ? 'Đang xóa...' : 'Xóa vé'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function AdminTickets() {
  const [tickets, setTickets]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  // Pagination
  const [page, setPage]                 = useState(0);
  const [totalPages, setTotalPages]     = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 15;

  // Filters
  const [search, setSearch]             = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [deleteTicket, setDeleteTicket]     = useState(null);

  // Debounce search
  const debounceRef = useRef(null);
  const handleSearchChange = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(0);
    }, 400);
  };

  // Fetch
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        size: PAGE_SIZE,
        sort: 'id,desc',
      };
      if (paymentFilter) params.paymentStatus = paymentFilter;
      if (statusFilter)  params.status = statusFilter;
      // accountId search by keyword — backend supports accountId filter; for name search we pass keyword if backend supports
      const data = await ticketService.getAll(params);
      const content = data?.content ?? data?.data ?? data ?? [];
      setTickets(Array.isArray(content) ? content : []);
      setTotalPages(data?.totalPages ?? 1);
      setTotalElements(data?.totalElements ?? content.length);
    } catch (e) {
      setError('Không thể tải danh sách vé. Vui lòng thử lại!');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [page, paymentFilter, statusFilter]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  // Reset page when filters change
  useEffect(() => { setPage(0); }, [paymentFilter, statusFilter]);

  // Handle update from modal
  const handleSaved = (updated) => {
    setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
    setSelectedTicket(null);
  };

  const handleDeleted = (id) => {
    setTickets(prev => prev.filter(t => t.id !== id));
    setDeleteTicket(null);
    setTotalElements(prev => prev - 1);
  };

  // Client-side search filter on loaded tickets (for name search)
  const displayedTickets = debouncedSearch
    ? tickets.filter(t =>
        (t.accountsFullName || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (t.ticketsCode || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        String(t.id).includes(debouncedSearch)
      )
    : tickets;

  // Stats summary
  const paidCount      = tickets.filter(t => t.paymentStatus === 'PAID').length;
  const confirmedCount = tickets.filter(t => t.status === 'CONFIRMED').length;
  const cancelledCount = tickets.filter(t => t.status === 'CANCELLED').length;
  const totalRevenue   = tickets.filter(t => t.paymentStatus === 'PAID')
    .reduce((s, t) => s + (Number(t.finalAmount) || 0), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-white">Quản lý Vé</h2>
          <p className="text-cinema-muted text-sm mt-0.5">
            Xem, cập nhật trạng thái và quản lý toàn bộ vé trong hệ thống
          </p>
        </div>
        <button
          onClick={fetchTickets}
          className="btn-ghost px-4 py-2 text-sm flex items-center gap-2"
          title="Làm mới"
        >
          🔄 Làm mới
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: '🎟️', label: 'Tổng vé (trang này)', value: tickets.length, sub: `/${totalElements} tổng` },
          { icon: '✅', label: 'Đã thanh toán', value: paidCount, sub: 'trang này' },
          { icon: '🎬', label: 'Đã xác nhận', value: confirmedCount, sub: 'trang này' },
          { icon: '💰', label: 'Doanh thu (trang)', value: fmtMoney(totalRevenue), sub: 'vé đã thanh toán' },
        ].map(({ icon, label, value, sub }) => (
          <div key={label} className="bg-cinema-surface border border-cinema-border rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{icon}</span>
              <span className="text-cinema-muted text-xs">{label}</span>
            </div>
            <p className="text-white font-bold text-lg">{value}</p>
            <p className="text-cinema-muted text-[10px]">{sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <input
          value={search}
          onChange={e => handleSearchChange(e.target.value)}
          placeholder="🔍 Tìm theo tên KH, mã vé, ID..."
          className="input-field w-64"
        />

        {/* Payment filter */}
        <select
          value={paymentFilter}
          onChange={e => { setPaymentFilter(e.target.value); setPage(0); }}
          className="input-field"
        >
          <option value="">💳 Thanh toán: Tất cả</option>
          <option value="PAID">Đã thanh toán</option>
          <option value="UNPAID">Chưa thanh toán</option>
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
          className="input-field"
        >
          <option value="">📋 Trạng thái: Tất cả</option>
          <option value="PENDING">Chờ xác nhận</option>
          <option value="CONFIRMED">Đã xác nhận</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>

        {(paymentFilter || statusFilter || search) && (
          <button
            onClick={() => { setSearch(''); setDebouncedSearch(''); setPaymentFilter(''); setStatusFilter(''); setPage(0); }}
            className="text-xs text-cinema-muted hover:text-red-400 transition-colors"
          >
            ✕ Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm flex items-center gap-2">
          ⚠️ {error}
          <button onClick={fetchTickets} className="ml-auto underline text-xs">Thử lại</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-cinema-surface border border-cinema-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cinema-dark border-b border-cinema-border">
                {['ID', 'Mã vé', 'Khách hàng', 'Ngày đặt', 'Thành tiền', 'Thanh toán', 'Trạng thái', 'Thao tác'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-cinema-muted text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
              ) : displayedTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-cinema-muted">
                    <div className="text-4xl mb-2">🎟️</div>
                    <p>Không tìm thấy vé nào</p>
                  </td>
                </tr>
              ) : (
                displayedTickets.map((ticket, idx) => (
                  <motion.tr
                    key={ticket.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-cinema-border hover:bg-cinema-dark/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-cinema-muted text-xs">#{ticket.id}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-primary text-xs">
                        {ticket.ticketsCode || `TK-${ticket.id}`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white font-medium">{ticket.accountsFullName || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-cinema-muted text-xs whitespace-nowrap">
                      {fmtDate(ticket.ticketsDate)}
                    </td>
                    <td className="px-4 py-3 text-white font-semibold whitespace-nowrap">
                      {fmtMoney(ticket.finalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge config={PAYMENT_STATUS_CONFIG} value={ticket.paymentStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge config={STATUS_CONFIG} value={ticket.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-cinema-muted hover:text-primary transition-colors"
                          title="Xem / Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setDeleteTicket(ticket)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-cinema-muted hover:text-red-400 transition-colors"
                          title="Xóa vé"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-cinema-border">
            <p className="text-cinema-muted text-xs">
              Trang {page + 1} / {totalPages} · {totalElements} vé
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(0)}
                disabled={page === 0}
                className="px-2 py-1 rounded text-xs text-cinema-muted hover:text-white disabled:opacity-30 transition-colors"
              >«</button>
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1 rounded text-xs text-cinema-muted hover:text-white disabled:opacity-30 transition-colors"
              >‹ Trước</button>

              {/* Page numbers */}
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const startPage = Math.max(0, Math.min(page - 2, totalPages - 5));
                const p = startPage + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      p === page ? 'bg-primary text-cinema-black' : 'text-cinema-muted hover:text-white'
                    }`}
                  >{p + 1}</button>
                );
              })}

              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 rounded text-xs text-cinema-muted hover:text-white disabled:opacity-30 transition-colors"
              >Sau ›</button>
              <button
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
                className="px-2 py-1 rounded text-xs text-cinema-muted hover:text-white disabled:opacity-30 transition-colors"
              >»</button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedTicket && (
          <TicketDetailModal
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
            onSave={handleSaved}
          />
        )}
        {deleteTicket && (
          <DeleteModal
            ticket={deleteTicket}
            onClose={() => setDeleteTicket(null)}
            onDeleted={handleDeleted}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
