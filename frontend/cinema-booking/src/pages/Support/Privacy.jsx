export default function Privacy() {
  return (
    <div className="min-h-screen bg-cinema-dark py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-heading font-extrabold text-white mb-8">Chính Sách Bảo Mật</h1>
        
        <div className="bg-cinema-surface border border-cinema-border rounded-xl p-8 space-y-6 text-cinema-muted leading-relaxed">
          <p>
            CinemaBook tôn trọng và cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của người dùng. Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn.
          </p>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-3">1. Thông tin chúng tôi thu thập</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Thông tin cá nhân:</strong> Họ tên, số điện thoại, địa chỉ email khi bạn đăng ký tài khoản.</li>
              <li><strong>Thông tin giao dịch:</strong> Lịch sử đặt vé, phương thức thanh toán (chúng tôi không lưu trữ trực tiếp số thẻ tín dụng của bạn).</li>
              <li><strong>Thông tin thiết bị:</strong> Địa chỉ IP, loại trình duyệt, hệ điều hành để tối ưu hoá trải nghiệm người dùng.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-3">2. Cách sử dụng thông tin</h2>
            <p>
              Thông tin thu thập được sử dụng để:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Xử lý đơn hàng đặt vé và gửi vé điện tử.</li>
              <li>Hỗ trợ khách hàng, giải đáp thắc mắc và khiếu nại.</li>
              <li>Gửi thông báo về lịch chiếu, chương trình khuyến mãi (nếu bạn đồng ý nhận).</li>
              <li>Ngăn chặn các hoạt động gian lận và vi phạm tài khoản.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-3">3. Chia sẻ thông tin</h2>
            <p>
              Chúng tôi tuyệt đối không bán hay cho thuê thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào. Dữ liệu chỉ được chia sẻ trong các trường hợp cần thiết như cung cấp cho đối tác cổng thanh toán (để xử lý giao dịch) hoặc khi có yêu cầu hợp pháp từ cơ quan chức năng.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-3">4. Cam kết bảo mật</h2>
            <p>
              Toàn bộ dữ liệu của bạn được mã hoá bằng công nghệ SSL/TLS an toàn nhất. Chúng tôi áp dụng các tiêu chuẩn bảo mật khắt khe để đảm bảo dữ liệu không bị truy cập hoặc tiết lộ trái phép.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
