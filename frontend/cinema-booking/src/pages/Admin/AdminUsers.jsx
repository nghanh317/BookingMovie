import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import accountService from '../../services/accountService';
import useNotificationStore from '../../store/notificationStore';
import { RANKS, POINT_EARN_EXAMPLES, getRankByPoints, getRankProgress } from '../../constants/rankingConfig';

// Hiển thị ngày theo định dạng DD/MM/YYYY
function fmtDate(d) {
  if (!d) return '—';
  const parts = d.split('-');
  if (parts.length !== 3) return d;
  const [y, m, day] = parts;
  return `${day}/${m}/${y}`;
}

const MOCK_USERS = [
  { id: 1, name: 'Nguyễn Văn An',  email: 'nguyenvanan@email.com', phone: '0912345678', joinDate: '2024-09-01',  bookings: 12, spent: 1450000, level: 'Gold',     points: 1250, status: 'active' },
  { id: 2, name: 'Trần Thị Bình', email: 'tranthib@email.com',    phone: '0987654321', joinDate: '2024-11-15', bookings: 8,  spent: 960000,  level: 'Silver',   points: 380,  status: 'active' },
  { id: 3, name: 'Lê Minh Châu',  email: 'lmchau@email.com',      phone: '0901234567', joinDate: '2025-01-20', bookings: 3,  spent: 375000,  level: 'Bronze',   points: 90,   status: 'active' },
  { id: 4, name: 'Phạm Thị Dung', email: 'phamdung@email.com',   phone: '0976543210', joinDate: '2024-08-05',  bookings: 25, spent: 3200000, level: 'Diamond',  points: 3200, status: 'active' },
  { id: 5, name: 'Hoàng Văn Em',  email: 'hoangemail@email.com',  phone: '0912000111', joinDate: '2025-03-01', bookings: 1,  spent: 79250,   level: 'Bronze',   points: 20,   status: 'inactive' },
  { id: 6, name: 'Vũ Thị Phương', email: 'vuphuong@email.com',  phone: '0933456789', joinDate: '2024-12-10', bookings: 15, spent: 1800000, level: 'Gold',     points: 1680, status: 'active' },
];

const LEVEL_STYLE = {
  Bronze:  'bg-orange-500/20 border-orange-500/30 text-orange-400',
  Silver:  'bg-gray-400/20 border-gray-400/30 text-gray-300',
  Gold:    'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
  Diamond: 'bg-cyan-500/20 border-cyan-400/30 text-cyan-400',
};

const LEVEL_ICON = { Bronze: '🥉', Silver: '🥈', Gold: '🥇', Diamond: '💎' };

