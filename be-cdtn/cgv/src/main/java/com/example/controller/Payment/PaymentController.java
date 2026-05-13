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
     * Tạo URL thanh toán VNPay (có hiệu lực 10 phút)
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
     * VNPay gọi về sau khi user thanh toán (cả thành công lẫn thất bại)
     * GET /api/v1/payments/vnpay-callback
     */
    @GetMapping("/vnpay-callback")
    public void handleVnpayCallback(HttpServletRequest request,
                                    HttpServletResponse response) throws IOException {
        paymentService.handleVnpayCallback(request, response);
    }
}
