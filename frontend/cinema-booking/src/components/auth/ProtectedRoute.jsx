import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

/**
 * Bảo vệ route chỉ cho phép người dùng đã đăng nhập.
 * Nếu chưa đăng nhập → chuyển về /login
 */
export function RequireAuth({ children }) {
  const { isLoggedIn } = useAuthStore();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

/**
 * Bảo vệ route chỉ cho phép tài khoản admin.
 * Nếu chưa đăng nhập → chuyển về /login
 * Nếu đăng nhập nhưng không phải admin → chuyển về / (trang chủ)
 */
export function RequireAdmin({ children }) {
  const { isLoggedIn, user } = useAuthStore();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if ((user?.role || '').toUpperCase() !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  return children;
}
