import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 💡 IMPORT cái Zustand Store cậu vừa sửa ở bước trước vào đây
// Cậu nhớ kiểm tra lại đường dẫn từ file App.jsx đến file authStore.js xem đã đúng chưa nhé (ví dụ: './store/authStore' hoặc './authStore')
import useAuthStore from './store/authStore';

import Layout from './components/layout/Layout';
import ScrollToTop from './components/layout/ScrollToTop';
import { RequireAuth, RequireAdmin } from './components/auth/ProtectedRoute';

import Home from './pages/Home/Home';
import Movies from './pages/Movies/Movies';
import MovieDetail from './pages/MovieDetail/MovieDetail';
import Booking from './pages/Booking/Booking';
import SeatSelection from './pages/SeatSelection/SeatSelection';
import SnackSelection from './pages/SnackSelection/SnackSelection';
import Checkout from './pages/Checkout/Checkout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Profile from './pages/Profile/Profile';
import Offers from './pages/Offers/Offers';
import CinemaDetail from './pages/Cinema/CinemaDetail';
import Cinemas from './pages/Cinema/Cinemas';
import TopMovies from './pages/TopMovies/TopMovies';
import News from './pages/News/News';
import NewsDetail from './pages/News/NewsDetail';
import PaymentResult from './pages/Payment/PaymentResult';

// Support pages
import FAQ from './pages/Support/FAQ';
import RefundPolicy from './pages/Support/RefundPolicy';
import Terms from './pages/Support/Terms';
import Privacy from './pages/Support/Privacy';

// Admin pages
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminMovies from './pages/Admin/AdminMovies';
import AdminShowtimes from './pages/Admin/AdminShowtimes';
import AdminCinemas from './pages/Admin/AdminCinemas';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminRevenue from './pages/Admin/AdminRevenue';
import AdminVouchers from './pages/Admin/AdminVouchers';
import AdminTickets from './pages/Admin/AdminTickets';
import AdminReviews from './pages/Admin/AdminReviews';
import AdminNews from './pages/Admin/AdminNews';
import AdminProducts from './pages/Admin/AdminProducts';

function App() {
  // 💡 Đọc accessToken và hàm setupActiveRefresh từ Zustand Store ra
  const accessToken = useAuthStore((state) => state.accessToken);
  const setupActiveRefresh = useAuthStore((state) => state.setupActiveRefresh);

  // 💡 Tự động kích hoạt lại lịch hẹn giờ đổi token mỗi khi user F5 tải lại trang
  useEffect(() => {
    if (accessToken) {
      setupActiveRefresh(accessToken);
    }
  }, [accessToken, setupActiveRefresh]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* ── Public routes ───────────────────────────── */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/movies" element={<Layout><Movies /></Layout>} />
        <Route path="/movies/:id" element={<Layout><MovieDetail /></Layout>} />
        <Route path="/offers" element={<Layout><Offers /></Layout>} />
        <Route path="/cinemas" element={<Layout><Cinemas /></Layout>} />
        <Route path="/cinemas/:id" element={<Layout><CinemaDetail /></Layout>} />
        <Route path="/top-movies" element={<Layout><TopMovies /></Layout>} />
        <Route path="/news" element={<Layout><News /></Layout>} />
        <Route path="/news/:id" element={<Layout><NewsDetail /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />
        <Route path="/forgot-password" element={<Layout><ForgotPassword /></Layout>} />
        <Route path="/reset-password" element={<Layout><ResetPassword /></Layout>} />
        <Route path="/faq" element={<Layout><FAQ /></Layout>} />
        <Route path="/refund-policy" element={<Layout><RefundPolicy /></Layout>} />
        <Route path="/terms" element={<Layout><Terms /></Layout>} />
        <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
        <Route path="/payment-result" element={<Layout><PaymentResult /></Layout>} />

        {/* ── Protected: đăng nhập mới vào được ────────── */}
        <Route path="/booking/:movieId" element={
          <RequireAuth><Layout><Booking /></Layout></RequireAuth>
        } />
        <Route path="/booking/:movieId/seats" element={
          <RequireAuth><Layout><SeatSelection /></Layout></RequireAuth>
        } />
        <Route path="/booking/:movieId/snacks" element={
          <RequireAuth><Layout><SnackSelection /></Layout></RequireAuth>
        } />
        <Route path="/booking/:movieId/checkout" element={
          <RequireAuth><Layout><Checkout /></Layout></RequireAuth>
        } />
        <Route path="/profile" element={
          <RequireAuth><Layout><Profile /></Layout></RequireAuth>
        } />

        {/* ── Protected: chỉ admin mới vào được ─────────── */}
        <Route path="/admin" element={
          <RequireAdmin><AdminLayout><AdminDashboard /></AdminLayout></RequireAdmin>
        } />
        <Route path="/admin/movies" element={
          <RequireAdmin><AdminLayout><AdminMovies /></AdminLayout></RequireAdmin>
        } />
        <Route path="/admin/showtimes" element={
          <RequireAdmin><AdminLayout><AdminShowtimes /></AdminLayout></RequireAdmin>
        } />
        <Route path="/admin/cinemas" element={
          <RequireAdmin><AdminLayout><AdminCinemas /></AdminLayout></RequireAdmin>
        } />
        <Route path="/admin/users" element={
          <RequireAdmin><AdminLayout><AdminUsers /></AdminLayout></RequireAdmin>
        } />
        <Route path="/admin/revenue" element={
          <RequireAdmin><AdminLayout><AdminRevenue /></AdminLayout></RequireAdmin>
        } />
        <Route path="/admin/vouchers" element={
          <RequireAdmin><AdminLayout><AdminVouchers /></AdminLayout></RequireAdmin>
        } />
        <Route path="/admin/tickets" element={
          <RequireAdmin><AdminLayout><AdminTickets /></AdminLayout></RequireAdmin>
        } />
        <Route path="/admin/reviews" element={
          <RequireAdmin><AdminLayout><AdminReviews /></AdminLayout></RequireAdmin>
        } />
        <Route path="/admin/news" element={
          <RequireAdmin><AdminLayout><AdminNews /></AdminLayout></RequireAdmin>
        } />
        <Route path="/admin/products" element={
          <RequireAdmin><AdminLayout><AdminProducts /></AdminLayout></RequireAdmin>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;