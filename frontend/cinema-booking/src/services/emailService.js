import emailjs from '@emailjs/browser';

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TMPL_REG    = import.meta.env.VITE_EMAILJS_TEMPLATE_REGISTER;
const TMPL_BOOK   = import.meta.env.VITE_EMAILJS_TEMPLATE_BOOKING;
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

/**
 * Gửi email chào mừng sau khi đăng ký thành công.
 * @param {string} name  - Họ tên người dùng
 * @param {string} email - Email người dùng
 */
export async function sendWelcomeEmail(name, email) {
  return emailjs.send(
    SERVICE_ID,
    TMPL_REG,
    {
      to_name:  name,
      to_email: email,
    },
    PUBLIC_KEY
  );
}

/**
 * Gửi email xác nhận đặt vé thành công.
 * @param {Object} data
 * @param {string} data.to_name       - Họ tên khách hàng
 * @param {string} data.to_email      - Email khách hàng
 * @param {string} data.booking_code  - Mã đặt vé (dùng lấy vé tại quầy)
 * @param {string} data.movie_title   - Tên phim
 * @param {string} data.cinema_name   - Tên rạp
 * @param {string} data.showtime      - Ngày + giờ chiếu
 * @param {string} data.seats         - Danh sách ghế
 * @param {string} data.total         - Tổng tiền
 */
export async function sendBookingConfirmEmail(data) {
  return emailjs.send(SERVICE_ID, TMPL_BOOK, data, PUBLIC_KEY);
}
