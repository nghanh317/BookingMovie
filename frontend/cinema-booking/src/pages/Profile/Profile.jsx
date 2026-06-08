import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import useFavoriteStore from '../../store/favoriteStore';
import useNotificationStore from '../../store/notificationStore';
import accountService from '../../services/accountService';
import ticketService from '../../services/ticketService';
import movieService from '../../services/movieService';
import MovieCard from '../../components/movie/MovieCard';
import { RANKS, POINT_EARN_EXAMPLES, getRankByPoints, getRankProgress } from '../../constants/rankingConfig';
import api from '../../services/api';
import promotionService from '../../services/promotionService';
import payosService from '../../services/payosService';
import { QRCodeCanvas } from 'qrcode.react';




const STATUS_CONFIG = {
  upcoming: { label: 'Sắp tới', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  completed: { label: 'Đã xem', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  pending: { label: 'Chờ thanh toán', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

function Avatar({ name, size = 'lg' }) {
  const initials = name.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase();
  const sizeClass = size === 'lg' ? 'w-24 h-24 text-3xl' : 'w-10 h-10 text-sm';
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-gold flex items-center justify-center font-heading font-bold text-cinema-black shadow-glow-gold`}>
      {initials}
    </div>
  );
}

function BookingCard({ booking, onRate, onViewDetail, onPay, onCancel, allMovies }) {
  const status = STATUS_CONFIG[booking.status] || { label: booking.status, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
  
  // Find matching movie by checking if booking note includes movie title
  const matchedMovie = allMovies?.find(m => 
    booking.movie && m.title && booking.movie.toLowerCase().includes(m.title.toLowerCase())
  );
  
  const posterUrl = matchedMovie?.poster || booking.poster || `https://placehold.co/80x120/1E1E2C/A0A0B4?text=${encodeURIComponent('No Poster')}`;
  const displayTitle = matchedMovie?.title || booking.movie;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 flex gap-4 hover:border-cinema-muted/50 transition-colors"
    >
      {/* Poster */}
      <div className="flex-shrink-0 w-16 h-24 rounded-lg overflow-hidden bg-cinema-surface flex items-center justify-center">
        <img src={posterUrl} alt={displayTitle} className="w-full h-full object-cover"
          onError={e => { e.target.src = 'https://placehold.co/80x120/1E1E2C/A0A0B4'; }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <h4 className="font-heading font-bold text-white text-sm leading-snug truncate">{displayTitle}</h4>
          <span className={`badge border text-xs font-semibold flex-shrink-0 ${status.color}`}>{status.label}</span>
        </div>
        <div className="mt-1.5 space-y-0.5 text-xs text-cinema-muted">
          <p className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {booking.cinema}
          </p>
          <p className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(booking.date).toLocaleDateString('vi-VN')} lúc {booking.time} · {booking.type}
          </p>
          <p className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            Ghế: {booking.seats.join(', ')}
          </p>
        </div>
      </div>

      {/* Price & Actions */}
      <div className="flex-shrink-0 text-right flex flex-col justify-between">
        <p className="text-primary font-heading font-bold text-sm">
          {booking.total.toLocaleString('vi-VN')}đ
        </p>
        <div className="flex flex-col gap-1 mt-2">
          <span className="text-cinema-muted text-[10px] font-mono">#{booking.id}</span>
          <div className="flex flex-col gap-1 items-end mt-1">
            <button onClick={() => onViewDetail && onViewDetail(booking)} className="text-primary hover:text-primary/80 text-xs transition-colors font-semibold">
              Chi tiết
            </button>
            {booking.status === 'completed' && (
              <button onClick={() => onRate && onRate(booking)} className="text-accent hover:text-accent/80 text-xs transition-colors mt-1 font-semibold">
                Đánh giá
              </button>
            )}
            <div className="flex justify-end mt-1">
              {booking.status === 'pending' && (
                <div className="flex gap-4 mt-2">
                  <button onClick={() => onPay && onPay(booking)} className="text-blue-400 hover:text-blue-300 text-xs transition-colors font-semibold">
                    Thanh toán
                  </button>
                  <button 
                    onClick={() => onCancel && onCancel(booking)} 
                    className="text-red-400 hover:text-red-300 text-xs transition-colors font-semibold"
                  >
                    Hủy vé
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const TABS = [
  { id: 'overview', label: 'Tổng quan', icon: '👤' },
  { id: 'bookings', label: 'Vé của tôi', icon: '🎟️' },
  { id: 'favorites', label: 'Phim yêu thích', icon: '❤️' },
  { id: 'offers', label: 'Ưu đãi', icon: '🎁' },
  { id: 'settings', label: 'Cài đặt', icon: '⚙️' },
];

export default function Profile() {
  const { user, logout } = useAuthStore();
  const { favorites } = useFavoriteStore();
  const { addNotification } = useNotificationStore();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState(tabParam || 'overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editMode, setEditMode] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Real data state
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({});
  const [bookings, setBookings] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  const [payosData, setPayosData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const [ownedVouchers, setOwnedVouchers] = useState(() => {
    try {
      const saved = localStorage.getItem(`ownedVouchers_${user?.id || user?.userId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        const now = new Date();
        // Lọc bỏ những voucher đã hết hạn
        const valid = parsed.filter(v => {
          if (!v.original || !v.original.endDate) return true;
          const ed = v.original.endDate;
          let end = null;
          if (typeof ed === 'string' && ed.includes('-') && ed.split('-')[0].length === 2) {
             const [datePart, timePart] = ed.split(' ');
             const [dd, mm, yyyy] = datePart.split('-');
             end = new Date(`${yyyy}-${mm}-${dd}T${timePart || '23:59:59'}`);
          } else {
             end = new Date(ed);
          }
          return end > now;
        });
        
        // Nếu số lượng thay đổi thì cập nhật lại localStorage
        if (valid.length !== parsed.length) {
          localStorage.setItem(`ownedVouchers_${user?.id || user?.userId}`, JSON.stringify(valid));
        }
        return valid;
      }
      return [];
    } catch {
      return [];
    }
  });
  const [redeemableOffers, setRedeemableOffers] = useState([]);

  // Fetch user info
  useEffect(() => {
    const userId = user?.id || user?.userId;
    if (!userId) { setProfileLoading(false); return; }
    accountService.getById(userId)
      .then(data => {
        let parsedJoinDate = '';
        if (data.createDate) {
          if (typeof data.createDate === 'string' && data.createDate.includes('-') && data.createDate.split('-')[0].length === 2) {
            const [datePart, timePart] = data.createDate.split(' ');
            const [dd, mm, yyyy] = datePart.split('-');
            parsedJoinDate = `${yyyy}-${mm}-${dd}T${timePart || '00:00:00'}`;
          } else {
            parsedJoinDate = data.createDate;
          }
        }

        const info = {
          name: data.fullName || data.userName || 'Người dùng',
          email: data.email || '',
          phone: data.phone || '',
          joinDate: parsedJoinDate,
          points: data.points || 0, // Dùng điểm tính toán sẵn từ backend
          totalBookings: data.bookings || 0, // Dùng số liệu chuẩn từ backend thay vì tự đếm
          totalSpent: data.spent || 0,
        };
        setUserData(info);
        setFormData(info);
      })
      .catch(() => {
        // Fallback từ user trong store
        const info = {
          name: user?.fullName || user?.userName || 'Người dùng',
          email: user?.email || '',
          phone: user?.phone || '',
          joinDate: '',
          points: 0,
          totalBookings: 0,
          totalSpent: 0,
        };
        setUserData(info);
        setFormData(info);
      })
      .finally(() => setProfileLoading(false));
  }, [user]);

  // Fetch tickets của user
  useEffect(() => {
    const userId = user?.id || user?.userId;
    if (!userId) { setBookingsLoading(false); return; }
    ticketService.getAll({ accountId: userId, size: 50 })
      .then(res => {
        const list = Array.isArray(res?.content) ? res.content
          : Array.isArray(res?.data?.content) ? res.data.content
          : Array.isArray(res?.data) ? res.data
          : Array.isArray(res) ? res : [];
          
        // Lọc bỏ vé "pending" (chờ thanh toán) nếu đã quá 10 phút kể từ lúc tạo (ticketsDate)
        const now = new Date();
        const validList = list.filter(t => {
          if (t.paymentStatus !== 'PAID' && t.status !== 'CONFIRMED') {
            let tDate = null;
            if (t.ticketsDate) {
              if (typeof t.ticketsDate === 'string' && t.ticketsDate.includes('-') && t.ticketsDate.split('-')[0].length === 2) {
                const [datePart, timePart] = t.ticketsDate.split(' ');
                const [dd, mm, yyyy] = datePart.split('-');
                tDate = new Date(`${yyyy}-${mm}-${dd}T${timePart || '00:00:00'}`);
              } else {
                tDate = new Date(t.ticketsDate);
              }
            }
            if (tDate) {
              const diffMinutes = (now - tDate) / 1000 / 60;
              if (diffMinutes > 10) return false; // xoá / ẩn đi
            }
          }
          return true;
        });

        // Normalize ticket → BookingCard format
        const normalized = validList.map(t => {
          const now = new Date();
          let ticketDate = null;
          const displayDateStr = t.slotsShowTime || t.ticketsDate;
          if (displayDateStr) {
            if (typeof displayDateStr === 'string' && displayDateStr.includes('-') && displayDateStr.split('-')[0].length === 2) {
              const [datePart, timePart] = displayDateStr.split(' ');
              const [dd, mm, yyyy] = datePart.split('-');
              ticketDate = new Date(`${yyyy}-${mm}-${dd}T${timePart || '00:00:00'}`);
            } else {
              ticketDate = new Date(displayDateStr);
            }
          }
          const isUpcoming = ticketDate && ticketDate > now;
          const seatLabels = (t.seats || []).map(s => `${s.seatsRow || ''}${s.seatsNumber || ''}`).filter(Boolean);
          
          let parsedStatus = 'pending';
          if (t.status === 'CANCELLED') {
            parsedStatus = 'cancelled';
          } else if (t.paymentStatus === 'PAID') {
            parsedStatus = isUpcoming ? 'upcoming' : 'completed';
          }

          const localDateStr = ticketDate ? `${ticketDate.getFullYear()}-${String(ticketDate.getMonth() + 1).padStart(2, '0')}-${String(ticketDate.getDate()).padStart(2, '0')}` : '';
          const localTimeStr = ticketDate ? `${String(ticketDate.getHours()).padStart(2, '0')}:${String(ticketDate.getMinutes()).padStart(2, '0')}` : '';

          return {
            id: t.ticketsCode || `#${t.id}`,
            ticketId: t.id,
            movieId: t.movieId,
            movie: t.movieName || t.note || 'Vé xem phim',
            poster: t.posterUrl || null,
            cinema: t.cinemaName || 'CGV Cinemas',
            room: t.roomName || 'Phòng tiêu chuẩn',
            date: localDateStr,
            time: localTimeStr,
            type: '',
            seats: seatLabels,
            total: parseFloat(t.finalAmount || t.totalAmount || 0),
            status: parsedStatus,
            rawPaymentStatus: t.paymentStatus,
            rawTicketDate: t.ticketsDate || t.createDate,
          };
        });
        
        normalized.sort((a, b) => b.ticketId - a.ticketId);
        
        setBookings(normalized);
      })
      .catch(err => console.error('[Profile] fetch tickets error:', err.message))
      .finally(() => setBookingsLoading(false));
  }, [user]);

  // Fetch all movies (for favorites tab)
  useEffect(() => {
    movieService.getAll().then(data => setAllMovies(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  // Fetch redeemable offers (admin created vouchers with requiredPoints > 0)
  useEffect(() => {
    promotionService.getAll({ size: 100 })
      .then(res => {
        const raw = Array.isArray(res) ? res : (res?.content || res?.data || []);
        const activeAndRedeemable = raw.filter(p => {
          if (p.isDeleted || p.deleted || p.status === 'INACTIVE') return false;
          if (!p.requiredPoints || p.requiredPoints <= 0) return false;
          
          if (p.endDate) {
            let parsedExp = null;
            if (typeof p.endDate === 'string' && p.endDate.includes('-') && p.endDate.split('-')[0].length === 2) {
              const [datePart, timePart] = p.endDate.split(' ');
              const [dd, mm, yyyy] = datePart.split('-');
              parsedExp = new Date(`${yyyy}-${mm}-${dd}T${timePart || '23:59:59'}`);
            } else {
              parsedExp = new Date(p.endDate);
            }
            if (!isNaN(parsedExp.getTime()) && parsedExp < new Date()) return false;
          }
          return true;
        });
        
        setRedeemableOffers(activeAndRedeemable.map(p => ({
          id: p.id,
          code: p.promotionCode,
          title: p.promotionName || p.promotionCode,
          desc: p.description,
          points: p.requiredPoints,
          color: 'border-primary/40 bg-primary/5',
          original: p
        })));
      })
      .catch(err => console.error('[Profile] fetch redeemable vouchers error:', err.message));
  }, []);

  // Review Modal state
  const [reviewModal, setReviewModal] = useState({ open: false, booking: null });
  const [ticketDetailModal, setTicketDetailModal] = useState({ open: false, booking: null });
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [showPointsTable, setShowPointsTable] = useState(false);

  // Polling for payos payment
  useEffect(() => {
    let pollInterval;
    if (payosData) {
      pollInterval = setInterval(async () => {
        try {
          const ticket = await ticketService.getById(payosData.ticketId, { _t: Date.now() });
          if (ticket && (ticket.paymentStatus === 'PAID' || ticket.status === 'CONFIRMED')) {
            clearInterval(pollInterval);
            setPayosData(null);
            addNotification({ type: 'success', title: 'Thành công', message: 'Thanh toán vé thành công!' });
            window.location.reload(); 
          }
        } catch (e) {}
      }, 3000);
    }
    return () => clearInterval(pollInterval);
  }, [payosData]);

  // Countdown timer
  useEffect(() => {
    let timer;
    if (payosData && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && payosData) {
      if (payosData?.ticketId) {
        ticketService.update(payosData.ticketId, { status: 'CANCELLED', paymentStatus: 'UNPAID' }).catch(err => console.error(err));
      }
      setPayosData(null);
      addNotification({ type: 'error', title: 'Hết hạn', message: 'Đã hết thời gian thanh toán (10 phút). Giao dịch bị huỷ!' });
      window.location.reload();
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [payosData, timeLeft]);

  const handlePay = async (booking) => {
    try {
      const ticketDateStr = booking.rawTicketDate;
      let ticketDate = new Date();
      if (ticketDateStr) {
        if (typeof ticketDateStr === 'string' && ticketDateStr.includes('-') && ticketDateStr.split('-')[0].length === 2) {
          const [datePart, timePart] = ticketDateStr.split(' ');
          const [dd, mm, yyyy] = datePart.split('-');
          ticketDate = new Date(`${yyyy}-${mm}-${dd}T${timePart || '00:00:00'}`);
        } else {
          ticketDate = new Date(ticketDateStr);
        }
      }
      
      const now = new Date();
      const diffSecs = Math.floor((now - ticketDate) / 1000);
      let remaining = 600 - diffSecs;
      
      if (remaining <= 0) {
        addNotification({ type: 'error', title: 'Lỗi', message: 'Vé này đã hết hạn thanh toán.' });
        return;
      }
      
      const payosResponse = await payosService.createPaymentLink(booking.ticketId);
      if (payosResponse && payosResponse.qrCode) {
        setPayosData({ ...payosResponse, ticketId: booking.ticketId });
        setTimeLeft(remaining);
      } else {
        addNotification({ type: 'error', title: 'Lỗi', message: 'Không thể tạo mã thanh toán từ PayOS.' });
      }
    } catch (e) {
      addNotification({ type: 'error', title: 'Lỗi', message: 'Không thể tạo mã thanh toán. Có thể vé đã bị xử lý hoặc hệ thống quá tải.' });
    }
  };

  const handleCancel = async (booking) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy vé này? Ghế của bạn sẽ không còn được giữ nữa.')) {
      try {
        await ticketService.update(booking.ticketId, { status: 'CANCELLED', paymentStatus: 'UNPAID' });
        setBookings(prev => prev.map(b => b.ticketId === booking.ticketId ? { ...b, status: 'cancelled' } : b));
        addNotification({ type: 'success', title: 'Thành công', message: 'Hủy vé thành công.' });
      } catch (err) {
        console.error('Lỗi khi hủy vé:', err);
        addNotification({ type: 'error', title: 'Lỗi', message: 'Không thể hủy vé. Vui lòng thử lại.' });
      }
    }
  };

  const filteredBookings = filterStatus === 'all'
    ? bookings
    : bookings.filter(b => b.status === filterStatus);

  useEffect(() => {
    if (tabParam) setActiveTab(tabParam);
  }, [tabParam]);

  useEffect(() => { window.scrollTo(0, 0); }, [activeTab]);

  const handleSaveProfile = async () => {
    const userId = user?.id || user?.userId;
    if (userId) {
      try {
        await accountService.update(userId, {
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone,
        });
        addNotification({ type: 'success', title: 'Cập nhật thành công', message: 'Thông tin cá nhân đã được lưu.' });
      } catch {
        addNotification({ type: 'error', title: 'Lỗi', message: 'Không thể cập nhật thông tin.' });
      }
    }
    setUserData({ ...formData });
    setEditMode(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    if (passwordForm.oldPassword === passwordForm.newPassword) {
      setPasswordError('Mật khẩu mới không được trùng với mật khẩu cũ.');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.post('/v1/auth/change-password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword
      });
      setPasswordSuccess(true);
      
      // Logout and redirect after a short delay
      setTimeout(() => {
        setPasswordSuccess(false);
        setIsChangingPassword(false);
        logout();
        navigate('/login');
      }, 2500);
      
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu cũ.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleOpenReview = (booking) => {
    setReviewModal({ open: true, booking });
    setReviewForm({ rating: 0, comment: '' });
    setReviewSuccess(false);
  };

  const [submittingReview, setSubmittingReview] = useState(false);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.rating || !reviewForm.comment.trim()) return;
    const userId = user?.id || user?.userId;
    let movieId = reviewModal.booking?.movieId;

    if (!movieId) {
      // Fallback: Tìm ID phim trong danh sách phim dựa trên tên phim
      const matchedMovie = allMovies?.find(m => 
        reviewModal.booking?.movie && m.title && 
        (reviewModal.booking.movie === m.title || reviewModal.booking.movie.includes(m.title))
      );
      movieId = matchedMovie?.id;
    }

    if (!userId) {
      addNotification({ type: 'error', title: 'Lỗi', message: 'Vui lòng đăng nhập để đánh giá.' });
      return;
    }
    
    if (!movieId) {
      addNotification({ type: 'error', title: 'Lỗi', message: 'Không tìm thấy thông tin phim của vé này. Backend có thể chưa được khởi động lại.' });
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post('/v1/movie-reviews', {
        accountId: userId,
        movieId: movieId,
        ticketId: reviewModal.booking?.ticketId,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      setReviewSuccess(true);
      setTimeout(() => {
        setReviewModal({ open: false, booking: null });
        setReviewSuccess(false);
      }, 2000);
    } catch (err) {
      addNotification({ type: 'error', title: 'Lỗi', message: err.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá.' });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleRedeem = async (offer) => {
    if (userData.points < offer.points) {
      addNotification({ type: 'error', title: 'Không đủ điểm', message: `Bạn cần thêm ${offer.points - userData.points} điểm để đổi ${offer.title}.` });
      return;
    }
    
    const userId = user?.id || user?.userId;
    if (!userId) {
      addNotification({ type: 'error', title: 'Lỗi', message: 'Vui lòng đăng nhập để đổi điểm.' });
      return;
    }
    
    try {
      // Gọi API trừ điểm (cộng vào history_points)
      await api.post(`/v1/accounts/${userId}/redeem-points`, { points: offer.points });
      
      setUserData({ ...userData, points: userData.points - offer.points });
      const newOwned = [
        { id: Date.now().toString(), code: offer.code, desc: offer.desc, exp: '30 ngày kể từ ngày đổi', color: offer.color, original: offer.original },
        ...ownedVouchers
      ];
      setOwnedVouchers(newOwned);
      localStorage.setItem(`ownedVouchers_${userId}`, JSON.stringify(newOwned));
      
      addNotification({ type: 'success', title: 'Đổi ưu đãi thành công', message: `Bạn đã đổi thành công ${offer.title} với ${offer.points} điểm.` });
    } catch (err) {
      addNotification({ type: 'error', title: 'Lỗi', message: 'Có lỗi xảy ra khi đổi điểm. Vui lòng thử lại sau.' });
    }
  };

  // Loading skeleton khi chưa có userData
  if (profileLoading || !userData) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-5"
        >
          <Avatar name={userData.name} size="lg" />

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
              <h1 className="font-heading font-extrabold text-2xl text-white">{userData.name}</h1>
              <span className={`badge inline-flex self-center sm:self-auto text-xs font-bold px-2.5 py-1 ${
                userData.memberLevel === 'Gold' ? 'bg-primary/20 border border-primary/40 text-primary' :
                userData.memberLevel === 'Silver' ? 'bg-gray-400/20 border border-gray-400/40 text-gray-300' :
                'bg-orange-500/20 border border-orange-500/40 text-orange-400'
              }`}>
                {userData.memberLevel === 'Gold' ? '⭐' : '🥈'} {userData.memberLevel} Member
              </span>
            </div>
            <p className="text-cinema-muted text-sm mb-3">{userData.email} · {userData.phone}</p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-6">
              <div>
                <p className="text-primary font-heading font-bold text-xl">{userData.totalBookings}</p>
                <p className="text-cinema-muted text-xs">Vé đã đặt</p>
              </div>
              <div>
                <p className="text-primary font-heading font-bold text-xl">
                  {(userData.totalSpent / 1000000).toFixed(1)}M
                </p>
                <p className="text-cinema-muted text-xs">Tổng chi tiêu</p>
              </div>
              <div>
                <p className="text-primary font-heading font-bold text-xl">
                  {userData.joinDate && !isNaN(new Date(userData.joinDate).getTime())
                    ? new Date(userData.joinDate).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short' })
                    : '--'}
                </p>
                <p className="text-cinema-muted text-xs">Ngày tham gia</p>
              </div>
            </div>
          </div>
        </motion.div>
        {/* Tabs */}
        <div className="flex gap-1 bg-cinema-surface rounded-xl p-1 border border-cinema-border mb-6">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-cinema-card border border-cinema-border text-white shadow'
                  : 'text-cinema-muted hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 gap-5"
            >
              {/* Recent Bookings */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-bold text-white">Vé gần đây</h3>
                  <button onClick={() => setActiveTab('bookings')} className="text-primary text-xs hover:text-primary/80 transition-colors">
                    Xem tất cả →
                  </button>
                </div>
                <div className="space-y-3">
                  {bookingsLoading ? (
                    <p className="text-cinema-muted text-xs animate-pulse text-center py-4">Đang tải lịch sử vé...</p>
                  ) : bookings.length === 0 ? (
                    <p className="text-cinema-muted text-xs text-center py-4">Chưa có vé nào.</p>
                  ) : bookings.slice(0, 2).map(b => (
                    <div key={b.id} className="flex gap-3 items-center">
                      <div className="w-10 h-14 flex-shrink-0 rounded-lg bg-cinema-dark border border-cinema-border flex items-center justify-center text-2xl">🎟️</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{b.id}</p>
                        <p className="text-cinema-muted text-xs">{b.date || 'N/A'} · {b.total.toLocaleString('vi-VN')}đ</p>
                      </div>
                      <span className={`badge border text-xs ${STATUS_CONFIG[b.status]?.color || 'bg-cinema-border/30 text-cinema-muted'}`}>
                        {STATUS_CONFIG[b.status]?.label || b.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Summary */}
              <div className="card p-5">
                <h3 className="font-heading font-bold text-white mb-4">Hoạt động</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-cinema-border">
                    <span className="text-cinema-muted text-sm">Phim yêu thích</span>
                    <span className="text-white font-bold">{favorites.length} phim</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-cinema-muted text-sm">Ưu đãi khả dụng</span>
                    <span className="text-white font-bold">{ownedVouchers.length} voucher</span>
                  </div>
                </div>
              </div>

              {/* Loyalty Progress */}
              <div className="card p-5 md:col-span-2">
                <h3 className="font-heading font-bold text-white mb-4">Điểm thành viên</h3>
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-center">
                    <p className="text-primary font-heading font-extrabold text-3xl">{userData.points.toLocaleString('vi-VN')}</p>
                    <p className="text-cinema-muted text-xs mt-0.5">điểm hiện tại</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-cinema-muted">Gold (2,000đ)</span>
                      <span className="text-cinema-muted">Platinum (5,000đ)</span>
                    </div>
                    <div className="h-3 bg-cinema-surface rounded-full overflow-hidden border border-cinema-border">
                      <div
                        className="h-full bg-gradient-gold rounded-full transition-all duration-1000"
                        style={{ width: `${(userData.points / 5000) * 100}%` }}
                      />
                    </div>
                    <p className="text-cinema-muted text-xs mt-1.5">Còn {(5000 - userData.points).toLocaleString('vi-VN')} điểm để lên hạng <span className="text-white font-semibold">Platinum</span></p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'bookings' && (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Filter */}
              <div className="flex gap-2 mb-5 flex-wrap">
                {[
                  { value: 'all', label: 'Tất cả' },
                  { value: 'upcoming', label: '🕐 Sắp tới' },
                  { value: 'completed', label: '✅ Đã xem' },
                  { value: 'cancelled', label: '❌ Đã hủy' },
                ].map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFilterStatus(f.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                      filterStatus === f.value
                        ? 'bg-primary border-primary text-cinema-black'
                        : 'border-cinema-border text-cinema-muted hover:border-cinema-muted hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Booking list */}
              <div className="space-y-3">
                {bookingsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                    <span className="text-cinema-muted ml-3 text-sm">Đang tải vé...</span>
                  </div>
                ) : filteredBookings.length > 0 ? (
                  filteredBookings.map(b => <BookingCard key={b.id} booking={b} onViewDetail={(b) => setTicketDetailModal({ open: true, booking: b })} onRate={handleOpenReview} onPay={handlePay} onCancel={handleCancel} allMovies={allMovies} />)
                ) : (
                  <div className="text-center py-16">
                    <div className="text-5xl mb-3">🎟️</div>
                    <p className="text-white font-semibold mb-1">Chưa có vé nào</p>
                    <p className="text-cinema-muted text-sm mb-4">Đặt vé ngay để trải nghiệm điện ảnh!</p>
                    <Link to="/movies" className="btn-primary inline-block px-6 py-2.5 text-sm">Xem phim ngay</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'favorites' && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {favorites.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {allMovies.filter(m => favorites.includes(m.id)).map((movie, index) => (
                    <MovieCard key={movie.id} movie={movie} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-cinema-card border border-cinema-border rounded-2xl">
                  <div className="text-5xl mb-3">❤️</div>
                  <p className="text-white font-semibold mb-1">Chưa có phim yêu thích</p>
                  <p className="text-cinema-muted text-sm mb-4">Hãy thêm các bộ phim bạn muốn xem vào đây nhé!</p>
                  <Link to="/movies" className="btn-primary inline-block px-6 py-2.5 text-sm">Khám phá phim</Link>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'offers' && (
            <motion.div
              key="offers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* ── Hạng thành viên hiện tại ── */}
              {(() => {
                const rank = getRankByPoints(userData.points);
                const { progress, nextRank, pointsNeeded } = getRankProgress(userData.points);
                return (
                  <div className={`card p-6 border ${rank.borderColor} ${rank.bgColor} relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 pointer-events-none"
                      style={{ background: `radial-gradient(circle, ${rank.gradientTo}, transparent)`, transform: 'translate(30%, -30%)' }} />
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-5">
                      <div className="text-5xl">{rank.icon}</div>
                      <div className="flex-1">
                        <p className="text-cinema-muted text-xs mb-0.5">Hạng thành viên của bạn</p>
                        <h3 className={`font-heading font-extrabold text-2xl ${rank.color}`}>{rank.label} Member</h3>
                        <p className="text-cinema-muted text-xs mt-1">
                          {rank.maxPoints === Infinity
                            ? 'Bạn đang ở hạng cao nhất 🎉'
                            : `Còn ${pointsNeeded.toLocaleString('vi-VN')} điểm để lên hạng ${nextRank?.icon} ${nextRank?.label}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-heading font-extrabold text-3xl ${rank.color}`}>{userData.points.toLocaleString('vi-VN')}</p>
                        <p className="text-cinema-muted text-xs">điểm hiện có</p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    {nextRank && (
                      <div>
                        <div className="flex justify-between text-[11px] mb-1.5">
                          <span className={rank.color}>{rank.icon} {rank.minPoints.toLocaleString('vi-VN')} điểm</span>
                          <span className={nextRank.color}>{nextRank.icon} {nextRank.minPoints.toLocaleString('vi-VN')} điểm</span>
                        </div>
                        <div className="h-3 bg-cinema-surface rounded-full overflow-hidden border border-cinema-border">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${rank.gradientFrom}, ${rank.gradientTo})` }}
                          />
                        </div>
                        <p className="text-cinema-muted text-xs mt-1.5 text-right">{Math.round(progress)}% đến hạng <span className={nextRank.color}>{nextRank.label}</span></p>
                      </div>
                    )}
                    {/* Quyền lợi hạng hiện tại */}
                    <div className="mt-4 pt-4 border-t border-cinema-border/50">
                      <p className="text-white text-xs font-semibold mb-2">Quyền lợi của bạn:</p>
                      <div className="flex flex-wrap gap-2">
                        {rank.perks.map(p => (
                          <span key={p} className="text-[11px] text-cinema-muted border border-cinema-border/60 rounded-full px-2.5 py-1 bg-cinema-card/50">
                            ✓ {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ── Tất cả các hạng ── */}
              <div className="card p-5">
                <h3 className="font-heading font-bold text-white mb-4 text-base">🏆 Hệ thống xếp hạng thành viên</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                  {RANKS.map(rank => {
                    const isCurrent = getRankByPoints(userData.points).key === rank.key;
                    return (
                      <div key={rank.key} className={`rounded-xl border p-4 transition-all ${rank.borderColor} ${rank.bgColor} ${isCurrent ? 'ring-2 ring-offset-2 ring-offset-cinema-dark' : ''}`}
                        style={isCurrent ? { ringColor: rank.gradientTo } : {}}>
                        {isCurrent && <span className="text-[10px] font-bold text-green-400 block mb-1">● Hạng của bạn</span>}
                        <div className="text-xl mb-1">{rank.icon}</div>
                        <p className={`font-heading font-bold ${rank.color}`}>{rank.label}</p>
                        <p className="text-cinema-muted text-[10px] mt-0.5 mb-2">
                          {rank.maxPoints === Infinity ? `≥ ${rank.minPoints.toLocaleString('vi-VN')} điểm`
                            : `${rank.minPoints.toLocaleString('vi-VN')}–${rank.maxPoints.toLocaleString('vi-VN')}`}
                        </p>
                        <ul className="space-y-0.5">
                          {rank.perks.slice(0, 3).map(p => (
                            <li key={p} className="text-[10px] text-cinema-muted flex items-start gap-1">
                              <span className="text-green-400 flex-shrink-0">✓</span>{p}
                            </li>
                          ))}
                          {rank.perks.length > 3 && <li className="text-[10px] text-cinema-muted">+{rank.perks.length - 3} quyền lợi khác</li>}
                        </ul>
                      </div>
                    );
                  })}
                </div>

                {/* Bảng tích điểm */}
                <div className="mt-6 border-t border-cinema-border pt-5">
                  <button 
                    onClick={() => setShowPointsTable(!showPointsTable)}
                    className="flex items-center justify-between w-full text-white text-sm font-semibold hover:text-primary transition-colors"
                  >
                    <span>🎟️ Tích điểm theo dịch vụ (10.000đ = 1 điểm)</span>
                    <motion.svg animate={{ rotate: showPointsTable ? 180 : 0 }} className="w-5 h-5 text-cinema-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </button>
                  <AnimatePresence>
                    {showPointsTable && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="overflow-x-auto mt-4">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-cinema-border">
                                <th className="text-left py-2 px-2 text-cinema-muted">Dịch vụ</th>
                                <th className="text-right py-2 px-2 text-cinema-muted">Giá</th>
                                <th className="text-right py-2 px-2 text-orange-400">🥉</th>
                                <th className="text-right py-2 px-2 text-gray-300">🥈</th>
                                <th className="text-right py-2 px-2 text-yellow-400">🥇×1.2</th>
                                <th className="text-right py-2 px-2 text-cyan-400">💎×1.5</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-cinema-border/30">
                              {POINT_EARN_EXAMPLES.map(e => (
                                <tr key={e.label} className="hover:bg-cinema-card/30 transition-colors">
                                  <td className="py-1.5 px-2 text-white">{e.icon} {e.label}</td>
                                  <td className="py-1.5 px-2 text-right text-cinema-muted">{(e.price/1000).toFixed(0)}K</td>
                                  <td className="py-1.5 px-2 text-right text-orange-400 font-semibold">+{e.points}</td>
                                  <td className="py-1.5 px-2 text-right text-gray-300 font-semibold">+{e.points}</td>
                                  <td className="py-1.5 px-2 text-right text-yellow-400 font-semibold">+{Math.floor(e.points*1.2)}</td>
                                  <td className="py-1.5 px-2 text-right text-cyan-400 font-semibold">+{Math.floor(e.points*1.5)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* ── Đổi điểm ── */}
              <div className="card p-6">
                <h3 className="font-heading font-bold text-white mb-4 text-lg border-b border-cinema-border pb-3">🎁 Đổi điểm thưởng</h3>
                <div className="flex items-center gap-3 mb-6 bg-primary/10 border border-primary/20 p-4 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-xl shadow-glow-gold">💎</div>
                  <div>
                    <p className="text-cinema-muted text-sm">Điểm hiện có</p>
                    <p className="text-white font-bold text-xl">{userData.points.toLocaleString('vi-VN')} <span className="text-primary text-sm font-normal">điểm</span></p>
                  </div>
                </div>
                {redeemableOffers.filter(offer => {
                  const limit = offer.original?.usagePerUser || 1; // Mặc định 1 nếu không set
                  const count = ownedVouchers.filter(v => v.code === offer.code).length;
                  return count < limit;
                }).length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {redeemableOffers.filter(offer => {
                      const limit = offer.original?.usagePerUser || 1;
                      const count = ownedVouchers.filter(v => v.code === offer.code).length;
                      return count < limit;
                    }).map(v => (
                      <div key={v.id} className={`rounded-xl border p-5 ${v.color} flex flex-col`}>
                        <div className="mb-2">
                          <span className="font-heading font-bold text-white text-base block">{v.title}</span>
                          <p className="text-cinema-muted text-sm mt-1">{v.desc}</p>
                        </div>
                        <div className="mt-auto pt-4 flex items-center justify-between border-t border-cinema-border/50">
                          <span className="font-bold text-primary">{v.points} điểm</span>
                          <button
                            onClick={() => handleRedeem(v)}
                            disabled={userData.points < v.points}
                            className="btn-primary text-xs px-4 py-1.5 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            {userData.points >= v.points ? 'Đổi ngay' : 'Chưa đủ điểm'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-cinema-muted text-center py-8">Hiện tại chưa có ưu đãi đổi điểm nào.</p>
                )}
              </div>

              {/* ── Ưu đãi đang có ── */}
              <div className="card p-6">
                <h3 className="font-heading font-bold text-white mb-6 text-lg border-b border-cinema-border pb-3">🎫 Ưu đãi đang có</h3>
                {ownedVouchers.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {ownedVouchers.map(v => (
                      <div key={v.id} className={`rounded-xl border p-5 ${v.color}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono font-bold text-primary text-lg">{v.code}</span>
                          <button className="text-sm text-cinema-muted hover:text-white transition-colors border border-cinema-border px-3 py-1 rounded-lg bg-cinema-black/40">
                            Sao chép
                          </button>
                        </div>
                        <p className="text-white font-medium mb-1">{v.desc}</p>
                        <p className="text-cinema-muted text-xs">HSD: {v.exp}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-cinema-muted text-center py-8">Bạn chưa có ưu đãi nào khả dụng.</p>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 gap-5"
            >
              {/* Edit Profile */}
              <div className="card p-6 md:col-span-2">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-heading font-bold text-white">Thông tin cá nhân</h3>
                  {!editMode ? (
                    <div className="flex gap-2">
                      <button onClick={() => { setIsChangingPassword(true); setPasswordSuccess(false); setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' }); }} className="btn-outline text-sm px-4 py-2 border-primary text-primary hover:bg-primary/10">
                        🔒 Đổi mật khẩu
                      </button>
                      <button onClick={() => setEditMode(true)} className="btn-outline text-sm px-4 py-2">
                        ✏️ Chỉnh sửa
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => { setEditMode(false); setFormData({ ...userData }); }} className="btn-outline text-sm px-4 py-2">Huỷ</button>
                      <button onClick={handleSaveProfile} className="btn-primary text-sm px-4 py-2">Lưu</button>
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { key: 'name', label: 'Họ và tên', type: 'text' },
                    { key: 'phone', label: 'Số điện thoại', type: 'tel' },
                    { key: 'email', label: 'Email', type: 'email' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-cinema-muted text-xs mb-1.5">{field.label}</label>
                      {editMode ? (
                        <input
                          type={field.type}
                          value={formData[field.key]}
                          onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                          className="input-field"
                        />
                      ) : (
                        <p className="text-white py-3 px-4 bg-cinema-surface rounded-lg border border-cinema-border text-sm">
                          {userData[field.key]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Ngày tạo — readonly */}
                {userData.joinDate && (
                  <div className="mt-4 pt-4 border-t border-cinema-border/50">
                    <label className="block text-cinema-muted text-xs mb-1.5">📅 Ngày tạo tài khoản</label>
                    <p className="text-white py-3 px-4 bg-cinema-surface rounded-lg border border-cinema-border text-sm flex items-center gap-2">
                      {new Date(userData.joinDate).toLocaleDateString('vi-VN', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      })}
                      <span className="text-cinema-muted text-xs ml-auto">Không thể thay đổi</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Notification Settings */}
              <div className="card p-6 md:col-span-2">
                <h3 className="font-heading font-bold text-white mb-4">Thông báo</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Email xác nhận đặt vé', checked: true },
                    { label: 'Thông báo phim mới', checked: true },
                    { label: 'Ưu đãi và khuyến mãi', checked: false },
                    { label: 'Nhắc nhở trước suất chiếu', checked: true },
                  ].map(item => (
                    <label key={item.label} className="flex items-center justify-between cursor-pointer group">
                      <span className="text-cinema-text text-sm group-hover:text-white transition-colors">{item.label}</span>
                      <div className="relative">
                        <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                        <div className="w-11 h-6 bg-cinema-border rounded-full peer-checked:bg-primary transition-colors cursor-pointer" />
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="card p-6 border-red-500/20 bg-red-500/5 md:col-span-2">
                <h3 className="font-heading font-bold text-red-400 mb-2">Vùng nguy hiểm</h3>
                <p className="text-cinema-muted text-sm mb-4">Các thao tác này không thể hoàn tác. Hãy cân nhắc kỹ trước khi thực hiện.</p>
                <div className="flex flex-wrap gap-3">
                  <button className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-all">
                    Xoá lịch sử đặt vé
                  </button>
                  <button className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-all">
                    Đăng xuất tất cả thiết bị
                  </button>
                  <button className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/20 text-sm transition-all font-medium">
                    Xoá tài khoản
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cinema-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-cinema-dark border border-cinema-border rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => setReviewModal({ open: false, booking: null })}
                className="absolute top-4 right-4 text-cinema-muted hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h3 className="font-heading font-bold text-xl text-white mb-2">Đánh giá phim</h3>
              <p className="text-cinema-muted text-sm mb-6 flex items-center gap-2">
                <span className="font-semibold text-white">{reviewModal.booking?.movie}</span>
              </p>

              {reviewSuccess ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">✅</div>
                  <h4 className="text-white font-bold text-lg mb-2">Đánh giá thành công!</h4>
                  <p className="text-cinema-muted text-sm">Cảm ơn bạn đã chia sẻ cảm nhận.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-5">
                  <div>
                    <label className="block text-cinema-muted text-sm mb-2 font-medium">Điểm đánh giá <span className="text-red-400">*</span></label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className="hover:scale-110 transition-transform"
                        >
                          <svg className={`w-8 h-8 ${reviewForm.rating >= star ? 'text-primary' : 'text-cinema-border'}`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-cinema-muted text-sm mb-2 font-medium">Cảm nhận của bạn <span className="text-red-400">*</span></label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      placeholder="Chia sẻ vài dòng về bộ phim..."
                      rows={4}
                      className="input-field resize-none w-full"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={!reviewForm.rating || !reviewForm.comment.trim() || submittingReview}
                    className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {submittingReview ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Đang gửi...
                      </>
                    ) : 'Gửi đánh giá'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ticket Detail Modal */}
      <AnimatePresence>
        {ticketDetailModal.open && ticketDetailModal.booking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cinema-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-cinema-card border border-cinema-border p-6 rounded-2xl w-full max-w-md relative overflow-hidden"
            >
              <button
                onClick={() => setTicketDetailModal({ open: false, booking: null })}
                className="absolute top-4 right-4 text-cinema-muted hover:text-white transition-colors z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h3 className="font-heading font-bold text-xl text-white mb-6 border-b border-cinema-border/50 pb-3">
                Chi Tiết Vé
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-cinema-muted text-sm">Mã vé:</span>
                  <span className="font-mono text-white text-sm font-semibold">{ticketDetailModal.booking.id}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-cinema-muted text-sm">Tên phim:</span>
                  <span className="text-white text-sm font-semibold text-right flex-1 ml-4">{ticketDetailModal.booking.movie}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-cinema-muted text-sm">Rạp chiếu:</span>
                  <span className="text-white text-sm font-semibold text-right flex-1 ml-4">{ticketDetailModal.booking.cinema}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-cinema-muted text-sm">Phòng chiếu:</span>
                  <span className="text-white text-sm font-semibold text-right">{ticketDetailModal.booking.room}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-cinema-muted text-sm">Suất chiếu:</span>
                  <span className="text-white text-sm font-semibold text-right text-primary">{ticketDetailModal.booking.date} lúc {ticketDetailModal.booking.time}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-cinema-muted text-sm">Ghế:</span>
                  <span className="text-white text-sm font-semibold text-right text-accent">{ticketDetailModal.booking.seats.join(', ')}</span>
                </div>

                {ticketDetailModal.booking.products && ticketDetailModal.booking.products.length > 0 && (
                  <div className="pt-2 border-t border-cinema-border/30 mt-2">
                    <span className="text-cinema-muted text-sm block mb-2">Sản phẩm đi kèm:</span>
                    <ul className="text-sm space-y-1.5">
                      {ticketDetailModal.booking.products.map((p, idx) => (
                        <li key={idx} className="flex justify-between text-white/90">
                          <span>{p.quantity}x {p.productsName}</span>
                          <span className="text-cinema-muted font-mono">{p.totalPrice.toLocaleString('vi-VN')}đ</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-cinema-border/50 flex justify-between items-center">
                <span className="text-cinema-muted font-medium text-sm">Tổng tiền</span>
                <span className="text-primary font-heading font-bold text-xl">{ticketDetailModal.booking.total.toLocaleString('vi-VN')}đ</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PayOS Modal */}
      <AnimatePresence>
        {payosData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-cinema-black/80 backdrop-blur-sm z-0" onClick={() => setPayosData(null)}></div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card p-8 max-w-md w-full text-center relative z-10 border-primary/50 shadow-glow-gold"
            >
              <div className="flex justify-center mb-4">
                 <svg viewBox="0 0 140 40" className="h-10 w-auto" xmlns="http://www.w3.org/2000/svg">
                   <rect width="140" height="40" rx="8" fill="#0052FF"/>
                   <rect x="10" y="8" width="24" height="24" rx="6" fill="white" />
                   <rect x="15" y="13" width="14" height="14" rx="2" fill="#0052FF" />
                   <rect x="18" y="16" width="8" height="8" fill="white" />
                   <text x="44" y="25" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial, sans-serif">VietQR PayOS</text>
                 </svg>
              </div>
              <h2 className="font-heading font-bold text-2xl text-white mb-2">Thanh Toán Trực Tuyến</h2>
              <p className="text-cinema-muted text-sm mb-6">Mở ứng dụng ngân hàng và quét mã hoặc bấm nút thanh toán</p>
              
              {payosData.qrCode ? (
                <div className="bg-white p-3 rounded-2xl inline-block mb-6 shadow-xl">
                  <QRCodeCanvas value={payosData.qrCode} size={224} />
                </div>
              ) : (
                <div className="mb-6">
                  <a href={`https://pay.payos.vn/web/${payosData.id}`} target="_blank" rel="noopener noreferrer" className="btn-primary px-8 py-3 rounded-xl inline-block shadow-lg hover:scale-105 transition-transform font-bold">
                    Mở trang thanh toán PayOS
                  </a>
                  <p className="text-xs text-cinema-muted mt-3">Sau khi thanh toán thành công, hệ thống sẽ tự động cập nhật.</p>
                </div>
              )}

              <div className="bg-cinema-surface rounded-xl p-4 mb-6 text-left border border-cinema-border/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-cinema-muted">Số tiền:</span>
                  <span className="text-primary font-bold text-xl">{payosData.amount.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-cinema-muted">Nội dung:</span>
                  <span className="text-white font-medium text-right max-w-[200px] break-words">{payosData.description}</span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-2 mb-6">
                <p className="text-cinema-muted text-sm">Thời gian còn lại:</p>
                <div className={`text-4xl font-mono font-bold ${timeLeft <= 60 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
                  {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{Math.floor(timeLeft % 60).toString().padStart(2, '0')}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-cinema-muted">
                    Hệ thống đang chờ bạn thanh toán...
                  </p>
                </div>
              </div>
              
              <button 
                onClick={async () => {
                  if (payosData?.ticketId) {
                    try {
                      await ticketService.update(payosData.ticketId, { status: 'CANCELLED', paymentStatus: 'UNPAID' });
                      setBookings(prev => prev.map(b => b.ticketId === payosData.ticketId ? { ...b, status: 'cancelled' } : b));
                      addNotification({ type: 'success', title: 'Thành công', message: 'Hủy vé thành công.' });
                    } catch (err) {
                      console.error('Lỗi khi hủy vé:', err);
                      addNotification({ type: 'error', title: 'Lỗi', message: 'Không thể hủy vé.' });
                    }
                  }
                  setPayosData(null); 
                }}
                className="text-cinema-muted hover:text-red-400 transition-colors underline text-sm"
              >
                Hủy thanh toán
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Change Password Modal */}
      <AnimatePresence>
        {isChangingPassword && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-cinema-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-cinema-card border border-cinema-border rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => { setIsChangingPassword(false); setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' }); }}
                className="absolute top-4 right-4 text-cinema-muted hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h3 className="font-heading font-bold text-xl text-white mb-6">Đổi mật khẩu</h3>
              
              {passwordSuccess ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">✅</div>
                  <h4 className="text-white font-bold text-lg mb-2">Đổi mật khẩu thành công!</h4>
                  <p className="text-cinema-muted text-sm">Hệ thống sẽ tự động đăng xuất sau vài giây để bạn đăng nhập lại với mật khẩu mới.</p>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {passwordError && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm flex items-start gap-2">
                      <span className="mt-0.5">⚠️</span>
                      <p>{passwordError}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-cinema-muted text-sm mb-1.5">Mật khẩu hiện tại</label>
                    <input type="password" placeholder="••••••••" className="input-field" 
                           value={passwordForm.oldPassword} 
                           onChange={e => { setPasswordForm({...passwordForm, oldPassword: e.target.value}); setPasswordError(''); }} 
                           required />
                  </div>
                  <div>
                    <label className="block text-cinema-muted text-sm mb-1.5">Mật khẩu mới</label>
                    <input type="password" placeholder="••••••••" className="input-field" 
                           value={passwordForm.newPassword} 
                           onChange={e => { setPasswordForm({...passwordForm, newPassword: e.target.value}); setPasswordError(''); }} 
                           required minLength={6} />
                  </div>
                  <div>
                    <label className="block text-cinema-muted text-sm mb-1.5">Xác nhận mật khẩu mới</label>
                    <input type="password" placeholder="••••••••" className="input-field" 
                           value={passwordForm.confirmPassword} 
                           onChange={e => { setPasswordForm({...passwordForm, confirmPassword: e.target.value}); setPasswordError(''); }} 
                           required minLength={6} />
                  </div>
                  <button type="submit" disabled={passwordLoading} className="btn-primary w-full py-3 mt-4 text-sm disabled:opacity-50 flex justify-center items-center">
                    {passwordLoading ? (
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                    ) : 'Xác nhận đổi'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
