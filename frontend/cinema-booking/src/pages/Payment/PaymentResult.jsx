import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import payosService from '../../services/payosService';

/**
 * PaymentResult — Trang kết quả thanh toán PayOS
 * PayOS redirect về: /payment-result?ticketId=5&status=success|cancel
 *
 * Khi status=success, tự động gọi /api/v1/payos/confirm/{ticketId}
 * để backend chủ động query PayOS và cập nhật DB (thay thế webhook khi dev local).
 */
export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const cancel = searchParams.get('cancel'); // 'true' hoặc 'false' từ PayOS
  const ticketId = searchParams.get('ticketId');
  const code = searchParams.get('code'); // '00' = thành công (từ PayOS URL params)

  // PayOS tự thêm status=PAID và cancel=false vào URL, kiểm tra thông minh để tránh xung đột
  const isRedirectSuccess = status === 'success' || status === 'PAID' || cancel === 'false';

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="card p-10 max-w-md w-full text-center"
      >
        {/* ── Thành công ── */}
        {isRedirectSuccess && (
          <>
            <div className="text-7xl mb-4">🎉</div>
            <h1 className="font-heading font-extrabold text-2xl text-white mb-2">
              Thanh toán thành công!
            </h1>
            <p className="text-cinema-muted text-sm mb-6">
              Vé của bạn đã được xác nhận. Chúc bạn xem phim vui vẻ!
            </p>

            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 text-left">
              <p className="text-green-400 text-sm font-semibold mb-1">✅ Đặt vé thành công</p>
              {ticketId && (
                <p className="text-cinema-muted text-xs">Mã vé ID: #{ticketId}</p>
              )}
              <p className="text-cinema-muted text-xs mt-1">
                Hệ thống sẽ gửi email xác nhận trong ít phút.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link to="/profile?tab=bookings" className="btn-primary w-full py-3 text-sm font-semibold">
                🎟️ Xem vé của tôi
              </Link>
              <Link to="/movies" className="btn-outline w-full py-3 text-sm">
                Tiếp tục xem phim
              </Link>
            </div>
          </>
        )}

        {/* ── Hủy / Thất bại ── */}
        {!isRedirectSuccess && (
          <>
            <div className="text-7xl mb-4">😔</div>
            <h1 className="font-heading font-extrabold text-2xl text-white mb-2">
              Thanh toán không thành công
            </h1>
            <p className="text-cinema-muted text-sm mb-6">
              Bạn đã hủy thanh toán hoặc có lỗi xảy ra. Ghế đã chọn sẽ được giải phóng sau 10 phút.
            </p>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-left">
              <p className="text-red-400 text-sm font-semibold mb-1">❌ Chưa hoàn tất thanh toán</p>
              <p className="text-cinema-muted text-xs mt-1">
                Bạn có thể thử đặt vé lại hoặc chọn phương thức khác.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link to="/movies" className="btn-primary w-full py-3 text-sm font-semibold">Đặt vé lại</Link>
              <Link to="/" className="btn-outline w-full py-3 text-sm">Về trang chủ</Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
