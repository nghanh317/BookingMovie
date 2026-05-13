package com.example.service.Payment;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.entity.BookingSeats;
import com.example.entity.Slots;
import com.example.entity.Tickets;
import com.example.form.Payment.PaymentRequestForm;
import com.example.repository.SlotRepository;
import com.example.repository.TicketRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Service
public class PaymentService implements IPaymentService {

    @Value("${vnpay.tmn-code}")
    private String tmnCode;

    @Value("${vnpay.hash-secret}")
    private String hashSecret;

    @Value("${vnpay.pay-url}")
    private String payUrl;

    @Value("${vnpay.return-url}")
    private String returnUrl;

    @Value("${vnpay.frontend-success-url}")
    private String frontendSuccessUrl;

    @Value("${vnpay.frontend-failed-url}")
    private String frontendFailedUrl;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private SlotRepository slotRepository;

    @Override
    public String createVnpayUrl(PaymentRequestForm form, HttpServletRequest request) {
        Tickets ticket = ticketRepository.findById(form.getTicketId())
            .orElseThrow(() -> new RuntimeException("Không tìm thấy vé với id: " + form.getTicketId()));

        // Kiểm tra vé chưa được thanh toán
        if (ticket.getPaymentStatus() == Tickets.PaymentStatus.PAID) {
            throw new RuntimeException("Vé này đã được thanh toán rồi!");
        }

        // Số tiền nhân 100 vì VNPay tính theo đơn vị nhỏ nhất (VND * 100)
        long amount = ticket.getFinalAmount().longValue() * 100;

        Map<String, String> vnpParams = new TreeMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", tmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(amount));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", ticket.getTicketsCode()); // mã giao dịch duy nhất
        vnpParams.put("vnp_OrderInfo", "Thanh toan ve phim:" + ticket.getTicketsCode());
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", (form.getLanguage() != null && !form.getLanguage().isEmpty()) ? form.getLanguage() : "vn");
        vnpParams.put("vnp_ReturnUrl", returnUrl);
        vnpParams.put("vnp_IpAddr", getIpAddress(request));

        // Thời gian tạo và hết hạn 10 phút
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        vnpParams.put("vnp_CreateDate", now.format(fmt));
        vnpParams.put("vnp_ExpireDate", now.plusMinutes(10).format(fmt)); // ← 10 phút

        if (form.getBankCode() != null && !form.getBankCode().isEmpty()) {
            vnpParams.put("vnp_BankCode", form.getBankCode());
        }

        // Build query string
        String queryString = vnpParams.entrySet().stream()
            .map(e -> URLEncoder.encode(e.getKey(), StandardCharsets.US_ASCII)
                    + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.US_ASCII))
            .collect(Collectors.joining("&"));

        // Ký HMAC SHA512
        String secureHash = hmacSHA512(hashSecret, queryString);
        return payUrl + "?" + queryString + "&vnp_SecureHash=" + secureHash;
    }

    @Override
    @Transactional
    public void handleVnpayCallback(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        // 1. Thu thập tất cả tham số từ VNPay
        Map<String, String> vnpParams = new HashMap<>();
        request.getParameterNames().asIterator()
            .forEachRemaining(name -> vnpParams.put(name, request.getParameter(name)));

        // 2. Tách hash ra khỏi params để verify
        String receivedHash = vnpParams.remove("vnp_SecureHash");
        vnpParams.remove("vnp_SecureHashType");

        // 3. Tạo lại query string để kiểm tra chữ ký
        String queryString = vnpParams.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .map(e -> URLEncoder.encode(e.getKey(), StandardCharsets.US_ASCII)
                    + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.US_ASCII))
            .collect(Collectors.joining("&"));

        String expectedHash = hmacSHA512(hashSecret, queryString);

        String txnRef = vnpParams.get("vnp_TxnRef");         // = ticketsCode
        String responseCode = vnpParams.get("vnp_ResponseCode");

        // 4. Tìm vé
        Tickets ticket = ticketRepository.findByTicketsCode(txnRef);
        if (ticket == null) {
            response.sendRedirect(frontendFailedUrl + "?error=ticket_not_found");
            return;
        }

        // 5. Verify chữ ký — bảo vệ khỏi giả mạo
        if (receivedHash == null || !expectedHash.equalsIgnoreCase(receivedHash)) {
            response.sendRedirect(frontendFailedUrl + "?error=invalid_signature");
            return;
        }

        // 6. Xử lý kết quả
        if ("00".equals(responseCode)) {
            // ✅ THANH TOÁN THÀNH CÔNG
            ticket.setPaymentStatus(Tickets.PaymentStatus.PAID);
            ticket.setStatus(Tickets.Status.CONFIRMED);
            ticketRepository.save(ticket);
            response.sendRedirect(frontendSuccessUrl + "?ticketId=" + ticket.getId());

        } else {
            // ❌ THẤT BẠI / HẾT GIỜ / HỦY / LỖI KHÁC
            // Chỉ hủy nếu vé chưa được thanh toán (tránh xử lý 2 lần)
            if (ticket.getPaymentStatus() != Tickets.PaymentStatus.PAID) {
                ticket.setStatus(Tickets.Status.CANCELLED);
                ticketRepository.save(ticket);

                // Hoàn lại số ghế trống cho suất chiếu
                Slots slot = ticket.getSlots();
                if (slot != null && ticket.getBookingSeats() != null) {
                    long bookedCount = ticket.getBookingSeats().stream()
                        .filter(bs -> bs.getIsDeleted() == null || !bs.getIsDeleted())
                        .count();
                    slot.setEmptySeats(slot.getEmptySeats() + (int) bookedCount);
                    slotRepository.save(slot);
                }
            }
            // responseCode phổ biến: 24=hủy, 15=hết giờ, 51=không đủ tiền, 75=quá số lần thử
            response.sendRedirect(frontendFailedUrl + "?code=" + responseCode + "&ticketId=" + ticket.getId());
        }
    }

    // Tạo chữ ký HMAC SHA512
    private String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo chữ ký HMAC SHA512", e);
        }
    }

    // Lấy IP thật của user (hỗ trợ proxy/nginx)
    private String getIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isEmpty()) {
            return ip.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
