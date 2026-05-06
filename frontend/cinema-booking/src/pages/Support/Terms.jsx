export default function Terms() {
  return (
    <div className="min-h-screen bg-cinema-dark py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-heading font-extrabold text-white mb-8">Điều Khoản Sử Dụng</h1>
        
        <div className="bg-cinema-surface border border-cinema-border rounded-xl p-8 space-y-6 text-cinema-muted leading-relaxed">
          <p>
            Chào mừng bạn đến với CinemaBook. Bằng việc sử dụng trang web và ứng dụng của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện dưới đây. Vui lòng đọc kỹ trước khi sử dụng dịch vụ.
          </p>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-3">1. Chấp nhận điều khoản</h2>
            <p>
              Khi đăng ký tài khoản hoặc mua vé trên CinemaBook, bạn xác nhận rằng bạn đã trên 18 tuổi hoặc có sự giám hộ của người lớn, và có đủ năng lực hành vi dân sự để thực hiện giao dịch.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-3">2. Tài khoản và Bảo mật</h2>
            <p>
              Bạn có trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động diễn ra dưới tài khoản của mình. CinemaBook không chịu trách nhiệm cho các tổn thất phát sinh do bạn để lộ mật khẩu.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-3">3. Quy định về giá và thanh toán</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Tất cả giá vé trên hệ thống đã bao gồm Thuế Giá trị gia tăng (VAT).</li>
              <li>CinemaBook có quyền thay đổi giá vé mà không cần báo trước. Tuy nhiên, giá vé đã thanh toán thành công sẽ không bị thay đổi.</li>
              <li>Khách hàng chịu trách nhiệm cung cấp thông tin thanh toán chính xác.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-3">4. Quy định của rạp chiếu phim</h2>
            <p>
              Khách hàng cần tuân thủ các quy định tại rạp chiếu, bao gồm giới hạn độ tuổi của phim, không quay phim/chụp ảnh trong phòng chiếu, và không mang thức ăn/nước uống từ bên ngoài vào.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