// ── Bảng thang điểm hạng thành viên ────────────────────────
function RankingTable() {
  const [showEarn, setShowEarn] = useState(false);
  return (
    <div className="bg-cinema-surface rounded-xl border border-cinema-border p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading font-bold text-white">🏆 Bảng xếp hạng thành viên</h3>
          <p className="text-cinema-muted text-xs mt-0.5">Thang điểm &amp; quyền lợi theo hạng — 10.000đ = 1 điểm cơ bản</p>
        </div>
        <button
          onClick={() => setShowEarn(v => !v)}
          className="text-xs text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-all"
        >
          {showEarn ? '← Về thang hạng' : '🎟️ Bảng tích điểm'}
        </button>
      </div>

      {!showEarn ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {RANKS.map((rank, idx) => (
            <div key={rank.key} className={`rounded-xl border ${rank.borderColor} ${rank.bgColor} p-4 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-10"
                style={{ background: `radial-gradient(circle, ${rank.gradientTo}, transparent)`, transform: 'translate(30%, -30%)' }} />
              <div className="text-2xl mb-1">{rank.icon}</div>
              <p className={`font-heading font-extrabold text-lg ${rank.color}`}>{rank.label}</p>
              <p className="text-cinema-muted text-[11px] mt-0.5 mb-3">
                {rank.maxPoints === Infinity
                  ? `≥ ${rank.minPoints.toLocaleString('vi-VN')} điểm`
                  : `${rank.minPoints.toLocaleString('vi-VN')} – ${rank.maxPoints.toLocaleString('vi-VN')} điểm`}
              </p>
              <ul className="space-y-1">
                {rank.perks.map(p => (
                  <li key={p} className="text-[10px] text-cinema-muted flex items-start gap-1">
                    <span className="text-green-400 mt-px flex-shrink-0">✓</span>{p}
                  </li>
                ))}
              </ul>
              {idx < RANKS.length - 1 && (
                <div className="absolute bottom-2 right-2 text-cinema-muted text-[10px]">
                  →{RANKS[idx+1].icon}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-cinema-border">
                <th className="text-left py-2 px-3 text-cinema-muted font-medium">Dịch vụ</th>
                <th className="text-right py-2 px-3 text-cinema-muted font-medium">Giá</th>
                <th className="text-right py-2 px-3 text-orange-400 font-medium">🥉 Bronze</th>
                <th className="text-right py-2 px-3 text-gray-300 font-medium">🥈 Silver</th>
                <th className="text-right py-2 px-3 text-yellow-400 font-medium">🥇 Gold ×1.2</th>
                <th className="text-right py-2 px-3 text-cyan-400 font-medium">💎 Diamond ×1.5</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cinema-border/40">
              {POINT_EARN_EXAMPLES.map(e => (
                <tr key={e.label} className="hover:bg-cinema-card/30 transition-colors">
                  <td className="py-2 px-3 text-white">{e.icon} {e.label}</td>
                  <td className="py-2 px-3 text-right text-cinema-muted">{e.price.toLocaleString('vi-VN')}đ</td>
                  <td className="py-2 px-3 text-right text-orange-400 font-semibold">+{e.points}</td>
                  <td className="py-2 px-3 text-right text-gray-300 font-semibold">+{e.points}</td>
                  <td className="py-2 px-3 text-right text-yellow-400 font-semibold">+{Math.floor(e.points * 1.2)}</td>
                  <td className="py-2 px-3 text-right text-cyan-400 font-semibold">+{Math.floor(e.points * 1.5)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Modal Chỉnh sửa người dùng ─────────────────────────────
function EditUserModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    userName: user.userName || user.name || '',
    fullName: user.fullName || user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'USER',
    status: user.status || 'active'
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user.id, formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-cinema-surface border border-cinema-border rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="font-heading font-bold text-xl text-white mb-4">Cập nhật Người Dùng</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-cinema-muted mb-1 block">Tên đăng nhập</label>
            <input name="userName" value={formData.userName} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="text-xs text-cinema-muted mb-1 block">Họ và tên</label>
            <input name="fullName" value={formData.fullName} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="text-xs text-cinema-muted mb-1 block">Email</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="text-xs text-cinema-muted mb-1 block">Số điện thoại</label>
            <input name="phone" value={formData.phone} onChange={handleChange} className="input-field" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-cinema-muted mb-1 block">Vai trò</label>
              <select name="role" value={formData.role} onChange={handleChange} className="input-field bg-cinema-dark text-white">
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-cinema-muted mb-1 block">Trạng thái</label>
              <select name="status" value={formData.status} onChange={handleChange} className="input-field bg-cinema-dark text-white">
                <option value="active">Hoạt động</option>
                <option value="inactive">Khoá</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-cinema-border text-cinema-muted hover:text-white transition-colors">Hủy</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-cinema-black font-medium hover:bg-primary/90 transition-colors">Lưu thay đổi</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}


export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [editingUser, setEditingUser] = useState(null);

  const normalizeUser = (u) => ({
    ...u,
    name: u.name || u.fullName || u.userName || '',
    userName: u.userName || '',
    fullName: u.fullName || '',
    joinDate: u.joinDate || u.createDate || '',
    bookings: u.bookings ?? (u.tickets?.filter(t => t.paymentStatus === 'PAID')?.length ?? 0),
    spent: u.spent || 0,
    level: u.level || 'Bronze',
    points: u.points || 0,
    status: u.status || 'active',
    role: u.role || 'USER',
  });

  // ── Fetch tài khoản từ API ─────────────────────────────
  useEffect(() => {
    setLoading(true);
    accountService.getAll()
      .then((data) => {
        // Nếu data từ backend không rỗng thì dùng, ngược lại fallback
        if (Array.isArray(data) && data.length > 0) {
          setUsers(data.map(normalizeUser));
        } else {
          setUsers(MOCK_USERS);
        }
      })
      .catch(() => setUsers(MOCK_USERS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchLevel = filterLevel === 'all' || u.level === filterLevel;
    return matchSearch && matchLevel;
  });

  const { addNotification } = useNotificationStore();

  const handleUpdate = async (id, formData) => {
    try {
      await accountService.update(id, {
        userName: formData.userName,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role
      });

      // Đồng bộ lại danh sách tài khoản từ backend
      const freshData = await accountService.getAll();
      if (Array.isArray(freshData) && freshData.length > 0) {
        setUsers(freshData.map(normalizeUser));
      } else {
        // Fallback local update if backend returns empty
        setUsers(prev => prev.map(u => u.id === id ? {
          ...u,
          name: formData.fullName || formData.userName,
          userName: formData.userName,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          status: formData.status
        } : u));
      }
      
      addNotification({ title: 'Cập nhật thành công', message: 'Thông tin người dùng đã được lưu', type: 'success', isAdmin: true });
      setEditingUser(null);
    } catch (error) {
      if (error.response?.status === 401) {
        addNotification({ title: 'Lỗi xác thực', message: 'Phiên đăng nhập hết hạn hoặc không có quyền Admin. Đang chuyển hướng...', type: 'error', isAdmin: true });
        setTimeout(() => {
          localStorage.removeItem('cinema-auth');
          window.location.href = '/login';
        }, 2500);
        return;
      }

      const errMsg = error.response?.data?.detail || error.response?.data?.message || error.response?.data?.detailMessage || error.message || 'Không thể lưu thông tin';
      addNotification({ title: 'Lỗi cập nhật', message: errMsg, type: 'error', isAdmin: true });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xoá tài khoản: ${name}?`)) return;
    try {
      await accountService.remove(id);
      
      // Đồng bộ lại danh sách tài khoản từ backend
      const freshData = await accountService.getAll();
      if (Array.isArray(freshData) && freshData.length > 0) {
        setUsers(freshData.map(normalizeUser));
      } else {
        setUsers(prev => prev.filter(u => u.id !== id));
      }

      addNotification({ title: 'Xoá thành công', message: `Đã xoá tài khoản: ${name}`, type: 'success', isAdmin: true });
    } catch (error) {
      if (error.response?.status === 401) {
        addNotification({ title: 'Lỗi xác thực', message: 'Phiên đăng nhập hết hạn hoặc không có quyền Admin. Đang chuyển hướng...', type: 'error', isAdmin: true });
        setTimeout(() => {
          localStorage.removeItem('cinema-auth');
          window.location.href = '/login';
        }, 2500);
        return;
      }

      const errMsg = error.response?.data?.detail || error.response?.data?.message || error.response?.data?.detailMessage || error.message || 'Có lỗi xảy ra khi xoá tài khoản';
      addNotification({ title: 'Xoá thất bại', message: errMsg, type: 'error', isAdmin: true });
    }
  };

  const totalStats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    gold: users.filter(u => u.level === 'Gold' || u.level === 'Platinum').length,
  };

  return (
    <div className="space-y-5">
      <h2 className="font-heading font-extrabold text-2xl text-white">Quản lý Người Dùng</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Tổng người dùng',  value: users.length,                                          icon: '👥', color: 'border-blue-500/30 bg-blue-500/5' },
          { label: 'Đang hoạt động',   value: users.filter(u => u.status === 'active').length,        icon: '✅', color: 'border-green-500/30 bg-green-500/5' },
          { label: 'Hạng Gold+',       value: users.filter(u => ['Gold','Diamond'].includes(u.level)).length, icon: '🥇', color: 'border-yellow-500/30 bg-yellow-500/5' },
          { label: 'Hạng Diamond',     value: users.filter(u => u.level === 'Diamond').length,        icon: '💎', color: 'border-cyan-500/30 bg-cyan-500/5' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`rounded-xl border p-4 ${stat.color}`}>
            <div className="text-2xl mb-2">{stat.icon}</div>
            <p className="font-heading font-bold text-xl text-white">{stat.value}</p>
            <p className="text-cinema-muted text-xs mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Bảng thang hạng */}
      <RankingTable />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Tìm theo tên hoặc email..." className="input-field max-w-xs" />
        <div className="flex gap-1 bg-cinema-surface rounded-lg p-1 border border-cinema-border">
          {['all', 'Bronze', 'Silver', 'Gold', 'Diamond'].map(level => (
            <button key={level} onClick={() => setFilterLevel(level)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filterLevel === level ? 'bg-primary text-cinema-black' : 'text-cinema-muted hover:text-white'
              }`}>
              {level === 'all' ? 'Tất cả' : (LEVEL_ICON[level] || '') + ' ' + level}
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
                {['Người dùng', 'Liên hệ', 'Ngày tham gia', 'Số vé', 'Chi tiêu', 'Điểm thưởng', 'Hạng', 'Trạng thái', 'Thao tác'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-cinema-muted text-xs font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cinema-border/50">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-cinema-card/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-cinema-black font-bold text-xs flex-shrink-0">
                        {user.name.split(' ').pop()[0]}
                      </div>
                      <span className="text-white text-sm font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-cinema-muted text-xs">{user.email}</p>
                    <p className="text-cinema-muted text-xs">{user.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-cinema-muted text-sm">
                    {fmtDate(user.joinDate)}
                  </td>
                  <td className="px-4 py-3 text-white font-semibold text-sm">{user.bookings}</td>
                  <td className="px-4 py-3 text-primary font-semibold text-sm">
                    {(user.spent / 1000).toFixed(0)}K
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">⭐</span>
                      <span className={`font-bold text-sm ${
                        user.points >= 1000 ? 'text-primary' :
                        user.points >= 300 ? 'text-gray-300' :
                        'text-orange-400'
                      }`}>{(user.points || 0).toLocaleString('vi-VN')}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs font-semibold border ${LEVEL_STYLE[user.level] || LEVEL_STYLE.Bronze}`}>
                      {LEVEL_ICON[user.level] || '🥉'} {user.level}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs border ${
                      user.status === 'active'
                        ? 'bg-green-500/20 border-green-500/30 text-green-400'
                        : 'bg-red-500/20 border-red-500/30 text-red-400'
                    }`}>
                      {user.status === 'active' ? '● Hoạt động' : '○ Khoá'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setEditingUser(user)}
                        title="Cập nhật"
                        className="p-1.5 rounded-lg border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-all">
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(user.id, user.name)}
                        title="Xoá người dùng"
                        className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Render Modal Edit */}
      {editingUser && (
        <EditUserModal 
          user={editingUser} 
          onClose={() => setEditingUser(null)} 
          onSave={handleUpdate} 
        />
      )}
    </div>
  );
}
