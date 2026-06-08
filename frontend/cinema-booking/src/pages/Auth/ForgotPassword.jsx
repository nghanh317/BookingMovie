import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

// --- BƯỚC 1: Nhập email ---
function StepRequest({ onNext }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }

    setLoading(true);
    try {
      await api.post('/v1/auth/forgot-password', { email });
      setLoading(false);
      onNext(email);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  return (
    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h2 className="font-heading font-bold text-white text-xl mb-1">Quên mật khẩu?</h2>
      <p className="text-cinema-muted text-sm mb-6">
        Nhập địa chỉ email của bạn để nhận liên kết đặt lại mật khẩu
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-cinema-muted text-sm mb-1.5">
            Địa chỉ Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            placeholder="email@example.com"
            className={`input-field ${error ? 'border-red-500' : ''}`}
          />
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>

        <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
          className="w-full btn-primary py-3 text-sm">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Đang gửi yêu cầu...
            </span>
          ) : 'Gửi yêu cầu'}
        </motion.button>
      </form>
    </motion.div>
  );
}

// --- BƯỚC 2: Thành công (Yêu cầu check mail) ---
function StepSuccess({ email }) {
  return (
    <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="text-center py-4">
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-5">
        <span className="text-4xl">✉️</span>
      </motion.div>
      <h2 className="font-heading font-bold text-white text-2xl mb-2">Kiểm tra hộp thư!</h2>
      <p className="text-cinema-muted text-sm mb-6">
        Chúng tôi đã gửi một liên kết khôi phục tới <br/>
        <span className="text-white font-medium">{email}</span>
      </p>
      <Link to="/login" className="inline-block btn-primary px-8 py-3 text-sm">
        Quay lại đăng nhập
      </Link>
    </motion.div>
  );
}

// ====== COMPONENT CHÍNH ======
export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Nhập email | 2: Success
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-5">
            <div className="w-10 h-10 bg-gradient-gold rounded-xl flex items-center justify-center shadow-glow-gold">
              <span className="text-cinema-black font-heading font-bold">C</span>
            </div>
            <span className="font-heading font-bold text-2xl text-white">
              Cinema<span className="text-primary">Book</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="card p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <StepRequest onNext={(mail) => { setEmail(mail); setStep(2); }} />
            )}
            {step === 2 && (
              <StepSuccess email={email} />
            )}
          </AnimatePresence>
        </div>

        {step === 1 && (
          <p className="text-center text-cinema-muted text-sm mt-5">
            Nhớ mật khẩu rồi?{' '}
            <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Đăng nhập
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}
