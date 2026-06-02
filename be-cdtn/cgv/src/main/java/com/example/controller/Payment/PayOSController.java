package com.example.controller.Payment;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.service.Payment.PayOSService;

@RestController
@RequestMapping("api/v1/payos")
public class PayOSController {

    @Autowired
    private PayOSService payOSService;

    /**
     * LUỒNG 1: Tạo link thanh toán PayOS
     * POST /api/v1/payos/create-link
     * Body: { "ticketId": 5 }
     */
    @PostMapping("/create-link")
    public ResponseEntity<?> createPaymentLink(@RequestBody Map<String, Integer> body) {
        try {
            Integer ticketId = body.get("ticketId");
            if (ticketId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Thiếu ticketId"));
            }
            vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse response = payOSService
                    .createPaymentLink(ticketId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
