import { motion } from 'framer-motion';
import { MOVIES } from '../../constants/mockData';

const MONTHLY_REVENUE = [
  { month: 'T9/2025', value: 320 }, { month: 'T10/2025', value: 480 },
  { month: 'T11/2025', value: 410 }, { month: 'T12/2025', value: 620 },
  { month: 'T1/2026', value: 390 }, { month: 'T2/2026', value: 510 },
  { month: 'T3/2026', value: 247 },
];
const maxMonth = Math.max(...MONTHLY_REVENUE.map(r => r.value));

const MOVIE_REVENUE = MOVIES.slice(0, 5).map((m, i) => ({
  ...m,
  tickets: [1240, 980, 856, 723, 612][i],
  revenue: [186000000, 147000000, 128400000, 108450000, 45720000][i],
  pct: [100, 79, 69, 58, 37][i],
}));

export default function AdminRevenue() {
  const totalRevenue = MONTHLY_REVENUE.reduce((s, r) => s + r.value, 0);
  const totalTickets = MOVIE_REVENUE.reduce((s, r) => s + r.tickets, 0);

  return (
    <div className="space-y-6">
      <h2 className="font-heading font-extrabold text-2xl text-white">Báo Cáo Doanh Thu</h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tổng doanh thu (7 tháng)', value: totalRevenue + 'M', icon: '💰', color: 'border-primary/30 bg-primary/5' },
          { label: 'Tổng vé bán ra', value: totalTickets.toLocaleString(), icon: '🎟️', color: 'border-blue-500/30 bg-blue-500/5' },
          { label: 'Doanh thu TB/tháng', value: Math.round(totalRevenue / MONTHLY_REVENUE.length) + 'M', icon: '📊', color: 'border-green-500/30 bg-green-500/5' },
          { label: 'Tháng tốt nhất', value: '620M', icon: '🏆', color: 'border-accent/30 bg-accent/5' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className={`rounded-xl border p-5 ${stat.color}`}>
            <div className="text-3xl mb-2">{stat.icon}</div>
            <p className="font-heading font-extrabold text-2xl text-white">{stat.value}</p>
            <p className="text-cinema-muted text-xs mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-cinema-surface border border-cinema-border rounded-xl p-6">
        <h3 className="font-heading font-bold text-white mb-6">Doanh thu theo tháng (Triệu VNĐ)</h3>
        <div className="flex items-end gap-3 h-48">
          {MONTHLY_REVENUE.map((item, i) => {
            const heightPct = (item.value / maxMonth) * 100;
            const isLast = i === MONTHLY_REVENUE.length - 1;
            return (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-cinema-muted text-[11px] font-medium">{item.value}M</span>
                <div className="w-full relative group cursor-pointer">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-700 ${isLast ? 'bg-gradient-gold shadow-glow-gold' : 'bg-cinema-card hover:bg-cinema-border'}`}
                    style={{ height: `${heightPct * 1.2}px` }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-cinema-dark border border-cinema-border rounded px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {item.value}M VNĐ
                  </div>
                </div>
                <span className={`text-[10px] font-medium text-center ${isLast ? 'text-primary' : 'text-cinema-muted'}`}>
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Revenue by Movie */}
      <div className="bg-cinema-surface border border-cinema-border rounded-xl p-6">
        <h3 className="font-heading font-bold text-white mb-5">Doanh thu theo Phim</h3>
        <div className="space-y-4">
          {MOVIE_REVENUE.map((movie, i) => (
            <div key={movie.id} className="flex items-center gap-4">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                i === 0 ? 'bg-primary text-cinema-black' :
                i === 1 ? 'bg-gray-400 text-cinema-black' :
                i === 2 ? 'bg-orange-600 text-white' :
                'bg-cinema-card text-cinema-muted border border-cinema-border'
              }`}>{i + 1}</span>
              <img src={movie.poster} alt={movie.title}
                className="w-10 h-14 object-cover rounded flex-shrink-0"
                onError={e => { e.target.src = 'https://placehold.co/50x70/1E1E2C/A0A0B4'; }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-white text-sm font-medium truncate pr-4">{movie.title}</p>
                  <div className="flex items-center gap-4 text-sm flex-shrink-0">
                    <span className="text-cinema-muted">{movie.tickets.toLocaleString()} vé</span>
                    <span className="text-primary font-bold">{(movie.revenue / 1000000).toFixed(0)}M</span>
                  </div>
                </div>
                <div className="h-2 bg-cinema-dark rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${movie.pct}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className={`h-full rounded-full ${
                      i === 0 ? 'bg-gradient-gold' :
                      i === 1 ? 'bg-gray-400' :
                      i === 2 ? 'bg-orange-500' :
                      'bg-cinema-border'
                    }`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue by Type */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-cinema-surface border border-cinema-border rounded-xl p-6">
          <h3 className="font-heading font-bold text-white mb-4">Theo định dạng chiếu</h3>
          <div className="space-y-3">
            {[
              { type: '2D', pct: 45, revenue: '162M', color: 'bg-cinema-border' },
              { type: '3D', pct: 35, revenue: '126M', color: 'bg-blue-500' },
              { type: 'IMAX', pct: 20, revenue: '72M', color: 'bg-purple-500' },
            ].map(item => (
              <div key={item.type}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-white font-medium">{item.type}</span>
                  <span className="text-primary font-bold">{item.revenue}</span>
                </div>
                <div className="h-2.5 bg-cinema-dark rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    transition={{ duration: 0.7 }}
                    className={`h-full rounded-full ${item.color}`}
                  />
                </div>
                <p className="text-cinema-muted text-xs mt-0.5">{item.pct}% tổng doanh thu</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-cinema-surface border border-cinema-border rounded-xl p-6">
          <h3 className="font-heading font-bold text-white mb-4">Theo rạp chiếu phim</h3>
          <div className="space-y-3">
            {[
              { cinema: 'CGV Vincom Center', pct: 38, revenue: '136.8M' },
              { cinema: 'Lotte Cinema Landmark', pct: 29, revenue: '104.4M' },
              { cinema: 'BHD Star Cineplex', pct: 20, revenue: '72M' },
              { cinema: 'CGV Bà Triệu (HN)', pct: 13, revenue: '46.8M' },
            ].map((item, i) => (
              <div key={item.cinema}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-white text-xs truncate pr-2">{item.cinema}</span>
                  <span className="text-primary font-bold text-xs flex-shrink-0">{item.revenue}</span>
                </div>
                <div className="h-2 bg-cinema-dark rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    transition={{ duration: 0.7, delay: i * 0.1 }}
                    className="h-full rounded-full bg-gradient-gold"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
