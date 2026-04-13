import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Mock accounts để kiểm tra (thay bằng API call thật khi có backend)
const MOCK_ACCOUNTS = [
  { email: 'admin@cinema.com', phone: '0912345678', name: 'Nguyễn Văn An' },
  { email: 'user@cinema.com', phone: '0987654321', name: 'Trần Thị Bình' },
];

// Tạo OTP 6 số ngẫu nhiên
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// --- BƯỚC 1: Nhập email hoặc số điện thoại ---
function StepRequest({ onNext }) {
  const [method, setMethod] = useState('email'); // 'email' | 'phone'
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!value.trim()) {
      setError(method === 'email' ? 'Vui lòng nhập email' : 'Vui lòng nhập số điện thoại');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 1000)); // giả lập API

    const found = MOCK_ACCOUNTS.find(a =>
      method === 'email' ? a.email === value.trim() : a.phone === value.trim()
    );

    setLoading(false);
    if (!found) {
      setError(method === 'email'
        ? 'Email không tồn tại trong hệ thống'
        : 'Số điện thoại không tồn tại trong hệ thống'
      );
      return;
    }

    const otp = generateOTP();
    onNext({ account: found, method, value, otp });
  };

  return (
    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h2 className="font-heading font-bold text-white text-xl mb-1">Quên mật khẩu?</h2>
      <p className="text-cinema-muted text-sm mb-6">
        Chọn cách nhận mã xác nhận để đặt lại mật khẩu
      </p>

      {/* Chọn phương thức */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { id: 'email', icon: '✉️', label: 'Qua Email' },
          { id: 'phone', icon: '📱', label: 'Qua SĐT' },
        ].map(m => (
          <button key={m.id} onClick={() => { setMethod(m.id); setValue(''); setError(''); }}
            className={`p-3 rounded-xl border text-sm font-medium transition-all ${
              method === m.id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-cinema-border text-cinema-muted hover:border-cinema-muted'
            }`}>
            <span className="text-xl block mb-1">{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-cinema-muted text-sm mb-1.5">
            {method === 'email' ? 'Địa chỉ Email' : 'Số điện thoại'}
          </label>
          <input
            type={method === 'email' ? 'email' : 'tel'}
            value={value}
            onChange={e => { setValue(e.target.value); setError(''); }}
            placeholder={method === 'email' ? 'email@example.com' : '0912345678'}
            className={`input-field ${error ? 'border-red-500' : ''}`}
          />
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          <p className="text-cinema-muted text-xs mt-2">
            {method === 'email'
              ? '📧 Mã OTP sẽ được gửi tới email của bạn'
              : '📲 Mã OTP sẽ được gửi qua SMS'
            }
          </p>
        </div>

        <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
          className="w-full btn-primary py-3 text-sm">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Đang gửi mã...
            </span>
          ) : 'Gửi mã xác nhận'}
        </motion.button>
      </form>
    </motion.div>
  );
}

