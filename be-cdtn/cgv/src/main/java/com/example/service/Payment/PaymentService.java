package com.example.service.Payment;

import java.io.IOException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;
import java.text.SimpleDateFormat;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private String vnp_TmnCode;

    @Value("${vnpay.hash-secret}")
    private String vnp_HashSecret;

    @Value("${vnpay.pay-url}")
    private String vnp_PayUrl;

    /** URL trình duyệt khách nhảy về (Return URL) */
    @Value("${vnpay.return-url}")
    private String vnp_ReturnUrl;

    @Value("${vnpay.frontend-success-url}")
    private String frontendSuccessUrl;

    @Value("${vnpay.frontend-failed-url}")
    private String frontendFailedUrl;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private SlotRepository slotRepository;

    // =========================================================================
    // 1. TẠO URL THANH TOÁN — theo đúng tài liệu VNPay
    // =========================================================================
    @Override
    public String createVnpayUrl(PaymentRequestForm form, HttpServletRequest request) {
        Tickets ticket = ticketRepository.findById(form.getTicketId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vé: " + form.getTicketId()));

        if (ticket.getPaymentStatus() == Tickets.PaymentStatus.PAID) {
            throw new RuntimeException("Vé đã được thanh toán!");
        }

        // Số tiền * 100 (VNPay yêu cầu — để triệt tiêu phần thập phân)
        long amount = ticket.getFinalAmount().longValue() * 100;

        // ── Tập hợp params ─────────────────────────────────────────────────
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version",   "2.1.0");
        vnp_Params.put("vnp_Command",   "pay");
        vnp_Params.put("vnp_TmnCode",   vnp_TmnCode);
        vnp_Params.put("vnp_Amount",    String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode",  "VND");
        vnp_Params.put("vnp_TxnRef",    ticket.getTicketsCode());
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang:" + ticket.getTicketsCode());
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr",    getIpAddress(request));

        String locale = (form.getLanguage() != null && !form.getLanguage().isEmpty())
                ? form.getLanguage() : "vn";
        vnp_Params.put("vnp_Locale", locale);

        if (form.getBankCode() != null && !form.getBankCode().isEmpty()) {
            vnp_Params.put("vnp_BankCode", form.getBankCode());
        }

        // ── Thời gian tạo và hết hạn (theo tài liệu VNPay dùng Etc/GMT+7) ─
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");

        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        // ── Sắp xếp tên tham số tăng dần (bắt buộc để checksum đúng) ──────
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        // ── Build hashData và query theo đúng chuẩn VNPay ──────────────────
        StringBuilder hashData = new StringBuilder();
        StringBuilder query    = new StringBuilder();
        Iterator<String> itr   = fieldNames.iterator();

        while (itr.hasNext()) {
            String fieldName  = itr.next();
            String fieldValue = vnp_Params.get(fieldName);

            // Bỏ qua field null hoặc rỗng
            if (fieldValue == null || fieldValue.isEmpty()) continue;

            // hashData: key=URLEncode(value, US_ASCII)   ← KHÔNG encode key
            hashData.append(fieldName).append('=')
                    .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));

            // query: URLEncode(key)=URLEncode(value)     ← encode cả key lẫn value
            query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII))
                 .append('=')
                 .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));

            if (itr.hasNext()) {
                hashData.append('&');
                query.append('&');
            }
        }

        // ── Tạo chữ ký HMAC-SHA512 trên hashData ───────────────────────────
        String vnp_SecureHash = hmacSHA512(vnp_HashSecret, hashData.toString());
        String queryUrl = query.toString() + "&vnp_SecureHash=" + vnp_SecureHash;

        // DEBUG (xóa khi deploy production)
        System.out.println("===== VNPAY DEBUG =====");
        System.out.println("HASH DATA : " + hashData);
        System.out.println("SECURE HASH: " + vnp_SecureHash);
        System.out.println("PAYMENT URL: " + vnp_PayUrl + "?" + queryUrl);
        System.out.println("=======================");

        return vnp_PayUrl + "?" + queryUrl;
    }

    // =========================================================================
    // 2. RETURN URL — trình duyệt khách nhảy về sau khi thanh toán
    //
    //    Theo tài liệu VNPay:
    //    "URL này CHỈ kiểm tra toàn vẹn dữ liệu (checksum) và hiển thị thông báo"
    //    "KHÔNG cập nhật kết quả giao dịch tại địa chỉ này"
    //
    //    ⚠️  DB update là việc của IPN. Return URL chỉ redirect React.
    //    ⚠️  Ngoại lệ: nếu IPN chưa đến (test localhost) → fallback cập nhật
    //        để người dùng thấy kết quả đúng trong lúc dev.
    // =========================================================================
    @Override
    public void handleVnpayReturn(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        // ── Bước 1: Thu thập params — raw key + raw value (giống demo chính thức) ──
        //    request.getParameter() tự động URL-decode → ta có giá trị gốc (raw)
        Map<String, String> fields = new HashMap<>();
        for (java.util.Enumeration<String> params = request.getParameterNames();
             params.hasMoreElements(); ) {
            String fieldName  = params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                fields.put(fieldName, fieldValue);
            }
        }

        // ── Bước 2: Tách SecureHash trước khi build checksum ───────────────────
        String vnp_SecureHash = request.getParameter("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");
        fields.remove("vnp_SecureHash");

        String txnRef              = request.getParameter("vnp_TxnRef");
        String responseCode        = request.getParameter("vnp_ResponseCode");
        String transactionStatus   = request.getParameter("vnp_TransactionStatus");

        // ── Bước 3: Build checksum — rawKey=rawValue (KHÔNG encode lại) ────────
        //    Theo demo Return URL: Config.hashAllFields(fields) dùng raw values
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        for (int i = 0; i < fieldNames.size(); i++) {
            String fn = fieldNames.get(i);
            String fv = fields.get(fn);
            if (fv == null || fv.isEmpty()) continue;
            if (hashData.length() > 0) hashData.append('&');
            hashData.append(fn).append('=').append(fv);
        }

        String signValue = hmacSHA512(vnp_HashSecret, hashData.toString());
        boolean validSig = signValue.equalsIgnoreCase(vnp_SecureHash);

        System.out.println("[ReturnURL] txnRef=" + txnRef + " responseCode=" + responseCode);
        System.out.println("[ReturnURL] hashData=" + hashData);
        System.out.println("[ReturnURL] expected=" + signValue + " received=" + vnp_SecureHash);
        System.out.println("[ReturnURL] validSig=" + validSig);

        // ── Bước 4: Sai chữ ký → redirect lỗi ngay ────────────────────────────
        if (!validSig) {
            response.sendRedirect(frontendFailedUrl
                    + "?error=invalid_signature&txnRef=" + txnRef);
            return;
        }

        // ── Bước 5: Tìm vé (để lấy ticketId redirect về React) ─────────────────
        Tickets ticket = ticketRepository.findByTicketsCode(txnRef);
        if (ticket == null) {
            response.sendRedirect(frontendFailedUrl + "?error=ticket_not_found");
            return;
        }

        // ── Bước 6: Fallback cập nhật DB nếu IPN chưa đến ─────────────────────
        //    (chỉ áp dụng khi test localhost — production: IPN đã xử lý rồi)
        if (ticket.getPaymentStatus() != Tickets.PaymentStatus.PAID) {
            if ("00".equals(responseCode) && "00".equals(transactionStatus)) {
                ticket.setPaymentStatus(Tickets.PaymentStatus.PAID);
                ticket.setStatus(Tickets.Status.CONFIRMED);
                ticketRepository.save(ticket);
                System.out.println("[ReturnURL] Fallback: cập nhật DB vé " + txnRef + " → PAID");
            } else {
                // Giao dịch thất bại
                ticket.setStatus(Tickets.Status.CANCELLED);
                ticketRepository.save(ticket);
                restoreSeats(ticket);
            }
        }

        // ── Bước 7: Redirect về React với thông tin kết quả ────────────────────
        String errorDesc = getErrorDescription(responseCode);
        if ("00".equals(responseCode)) {
            response.sendRedirect(frontendSuccessUrl
                    + "?ticketId=" + ticket.getId()
                    + "&txnRef=" + txnRef);
        } else {
            response.sendRedirect(frontendFailedUrl
                    + "?code=" + responseCode
                    + "&desc=" + URLEncoder.encode(errorDesc, StandardCharsets.UTF_8)
                    + "&ticketId=" + ticket.getId());
        }
    }


    // =========================================================================
    // 3. IPN — VNPay gọi ngầm Server-to-Server để xác nhận
    //    KHÔNG redirect. Phải trả JSON {"RspCode":"00","Message":"Confirm Success"}
    //
    //    Thứ tự kiểm tra theo tài liệu chính thức:
    //      1. Verify checksum (97 nếu sai)
    //      2. Tìm đơn hàng    (01 nếu không có)
    //      3. Kiểm tra amount (04 nếu sai)
    //      4. Kiểm tra status (02 nếu đã xử lý rồi)
    //      5. Cập nhật DB     (00 thành công)
    // =========================================================================
    @Override
    @Transactional
    public Map<String, String> handleVnpayIpn(HttpServletRequest request) {
        Map<String, String> result = new LinkedHashMap<>();
        try {
            // ── Bước 1: Thu thập params — encode cả key lẫn value theo đúng IPN demo ──
            //    URLEncoder.encode("vnp_Amount", US_ASCII) = "vnp_Amount" (không đổi vì không có ký tự đặc biệt)
            //    nhưng value cần encode đúng để khi join lại giống với lúc tạo URL
            Map<String, String> fields = new HashMap<>();
            for (java.util.Enumeration<String> params = request.getParameterNames();
                 params.hasMoreElements(); ) {
                String fieldName  = URLEncoder.encode(params.nextElement(), StandardCharsets.US_ASCII);
                String fieldValue = URLEncoder.encode(request.getParameter(
                        URLDecoder.decode(fieldName, StandardCharsets.US_ASCII)),
                        StandardCharsets.US_ASCII);
                if (fieldValue != null && !fieldValue.isEmpty()) {
                    fields.put(fieldName, fieldValue);
                }
            }

            // Tách hash ra trước khi build checksum
            String vnp_SecureHash = request.getParameter("vnp_SecureHash");
            fields.remove(URLEncoder.encode("vnp_SecureHashType", StandardCharsets.US_ASCII));
            fields.remove(URLEncoder.encode("vnp_SecureHash",     StandardCharsets.US_ASCII));

            // ── Bước 2: Build checksum — sort → join "key=encodedValue&..." ──────────
            List<String> fieldNames = new ArrayList<>(fields.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            for (int i = 0; i < fieldNames.size(); i++) {
                if (i > 0) hashData.append('&');
                hashData.append(fieldNames.get(i))
                        .append('=')
                        .append(fields.get(fieldNames.get(i)));
            }

            String signValue = hmacSHA512(vnp_HashSecret, hashData.toString());

            // ── Check 1: Chữ ký ──────────────────────────────────────────────────────
            if (!signValue.equalsIgnoreCase(vnp_SecureHash)) {
                System.out.println("[IPN] Sai chữ ký! Expected=" + signValue + " Got=" + vnp_SecureHash);
                result.put("RspCode", "97");
                result.put("Message", "Invalid Checksum");
                return result;
            }

            // Raw params để đọc giá trị
            String txnRef          = request.getParameter("vnp_TxnRef");
            String responseCode    = request.getParameter("vnp_ResponseCode");
            String transactionStatus = request.getParameter("vnp_TransactionStatus");
            String amountStr       = request.getParameter("vnp_Amount");

            // ── Check 2: Tìm đơn hàng ────────────────────────────────────────────────
            Tickets ticket = ticketRepository.findByTicketsCode(txnRef);
            if (ticket == null) {
                result.put("RspCode", "01");
                result.put("Message", "Order not Found");
                return result;
            }

            // ── Check 3: Kiểm tra số tiền ────────────────────────────────────────────
            //    VNPay gửi amount * 100, nên so sánh với finalAmount * 100
            long expectedAmount = ticket.getFinalAmount().longValue() * 100;
            long receivedAmount = Long.parseLong(amountStr);
            if (expectedAmount != receivedAmount) {
                result.put("RspCode", "04");
                result.put("Message", "Invalid Amount");
                return result;
            }

            // ── Check 4: Idempotency — tránh xử lý 2 lần ────────────────────────────
            //    Chỉ xử lý vé đang ở trạng thái PENDING / UNPAID
            if (ticket.getPaymentStatus() == Tickets.PaymentStatus.PAID) {
                result.put("RspCode", "02");
                result.put("Message", "Order already confirmed");
                return result;
            }

            // ── Bước 5: Cập nhật DB ───────────────────────────────────────────────────
            //    Thành công: ResponseCode=00 VÀ TransactionStatus=00
            if ("00".equals(responseCode) && "00".equals(transactionStatus)) {
                ticket.setPaymentStatus(Tickets.PaymentStatus.PAID);
                ticket.setStatus(Tickets.Status.CONFIRMED);
            } else {
                // Thanh toán thất bại
                ticket.setStatus(Tickets.Status.CANCELLED);
                restoreSeats(ticket);
            }
            ticketRepository.save(ticket);

            // ── Phản hồi thành công cho VNPay (BẮT BUỘC — nếu không VNPay sẽ retry) ─
            result.put("RspCode", "00");
            result.put("Message", "Confirm Success");

        } catch (Exception e) {
            System.err.println("[IPN] Lỗi không xác định: " + e.getMessage());
            result.put("RspCode", "99");
            result.put("Message", "Unknown error");
        }
        return result;
    }


    // =========================================================================
    // HELPERS
    // =========================================================================

    /** HMAC-SHA512 — dùng UTF-8 cho key và data */
    private String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi tạo HMAC-SHA512", e);
        }
    }

    /**
     * Tra mô tả lỗi theo bảng mã vnp_ResponseCode chính thức.
     * Dùng để hiển thị thông báo thân thiện trên trang thất bại của React.
     */
    private String getErrorDescription(String responseCode) {
        if (responseCode == null) return "Lỗi không xác định";
        return switch (responseCode) {
            case "00" -> "Giao dịch thành công";
            case "07" -> "Trừ tiền thành công. Giao dịch bị nghi ngờ gian lận";
            case "09" -> "Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking";
            case "10" -> "Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần";
            case "11" -> "Đã hết hạn chờ thanh toán. Vui lòng thực hiện lại";
            case "12" -> "Thẻ/Tài khoản bị khóa";
            case "13" -> "Nhập sai OTP quá số lần cho phép. Vui lòng thực hiện lại";
            case "24" -> "Khách hàng hủy giao dịch";
            case "51" -> "Tài khoản không đủ số dư";
            case "65" -> "Tài khoản vượt quá hạn mức giao dịch trong ngày";
            case "75" -> "Ngân hàng thanh toán đang bảo trì";
            case "79" -> "Nhập sai mật khẩu thanh toán quá số lần. Vui lòng thực hiện lại";
            default   -> "Giao dịch không thành công (mã lỗi: " + responseCode + ")";
        };
    }


    /** Hoàn ghế khi vé bị huỷ */
    private void restoreSeats(Tickets ticket) {
        Slots slot = ticket.getSlots();
        if (slot != null && ticket.getBookingSeats() != null) {
            long count = ticket.getBookingSeats().stream()
                    .filter(bs -> bs.getIsDeleted() == null || !bs.getIsDeleted())
                    .count();
            if (count > 0) {
                slot.setEmptySeats(slot.getEmptySeats() + (int) count);
                slotRepository.save(slot);
            }
        }
    }

    /** Lấy IP thật (hỗ trợ proxy/nginx) */
    private String getIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if ("0:0:0:0:0:0:0:1".equals(ip)) return "127.0.0.1";
        return ip.split(",")[0].trim();
    }
}
