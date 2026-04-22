import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { RequireAuth, RequireAdmin, BlockAdmin } from './components/auth/ProtectedRoute';

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
import Profile from './pages/Profile/Profile';
import Offers from './pages/Offers/Offers';
import PaymentCallback from './pages/PaymentCallback/PaymentCallback';

// Admin pages
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminMovies from './pages/Admin/AdminMovies';
import AdminShowtimes from './pages/Admin/AdminShowtimes';
import AdminCinemas from './pages/Admin/AdminCinemas';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminRevenue from './pages/Admin/AdminRevenue';
import AdminVouchers from './pages/Admin/AdminVouchers';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Routes dành cho USER (admin bị chặn → redirect /admin) ─── */}
        <Route path="/" element={<BlockAdmin><Layout><Home /></Layout></BlockAdmin>} />
        <Route path="/movies" element={<BlockAdmin><Layout><Movies /></Layout></BlockAdmin>} />
        <Route path="/movies/:id" element={<BlockAdmin><Layout><MovieDetail /></Layout></BlockAdmin>} />
        <Route path="/offers" element={<BlockAdmin><Layout><Offers /></Layout></BlockAdmin>} />
        <Route path="/login" element={<BlockAdmin><Layout><Login /></Layout></BlockAdmin>} />
        <Route path="/register" element={<BlockAdmin><Layout><Register /></Layout></BlockAdmin>} />
        <Route path="/forgot-password" element={<BlockAdmin><Layout><ForgotPassword /></Layout></BlockAdmin>} />

        {/* ── Protected: chỉ user đã đăng nhập (admin cũng bị chặn) ─── */}
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
        <Route path="/payment/callback" element={
          <BlockAdmin><Layout><PaymentCallback /></Layout></BlockAdmin>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
