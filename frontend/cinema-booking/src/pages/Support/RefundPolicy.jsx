export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-cinema-dark py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-heading font-extrabold text-white mb-8">Chính Sách Đổi/Trả Vé</h1>
        
        <div className="bg-cinema-surface border border-cinema-border rounded-xl p-8 space-y-6 text-cinema-muted">
          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-3">1. Nguyên tắc chung</h2>
            <p className="leading-relaxed">
              CinemaBook hiện tại <strong>KHÔNG</strong> hỗ trợ đổi hoặc trả vé sau khi khách hàng đã hoàn tất quá trình thanh toán trực tuyến thành công, ngoại trừ các trường hợp bất khả kháng phát sinh từ phía rạp chiếu.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-3">2. Các trường hợp được hỗ trợ hoàn tiền</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Rạp chiếu gặp sự cố kỹ thuật (mất điện, hư máy chiếu, hỏng âm thanh) khiến suất chiếu bị huỷ.</li>
              <li>Rạp chiếu thay đổi lịch chiếu hoặc phim mà không thông báo trước.</li>
              <li>Lỗi hệ thống từ CinemaBook khiến khách hàng bị trừ tiền nhưng không nhận được vé.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-3">3. Thời gian và phương thức hoàn tiền</h2>
            <p className="leading-relaxed">
              Đối với các trường hợp đủ điều kiện hoàn tiền, CinemaBook sẽ tiến hành hoàn lại toàn bộ số tiền vào tài khoản/thẻ mà khách hàng đã sử dụng để thanh toán. 
              Thời gian hoàn tiền dự kiến từ 3 đến 7 ngày làm việc tuỳ thuộc vào quy định của ngân hàng/đối tác thanh toán.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-3">4. Liên hệ hỗ trợ</h2>
            <p className="leading-relaxed">
              Nếu gặp sự cố về thanh toán hoặc cần hỗ trợ kiểm tra trạng thái vé, vui lòng liên hệ bộ phận CSKH qua Hotline: <span className="text-primary font-bold">0343453864</span> hoặc Email: <span className="text-primary font-bold">vananhdeptrai3006@gmail.com</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