// --- BƯỚC 2: Nhập OTP ---
function StepOTP({ data, onNext, onBack }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Countdown timer
  useState(() => {
    const timer = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
    setError('');
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const entered = otp.join('');
    if (entered.length < 6) { setError('Vui lòng nhập đủ 6 số'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    if (entered !== data.otp) {
      setError('Mã OTP không đúng. Vui lòng kiểm tra lại');
      return;
    }
    onNext();
  };

  const handleResend = async () => {
    setResending(true);
    await new Promise(r => setTimeout(r, 800));
    setResending(false);
    setCountdown(60);
    setOtp(['', '', '', '', '', '']);
    setError('');
  };

  const maskedValue = data.method === 'email'
    ? data.value.replace(/(.{2}).+(@.+)/, '$1***$2')
    : data.value.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');

  return (
    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <button onClick={onBack} className="flex items-center gap-1 text-cinema-muted hover:text-white text-sm mb-5 transition-colors">
        ← Quay lại
      </button>

      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-3xl mx-auto mb-3">
          {data.method === 'email' ? '✉️' : '📱'}
        </div>
        <h2 className="font-heading font-bold text-white text-xl">Nhập mã xác nhận</h2>
        <p className="text-cinema-muted text-sm mt-1">
          Mã OTP đã được gửi tới <span className="text-white font-medium">{maskedValue}</span>
        </p>
        <p className="text-primary text-xs mt-1 font-medium">
          (Vui lòng kiểm tra email / điện thoại của bạn)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* OTP boxes */}
        <div className="flex justify-center gap-2">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              id={`otp-${idx}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleOtpChange(e.target.value, idx)}
              onKeyDown={e => handleKeyDown(e, idx)}
              className={`w-11 h-12 text-center text-white font-heading font-bold text-xl rounded-xl border bg-cinema-surface focus:outline-none transition-all ${
                error ? 'border-red-500' : digit ? 'border-primary bg-primary/10' : 'border-cinema-border focus:border-primary'
              }`}
            />
          ))}
        </div>
        {error && <p className="text-red-400 text-xs text-center">{error}</p>}

        <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
          className="w-full btn-primary py-3 text-sm">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Đang xác nhận...
            </span>
          ) : 'Xác nhận mã OTP'}
        </motion.button>

        {/* Resend */}
        <p className="text-center text-cinema-muted text-xs">
          Không nhận được mã?{' '}
          {countdown > 0 ? (
            <span className="text-white">Gửi lại sau <span className="text-primary font-bold">{countdown}s</span></span>
          ) : (
            <button type="button" onClick={handleResend} disabled={resending}
              className="text-primary hover:text-primary/80 font-medium transition-colors">
              {resending ? 'Đang gửi...' : 'Gửi lại'}
            </button>
          )}
        </p>
      </form>
    </motion.div>
  );
}

// --- BƯỚC 3: Đặt mật khẩu mới ---
function StepNewPassword({ onSuccess }) {
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { setError('Mật khẩu tối thiểu 8 ký tự'); return; }
    if (form.password !== form.confirm) { setError('Mật khẩu xác nhận không khớp'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    onSuccess();
  };

  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const labels = ['Yếu', 'Trung bình', 'Khá', 'Mạnh'];

  return (
    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h2 className="font-heading font-bold text-white text-xl mb-1">Đặt mật khẩu mới</h2>
      <p className="text-cinema-muted text-sm mb-6">Tạo mật khẩu mạnh để bảo vệ tài khoản</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-cinema-muted text-sm">Mật khẩu mới</label>
            <button type="button" onClick={() => setShowPw(!showPw)} className="text-cinema-muted hover:text-white text-xs transition-colors">
              {showPw ? 'Ẩn' : 'Hiện'}
            </button>
          </div>
          <input
            type={showPw ? 'text' : 'password'}
            value={form.password}
            onChange={e => { setForm(prev => ({ ...prev, password: e.target.value })); setError(''); }}
            placeholder="Ít nhất 8 ký tự"
            className="input-field"
          />
          {form.password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? colors[strength - 1] : 'bg-cinema-border'}`} />
                ))}
              </div>
              <p className="text-xs mt-1 text-cinema-muted">Độ mạnh: <span className="text-white font-medium">{labels[strength - 1] || 'Yếu'}</span></p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-cinema-muted text-sm mb-1.5">Xác nhận mật khẩu</label>
          <input
            type={showPw ? 'text' : 'password'}
            value={form.confirm}
            onChange={e => { setForm(prev => ({ ...prev, confirm: e.target.value })); setError(''); }}
            placeholder="Nhập lại mật khẩu"
            className="input-field"
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
              Đang lưu...
            </span>
          ) : '🔒 Đặt lại mật khẩu'}
        </motion.button>
      </form>
    </motion.div>
  );
}

// --- BƯỚC 4: Thành công ---
function StepSuccess({ navigate }) {
  return (
    <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="text-center py-4">
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-5">
        <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </motion.div>
      <h2 className="font-heading font-bold text-white text-2xl mb-2">Đổi mật khẩu thành công!</h2>
      <p className="text-cinema-muted text-sm mb-6">Bạn có thể đăng nhập lại với mật khẩu mới</p>
      <button onClick={() => navigate('/login')} className="btn-primary px-8 py-3 text-sm">
        Đăng nhập ngay
      </button>
    </motion.div>
  );
}

// ====== COMPONENT CHÍNH ======
export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 | 2 | 3 | 4
  const [data, setData] = useState(null);

  const STEP_LABELS = ['Xác minh danh tính', 'Nhập mã OTP', 'Mật khẩu mới', 'Hoàn tất'];

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

          {/* Step progress */}
          {step < 4 && (
            <div className="flex items-center justify-center gap-2">
              {STEP_LABELS.slice(0, 3).map((label, i) => (
                <div key={label} className="flex items-center gap-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                    i + 1 < step ? 'bg-primary border-primary text-cinema-black' :
                    i + 1 === step ? 'border-primary text-primary' :
                    'border-cinema-border text-cinema-muted'
                  }`}>
                    {i + 1 < step ? '✓' : i + 1}
                  </div>
                  {i < 2 && <div className={`w-6 h-0.5 ${i + 1 < step ? 'bg-primary' : 'bg-cinema-border'}`} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card */}
        <div className="card p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <StepRequest onNext={(d) => { setData(d); setStep(2); }} />
            )}
            {step === 2 && data && (
              <StepOTP data={data} onNext={() => setStep(3)} onBack={() => setStep(1)} />
            )}
            {step === 3 && (
              <StepNewPassword onSuccess={() => setStep(4)} />
            )}
            {step === 4 && (
              <StepSuccess navigate={navigate} />
            )}
          </AnimatePresence>
        </div>

        {step < 4 && (
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
