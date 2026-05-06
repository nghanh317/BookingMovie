import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  { q: "Làm thế nào để đặt vé xem phim trực tuyến?", a: "Bạn có thể đăng nhập vào tài khoản, chọn mục 'Phim' hoặc 'Rạp chiếu', chọn phim và suất chiếu mong muốn, sau đó chọn ghế và thanh toán trực tuyến. Vé điện tử sẽ được gửi vào email và hiển thị trong mục 'Vé của tôi'." },
  { q: "Tôi có thể huỷ vé sau khi đã thanh toán không?", a: "Theo chính sách của hệ thống, vé đã mua thành công sẽ không thể huỷ hoặc hoàn tiền. Vui lòng kiểm tra kỹ thông tin suất chiếu và ghế ngồi trước khi thanh toán." },
  { q: "Làm sao để sử dụng mã giảm giá (Voucher)?", a: "Ở bước Thanh toán, bạn sẽ thấy ô nhập Mã giảm giá. Hãy nhập mã và nhấn 'Áp dụng'. Hệ thống sẽ tự động trừ đi số tiền được giảm nếu mã hợp lệ." },
  { q: "Làm thế nào để đổi bắp nước đã đặt trước?", a: "Bạn chỉ cần đưa mã vé điện tử (QR Code) cho nhân viên tại quầy bắp nước của rạp để nhận phần ăn đã đặt trước cùng với vé phim." },
  { q: "Trẻ em có cần mua vé không?", a: "Trẻ em dưới 90cm thường được miễn phí nếu ngồi chung ghế với người lớn. Trẻ em từ 90cm trở lên cần mua vé như bình thường tuỳ theo quy định độ tuổi của phim." },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <div className="min-h-screen bg-cinema-dark py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-heading font-extrabold text-white mb-8 text-center">Câu Hỏi Thường Gặp (FAQ)</h1>
        
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-cinema-surface border border-cinema-border rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-cinema-card transition-colors"
              >
                <span className="font-semibold text-white">{faq.q}</span>
                <svg className={`w-5 h-5 text-primary transition-transform ${openIdx === idx ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {openIdx === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-cinema-border/50"
                  >
                    <div className="px-6 py-4 text-cinema-muted text-sm leading-relaxed bg-cinema-dark/50">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
