import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [bookingInfo, setBookingInfo] = useState(null);

  useEffect(() => {
    // Check parameters from VNPay / MoMo
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    const momo_Status = searchParams.get('status');

    let isSuccess = false;
    
    // VNPay success code is '00', MoMo is often '0' or 'SUCCESS'
    if (vnp_ResponseCode === '00' || momo_Status === 'SUCCESS' || momo_Status === '0') {
       isSuccess = true;
    }

    // Retrieve pending booking info
    const pendingJson = sessionStorage.getItem('pendingBooking');
    if (pendingJson) {
      setBookingInfo(JSON.parse(pendingJson));
    }

    if (isSuccess) {
      setStatus('success');
      // Xoá thông tin sau khi load thành công
      sessionStorage.removeItem('pendingBooking');
    } else {
      setStatus('failed');
    }

  }, [searchParams]);

  return (
    <div className="min-h-screen py-20 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-cinema-card border border-cinema-border rounded-2xl p-8 max-w-md w-full text-center shadow-card-hover mx-4"
      >
        {status === 'processing' && (
           <h2 className="text-xl text-white">Đang xử lý kết quả thanh toán...</h2>
        )}

        {status === 'success' && bookingInfo && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-6"
            >
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>

            <h2 className="font-heading font-extrabold text-2xl text-white mb-2">Đặt Vé Thành Công! 🎉</h2>
            <p className="text-cinema-muted text-sm mb-6">
              Vé của bạn đã được xác nhận và thanh toán thành công.
            </p>

            <div className="bg-cinema-surface rounded-xl p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-cinema-muted">Mã đặt vé</span>
                <span className="text-primary font-bold font-mono">{bookingInfo.code}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-cinema-muted">Phim</span>
                <span className="text-white font-medium text-right max-w-[180px]">{bookingInfo.movie}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-cinema-muted">Ghế</span>
                <span className="text-white font-medium">{bookingInfo.seats}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-cinema-muted">Tổng tiền</span>
                <span className="text-primary font-bold">{bookingInfo.total}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Link to="/" className="flex-1 btn-outline text-sm py-2.5">
                Về Trang Chủ
              </Link>
              <Link to="/profile" className="flex-1 btn-primary text-sm py-2.5">
                Vé Của Tôi
              </Link>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mx-auto mb-6"
            >
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.div>
            <h2 className="font-heading font-extrabold text-2xl text-white mb-2">Thanh Toán Thất Bại</h2>
            <p className="text-cinema-muted text-sm mb-6">
              Có lỗi xảy ra trong quá trình thanh toán hoặc bạn đã huỷ giao dịch.
            </p>
            <button onClick={() => navigate(-1)} className="w-full btn-primary py-2.5">
              Thử Lại
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
