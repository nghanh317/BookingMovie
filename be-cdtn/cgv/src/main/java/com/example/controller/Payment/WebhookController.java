package com.example.controller.Payment;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.service.Payment.PayOSService;

import vn.payos.model.webhooks.Webhook;

@RestController
@RequestMapping("api/v1/webhook")
public class WebhookController {

    @Autowired
    private PayOSService payOSService;

    /**
     * LUỒNG 2: Nhận Webhook từ PayOS (server-to-server)
     * POST /api/v1/webhook/payos
     *
     * PayOS tự gọi endpoint này khi khách chuyển tiền thành công.
     * URL phải expose ra internet (ngrok khi dev local).
     */
    @PostMapping("/payos")
    public ResponseEntity<Map<String, String>> handlePayOSWebhook(
            @RequestBody Webhook webhookBody) {
        try {
            payOSService.handleWebhook(webhookBody);
            return ResponseEntity.ok(Map.of("code", "00", "desc", "success"));
        } catch (Exception e) {
            System.err.println("[Webhook/PayOS] Lỗi: " + e.getMessage());
            return ResponseEntity.ok(Map.of("code", "01", "desc", e.getMessage()));
        }
    }
}
