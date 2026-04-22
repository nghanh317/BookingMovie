import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

/**
 * Bảo vệ route chỉ cho phép người dùng đã đăng nhập.
 * Nếu chưa đăng nhập → chuyển về /login
 * Nếu là ADMIN → chuyển về /admin (admin không dùng route người dùng)
 */
export function RequireAuth({ children }) {
  const { isLoggedIn, user } = useAuthStore();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'admin';
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}

/**
 * Chặn ADMIN vào các route công khai của người dùng (/, /movies, /offers...).
 * Admin phải ở trong /admin/* thôi.
 * Nếu là ADMIN → redirect về /admin
 */
export function BlockAdmin({ children }) {
  const { isLoggedIn, user } = useAuthStore();
  if (isLoggedIn) {
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'admin';
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    }
  }
  return children;
}

/**
 * Bảo vệ route chỉ cho phép tài khoản admin.
 * Nếu chưa đăng nhập → chuyển về /login
 * Nếu đăng nhập nhưng không phải admin → chuyển về /
 */
export function RequireAdmin({ children }) {
  const { isLoggedIn, user } = useAuthStore();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role !== 'ADMIN' && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
}
