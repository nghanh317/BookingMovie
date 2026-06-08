import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { AnimatePresence, motion } from 'framer-motion';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null); // { message, type }

  const showToast = (message, type = 'success') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    if (!token) {
      showToast('Đường dẫn không hợp lệ hoặc không có token!', 'error');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Mật khẩu nhập lại không khớp!', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post('/v1/auth/reset-password', {
        token,
        newPassword
      });
      showToast(response.data.message || 'Đặt lại mật khẩu thành công!', 'success');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra khi đặt lại mật khẩu.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative">
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${
              toastMsg.type === 'error'
                ? 'bg-red-500/20 border border-red-500/30 text-red-300'
                : 'bg-green-500/20 border border-green-500/30 text-green-300'
            }`}
          >
            {toastMsg.message}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="max-w-md w-full space-y-8 bg-cinema-card border border-cinema-border p-8 rounded-lg shadow-card-hover">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Đặt lại mật khẩu mới
          </h2>
          <p className="mt-2 text-center text-sm text-cinema-muted">
            Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-cinema-muted mb-1">
                Mật khẩu mới
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
                placeholder="Nhập mật khẩu mới"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cinema-muted mb-1">
                Nhập lại mật khẩu mới
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl font-heading font-bold text-base transition-all duration-200 ${
                isLoading ? 'bg-cinema-surface text-cinema-muted cursor-not-allowed' : 'btn-primary'
              }`}
            >
              {isLoading ? 'Đang xử lý...' : 'Xác nhận đặt lại mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
