import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ticketService from '../../services/ticketService';
import movieService from '../../services/movieService';

const safeParseDate = (dateStr) => {
  if (!dateStr) return new Date();
  if (typeof dateStr === 'number' || dateStr instanceof Date) return new Date(dateStr);
  const defaultParsed = new Date(dateStr);
  if (!isNaN(defaultParsed.getTime())) return defaultParsed;
  try {
    const [d, t] = String(dateStr).split(' ');
    if (d) {
      const parts = d.split('-');
      if (parts.length === 3) {
        const [dd, MM, yyyy] = parts;
        const year = yyyy.startsWith('00') ? '20' + yyyy.slice(2) : yyyy;
        const parsed = new Date(`${year}-${MM}-${dd}T${t || '00:00:00'}`);
        if (!isNaN(parsed.getTime())) return parsed;
      }
    }
  } catch (e) {}
  return new Date();
};

export default function AdminRevenue() {
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const [bestMonth, setBestMonth] = useState({ label: 'N/A', value: 0 });
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [movieRevenue, setMovieRevenue] = useState([]);
  const [cinemaRevenue, setCinemaRevenue] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketsRes, moviesRes] = await Promise.all([
          ticketService.getAll({ size: 10000 }),
          movieService.getAll()
        ]);
        
        const tickets = Array.isArray(ticketsRes) ? ticketsRes : ticketsRes?.content || ticketsRes?.data || [];
        const allMovies = moviesRes || [];
        
        let sumRevenue = 0;
        let sumTickets = 0;
        
        const currentYear = new Date().getFullYear();
        const months = Array.from({ length: 12 }, (_, i) => ({ month: `T${i + 1}/${currentYear}`, value: 0 }));
        
        const movieMap = {};
        const cinemaMap = {};
        
        tickets.forEach(ticket => {
          if (ticket.paymentStatus === 'PAID') {
            const amount = ticket.finalAmount || ticket.totalAmount || 0;
            const tDate = safeParseDate(ticket.ticketsDate || ticket.createDate || Date.now());
            const seatsCount = ticket.seats?.length || 1;
            
            sumRevenue += amount;
            sumTickets += seatsCount;
            
            if (tDate.getFullYear() === currentYear) {
              months[tDate.getMonth()].value += amount;
            }
            
            if (ticket.movieId) {
              if (!movieMap[ticket.movieId]) {
                const dbMovie = allMovies.find(m => m.id === ticket.movieId);
                movieMap[ticket.movieId] = {
                  id: ticket.movieId,
                  title: ticket.movieName || dbMovie?.title || 'Unknown',
                  poster: ticket.posterUrl || dbMovie?.poster || '',
                  tickets: 0,
                  revenue: 0
                };
              }
              movieMap[ticket.movieId].tickets += seatsCount;
              movieMap[ticket.movieId].revenue += amount;
            }
            
            const cName = ticket.cinemaName || 'Hệ thống rạp'; 
            if (!cinemaMap[cName]) cinemaMap[cName] = { cinema: cName, revenue: 0 };
            cinemaMap[cName].revenue += amount;
          }
        });
        
        setTotalRevenue(sumRevenue);
        setTotalTickets(sumTickets);
        
        let maxM = months[0];
        months.forEach(m => { if(m.value > maxM.value) maxM = m; });
        setBestMonth({ label: maxM.month, value: maxM.value });
        
        // Show only last 7 months relative to current month
        const currMonthIdx = new Date().getMonth();
        let displayMonths = [];
        for (let i = 6; i >= 0; i--) {
          let idx = currMonthIdx - i;
          if (idx < 0) {
             // previous year (simplified, just take from end of array)
             displayMonths.push({ month: `T${12 + idx + 1}/${currentYear - 1}`, value: 0 }); // No data for prev year right now
          } else {
             displayMonths.push(months[idx]);
          }
        }
        // If we want to strictly show the 12 months, let's just show 12 months
        setMonthlyRevenue(months);
        
        const sortedMovies = Object.values(movieMap).sort((a, b) => b.revenue - a.revenue);
        const maxMovieRev = sortedMovies.length > 0 ? sortedMovies[0].revenue : 1;
        setMovieRevenue(sortedMovies.slice(0, 5).map(m => ({
           ...m,
           pct: Math.round((m.revenue / maxMovieRev) * 100)
        })));
        
        const sortedCinemas = Object.values(cinemaMap).sort((a, b) => b.revenue - a.revenue);
        setCinemaRevenue(sortedCinemas.slice(0, 5).map(c => ({
           ...c,
           pct: Math.round((c.revenue / (sumRevenue || 1)) * 100)
        })));
        
      } catch (err) {
        console.error("Error fetching revenue:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const formatM = (val) => (val / 1000000).toFixed(1);
  const maxMonth = Math.max(...monthlyRevenue.map(r => r.value), 1);

  return (
    <div className="space-y-6">
      <h2 className="font-heading font-extrabold text-2xl text-white">Báo Cáo Doanh Thu</h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tổng doanh thu', value: formatM(totalRevenue) + 'M', icon: '💰', color: 'border-primary/30 bg-primary/5' },
          { label: 'Tổng vé bán ra', value: totalTickets.toLocaleString(), icon: '🎟️', color: 'border-blue-500/30 bg-blue-500/5' },
          { label: 'Doanh thu TB/tháng', value: formatM(totalRevenue / 12) + 'M', icon: '📊', color: 'border-green-500/30 bg-green-500/5' },
          { label: 'Tháng tốt nhất', value: formatM(bestMonth.value) + 'M', icon: '🏆', color: 'border-accent/30 bg-accent/5' },
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
        <div className="flex items-end gap-1 md:gap-3 h-48">
          {monthlyRevenue.map((item, i) => {
            const heightPct = (item.value / maxMonth) * 100;
            const isLast = i === monthlyRevenue.length - 1;
            return (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-cinema-muted text-[9px] md:text-[11px] font-medium">{item.value > 0 ? formatM(item.value) + 'M' : ''}</span>
                <div className="w-full relative group cursor-pointer">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-700 ${isLast ? 'bg-gradient-gold shadow-glow-gold' : 'bg-cinema-card hover:bg-cinema-border'}`}
                    style={{ height: `${Math.max(heightPct * 1.2, 2)}px` }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-cinema-dark border border-cinema-border rounded px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    {item.value.toLocaleString('vi-VN')} VNĐ
                  </div>
                </div>
                <span className={`text-[9px] md:text-[10px] font-medium text-center ${isLast ? 'text-primary' : 'text-cinema-muted'}`}>
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
          {movieRevenue.length > 0 ? movieRevenue.map((movie, i) => (
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
                    <span className="text-primary font-bold">{formatM(movie.revenue)}M</span>
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
          )) : (
            <p className="text-cinema-muted text-sm">Chưa có dữ liệu phim.</p>
          )}
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
            {cinemaRevenue.length > 0 ? cinemaRevenue.map((item, i) => (
              <div key={item.cinema}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-white text-xs truncate pr-2">{item.cinema}</span>
                  <span className="text-primary font-bold text-xs flex-shrink-0">{formatM(item.revenue)}M</span>
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
            )) : (
              <p className="text-cinema-muted text-sm">Chưa có dữ liệu rạp.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
