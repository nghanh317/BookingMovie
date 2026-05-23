package com.example.controller.Payment;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.form.Payment.PaymentRequestForm;
import com.example.service.Payment.IPaymentService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("api/v1/payments")
public class PaymentController {

    @Autowired
    private IPaymentService paymentService;

    /**
     * Tạo URL thanh toán VNPay (có hiệu lực 15 phút)
     * POST /api/v1/payments/create-url
     * Body: { "ticketId": 1, "bankCode": "", "language": "vn" }
     */
    @PostMapping("/create-url")
    public ResponseEntity<Map<String, String>> createPaymentUrl(
            @RequestBody PaymentRequestForm form,
            HttpServletRequest request) {
        String paymentUrl = paymentService.createVnpayUrl(form, request);
        return ResponseEntity.ok(Map.of("paymentUrl", paymentUrl));
    }

    /**
     * Luồng 1 — RETURN URL (trình duyệt khách nhảy về sau khi thanh toán)
     * VNPay redirect trình duyệt khách về đây → xử lý → redirect tiếp về React.
     *
     * GET /api/v1/payments/vnpay-return
     */
    @GetMapping("/vnpay-return")
    public void handleVnpayReturn(HttpServletRequest request,
                                  HttpServletResponse response) throws IOException {
        paymentService.handleVnpayReturn(request, response);
    }

    /**
     * Luồng 2 — IPN (VNPay gọi ngầm Server-to-Server để xác nhận kết quả)
     * PHẢI trả về JSON, KHÔNG redirect.
     * URL này phải là public (ngrok hoặc server deploy thật).
     *
     * GET /api/v1/payments/vnpay-ipn
     */
    @GetMapping("/vnpay-ipn")
    public ResponseEntity<Map<String, String>> handleVnpayIpn(HttpServletRequest request) {
        Map<String, String> result = paymentService.handleVnpayIpn(request);
        return ResponseEntity.ok(result);
    }
}
