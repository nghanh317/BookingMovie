package com.example.service.Payment;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Map;

import com.example.form.Payment.PaymentRequestForm;

public interface IPaymentService {

    /** Tạo URL thanh toán VNPay */
    String createVnpayUrl(PaymentRequestForm form, HttpServletRequest request);

    /**
     * Luồng 1 — RETURN URL (trình duyệt khách nhảy về sau khi thanh toán)
     * Cập nhật DB rồi redirect người dùng về trang thành công/thất bại của React.
     */
    void handleVnpayReturn(HttpServletRequest request, HttpServletResponse response) throws IOException;

    /**
     * Luồng 2 — IPN (VNPay gọi ngầm server-to-server để xác nhận kết quả)
     * KHÔNG redirect. Phải trả về JSON {"RspCode":"00","Message":"Confirm Success"}.
     */
    Map<String, String> handleVnpayIpn(HttpServletRequest request);
}
