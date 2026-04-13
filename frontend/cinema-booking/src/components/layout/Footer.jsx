import { Link } from 'react-router-dom';

const FooterLink = ({ to, children }) => (
  <Link to={to} className="text-cinema-muted hover:text-primary transition-colors duration-200 text-sm">
    {children}
  </Link>
);

export default function Footer() {
  return (
    <footer className="bg-cinema-dark border-t border-cinema-border mt-20">
      <div className="container mx-auto px-4 max-w-7xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
                <span className="text-cinema-black font-heading font-bold text-sm">C</span>
              </div>
              <span className="font-heading font-bold text-xl text-white">
                Cinema<span className="text-primary">Book</span>
              </span>
            </Link>
            <p className="text-cinema-muted text-sm leading-relaxed">
              Nền tảng đặt vé xem phim trực tuyến hàng đầu Việt Nam. Trải nghiệm điện ảnh đỉnh cao, đặt vé dễ dàng.
            </p>
            <div className="flex gap-3 mt-4">
              {['facebook', 'instagram', 'youtube'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-9 h-9 rounded-full bg-cinema-surface border border-cinema-border flex items-center justify-center text-cinema-muted hover:text-primary hover:border-primary transition-all duration-200"
                  aria-label={social}
                >
                  {social === 'facebook' && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                    </svg>
                  )}
                  {social === 'instagram' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth={2}/>
                      <circle cx="12" cy="12" r="4" strokeWidth={2}/>
                      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                    </svg>
                  )}
                  {social === 'youtube' && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.4a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L16.05 12l-6.3 3.02z"/>
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Khám Phá</h4>
            <div className="flex flex-col gap-2.5">
              <FooterLink to="/movies?status=now_showing">Phim Đang Chiếu</FooterLink>
              <FooterLink to="/movies?status=coming_soon">Phim Sắp Chiếu</FooterLink>
              <FooterLink to="/movies">Tất Cả Phim</FooterLink>
              <FooterLink to="/">Rạp Chiếu Phim</FooterLink>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Hỗ Trợ</h4>
            <div className="flex flex-col gap-2.5">
              <FooterLink to="/">Câu Hỏi Thường Gặp</FooterLink>
              <FooterLink to="/">Chính Sách Đổi/Trả Vé</FooterLink>
              <FooterLink to="/">Điều Khoản Sử Dụng</FooterLink>
              <FooterLink to="/">Chính Sách Bảo Mật</FooterLink>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Liên Hệ</h4>
            <div className="flex flex-col gap-2.5 text-sm text-cinema-muted">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>1900 1234</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>support@cinemabook.vn</span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>72 Lê Thánh Tôn, Q.1,<br/>TP. Hồ Chí Minh</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-cinema-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-cinema-muted">
          <p>© 2026 CinemaBook. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-1">
            <span>Thanh toán bảo mật bởi</span>
            <span className="text-primary font-semibold ml-1">🔒 SSL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
