import { useState } from 'react';
import { motion } from 'framer-motion';

const MOCK_USERS = [
  { id: 1, name: 'Nguyễn Văn An',  email: 'nguyenvanan@email.com', phone: '0912345678', joinDate: '2024-09-01',  bookings: 12, spent: 1450000, level: 'Gold',     points: 1250, status: 'active' },
  { id: 2, name: 'Trần Thị Bình', email: 'tranthib@email.com',    phone: '0987654321', joinDate: '2024-11-15', bookings: 8,  spent: 960000,  level: 'Silver',   points: 380,  status: 'active' },
  { id: 3, name: 'Lê Minh Châu',  email: 'lmchau@email.com',      phone: '0901234567', joinDate: '2025-01-20', bookings: 3,  spent: 375000,  level: 'Bronze',   points: 90,   status: 'active' },
  { id: 4, name: 'Phạm Thị Dung', email: 'phamdung@email.com',   phone: '0976543210', joinDate: '2024-08-05',  bookings: 25, spent: 3200000, level: 'Platinum', points: 3200, status: 'active' },
  { id: 5, name: 'Hoàng Văn Em',  email: 'hoangemail@email.com',  phone: '0912000111', joinDate: '2025-03-01', bookings: 1,  spent: 79250,   level: 'Bronze',   points: 20,   status: 'inactive' },
  { id: 6, name: 'Vũ Thị Phương', email: 'vuphuong@email.com',  phone: '0933456789', joinDate: '2024-12-10', bookings: 15, spent: 1800000, level: 'Gold',     points: 1680, status: 'active' },
];

const LEVEL_STYLE = {
  Bronze: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
  Silver: 'bg-gray-400/20 border-gray-400/30 text-gray-300',
  Gold: 'bg-primary/20 border-primary/30 text-primary',
  Platinum: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
};

export default function AdminUsers() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchLevel = filterLevel === 'all' || u.level === filterLevel;
    return matchSearch && matchLevel;
  });

  const toggleStatus = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
  };

  const totalStats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    gold: users.filter(u => u.level === 'Gold' || u.level === 'Platinum').length,
    totalRevenue: users.reduce((sum, u) => sum + u.spent, 0),
  };

  return (
    <div className="space-y-5">
      <h2 className="font-heading font-extrabold text-2xl text-white">Quản lý Người Dùng</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Tổng người dùng', value: totalStats.total, icon: '👥', color: 'border-blue-500/30 bg-blue-500/5' },
          { label: 'Đang hoạt động', value: totalStats.active, icon: '✅', color: 'border-green-500/30 bg-green-500/5' },
          { label: 'Thành viên cao cấp', value: totalStats.gold, icon: '⭐', color: 'border-primary/30 bg-primary/5' },
          { label: 'Tổng doanh thu', value: (totalStats.totalRevenue / 1000000).toFixed(1) + 'M', icon: '💰', color: 'border-accent/30 bg-accent/5' },
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
          placeholder="🔍 Tìm theo tên hoặc email..." className="input-field max-w-xs" />
        <div className="flex gap-1 bg-cinema-surface rounded-lg p-1 border border-cinema-border">
          {['all', 'Bronze', 'Silver', 'Gold', 'Platinum'].map(level => (
            <button key={level} onClick={() => setFilterLevel(level)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filterLevel === level ? 'bg-primary text-cinema-black' : 'text-cinema-muted hover:text-white'
              }`}>
              {level === 'all' ? 'Tất cả' : level}
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
                    {new Date(user.joinDate).toLocaleDateString('vi-VN')}
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
                    <span className={`badge text-xs font-semibold border ${LEVEL_STYLE[user.level]}`}>
                      {user.level === 'Platinum' ? '💎' : user.level === 'Gold' ? '⭐' : user.level === 'Silver' ? '🥈' : '🥉'} {user.level}
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
                    <button onClick={() => toggleStatus(user.id)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
                        user.status === 'active'
                          ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                          : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                      }`}>
                      {user.status === 'active' ? 'Khoá' : 'Mở khoá'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
