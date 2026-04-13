import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';

// ✅ Khai báo NGOÀI component để tránh bị tạo lại mỗi lần render (gây mất focus)
function Field({ name, label, type = 'text', placeholder, autoComplete, form, setForm, errors, setErrors, showPassword }) {
  return (
    <div>
      <label className="block text-cinema-muted text-sm mb-1.5">{label}</label>
      <input
        type={name === 'password' || name === 'confirm' ? (showPassword ? 'text' : 'password') : type}
        value={form[name]}
        onChange={e => {
          setForm(prev => ({ ...prev, [name]: e.target.value }));
          setErrors(prev => ({ ...prev, [name]: '' }));
        }}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`input-field ${errors[name] ? 'border-red-500' : ''}`}
      />
      {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [form, setForm] = useState({ userName: '', fullName: '', email: '', phone: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.userName.trim()) errs.userName = 'Vui lòng nhập tên đăng nhập';
    if (!form.fullName.trim()) errs.fullName = 'Vui lòng nhập họ tên';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email không hợp lệ';
    if (!form.phone || !/^(0|\+84)[0-9]{9}$/.test(form.phone)) errs.phone = 'Số điện thoại không hợp lệ';
    if (!form.password || form.password.length < 8) errs.password = 'Mật khẩu tối thiểu 8 ký tự';
    if (form.password !== form.confirm) errs.confirm = 'Mật khẩu không khớp';
    if (!agreed) errs.agreed = 'Bạn cần đồng ý với điều khoản';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    
    setLoading(true);
    const result = await register({
      userName: form.userName,
      password: form.password,
      email: form.email,
      phone: form.phone,
      fullName: form.fullName,
    });
    setLoading(false);

    if (!result.success) {
      setApiError(result.message);
      return;
    }

    // Đăng ký thành công → chuyển sang trang login
    navigate('/login');
  };

  const passwordStrength = (() => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  })();

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = ['Yếu', 'Trung bình', 'Khá', 'Mạnh'];

  const fieldProps = { form, setForm, errors, setErrors, showPassword };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-gold rounded-xl flex items-center justify-center shadow-glow-gold">
              <span className="text-cinema-black font-heading font-bold">C</span>
            </div>
            <span className="font-heading font-bold text-2xl text-white">
              Cinema<span className="text-primary">Book</span>
            </span>
          </Link>
          <h1 className="font-heading font-bold text-3xl text-white">Tạo tài khoản mới</h1>
          <p className="text-cinema-muted mt-2">Đăng ký để nhận ưu đãi đặt vé</p>
        </div>

        <div className="card p-8">
          {apiError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field {...fieldProps} name="userName" label="Tên đăng nhập *" placeholder="username" autoComplete="username" />
            <Field {...fieldProps} name="fullName" label="Họ và tên *" placeholder="Nguyễn Văn A" autoComplete="name" />
            <Field {...fieldProps} name="email" label="Email *" type="email" placeholder="email@example.com" autoComplete="email" />
            <Field {...fieldProps} name="phone" label="Số điện thoại *" type="tel" placeholder="0912345678" autoComplete="tel" />

            {/* Password field với strength indicator */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-cinema-muted text-sm">Mật khẩu *</label>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-cinema-muted hover:text-white text-xs transition-colors">
                  {showPassword ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => {
                  setForm(prev => ({ ...prev, password: e.target.value }));
                  setErrors(prev => ({ ...prev, password: '' }));
                }}
                placeholder="Ít nhất 8 ký tự"
                autoComplete="new-password"
                className={`input-field ${errors.password ? 'border-red-500' : ''}`}
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-cinema-border'}`} />
                    ))}
                  </div>
                  <p className="text-xs mt-1 text-cinema-muted">Độ mạnh: <span className="font-medium text-white">{strengthLabels[passwordStrength - 1] || 'Yếu'}</span></p>
                </div>
              )}
            </div>

            <Field {...fieldProps} name="confirm" label="Xác nhận mật khẩu *" placeholder="Nhập lại mật khẩu" autoComplete="new-password" />

            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => { setAgreed(e.target.checked); setErrors(prev => ({ ...prev, agreed: '' })); }}
                  className="mt-0.5 rounded border-cinema-border bg-cinema-surface"
                />
                <span className="text-cinema-muted text-sm">
                  Tôi đồng ý với{' '}
                  <button type="button" className="text-primary hover:underline">Điều khoản sử dụng</button>
                  {' '}và{' '}
                  <button type="button" className="text-primary hover:underline">Chính sách bảo mật</button>
                </span>
              </label>
              {errors.agreed && <p className="text-red-400 text-xs mt-1">{errors.agreed}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-primary py-3.5 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Đang đăng ký...
                </span>
              ) : '🎬 Tạo Tài Khoản'}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-cinema-muted text-sm mt-6">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Đăng nhập ngay
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
