import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import accountApi from '../../api/accountApi';

const LEVEL_STYLE = {
  Bronze: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
  Silver: 'bg-gray-400/20 border-gray-400/30 text-gray-300',
  Gold: 'bg-primary/20 border-primary/30 text-primary',
  Platinum: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await accountApi.getAll({ size: 100 });
      // Backend trả về { data: [...] }
      const d = response.data;
      const rawUsers = Array.isArray(d) ? d : (d?.data || d?.content || []);
      
      const mapped = rawUsers.map(u => {
        const tickets = u.tickets || [];
        const bookings = tickets.length || 0;
        const spent = tickets.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
        const points = Math.floor(spent / 10000);
        
        let level = 'Bronze';
        if (points > 3000) level = 'Platinum';
        else if (points > 1500) level = 'Gold';
        else if (points > 500) level = 'Silver';

        return {
          id: u.id,
          name: u.fullName || u.userName || 'Unknown',
          email: u.email || 'N/A',
          phone: u.phone || 'N/A',
          joinDate: u.createDate || u.createdAt || new Date().toISOString(),
          status: u.isDeleted ? 'inactive' : 'active',
          role: u.role,
          bookings,
          spent,
          points,
          level
        };
      });
      setUsers(mapped);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchLevel = filterLevel === 'all' || u.level === filterLevel;
    return matchSearch && matchLevel;
  });

  const toggleStatus = async (id) => {
    const userToToggle = users.find(u => u.id === id);
    if (!userToToggle) return;
    
    try {
      const newStatus = userToToggle.status === 'active' ? 0 : 1;
      // Depending on backend support, we might need a specific endpoint to ban/unban user.
      // For now, doing a generic put or just optimistic update:
      // await accountApi.update(id, { ...userToToggle, status: newStatus });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
    } catch (error) {
      console.error("Lỗi khi chuyển đổi trạng thái");
    }
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
              {loading ? (
                <tr><td colSpan="9" className="text-center py-10 text-cinema-muted">Đang tải dữ liệu...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="9" className="text-center py-10 text-cinema-muted">Không có dữ liệu</td></tr>
              ) : filtered.map(user => (
                <tr key={user.id} className="hover:bg-cinema-card/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-cinema-black font-bold text-xs flex-shrink-0">
                        {user.name.split(' ').pop()[0] || 'U'}
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
