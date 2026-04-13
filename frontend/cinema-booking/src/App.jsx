import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
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
import Profile from './pages/Profile/Profile';
import Offers from './pages/Offers/Offers';

// Admin pages
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminMovies from './pages/Admin/AdminMovies';
import AdminShowtimes from './pages/Admin/AdminShowtimes';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminRevenue from './pages/Admin/AdminRevenue';
import AdminVouchers from './pages/Admin/AdminVouchers';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ───────────────────────────── */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/movies" element={<Layout><Movies /></Layout>} />
        <Route path="/movies/:id" element={<Layout><MovieDetail /></Layout>} />
        <Route path="/offers" element={<Layout><Offers /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />
        <Route path="/forgot-password" element={<Layout><ForgotPassword /></Layout>} />

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
