package com.example.controller.Payment;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.dto.Payment.PaymentRequestDTO;
import com.example.service.Payment.IMoMoService;
import com.example.service.Payment.IVNPayService;

@RestController
@RequestMapping("api/v1/payments")
public class PaymentController {

    @Autowired
    private IVNPayService vnPayService;
    
    @Autowired
    private IMoMoService moMoService;

    @PostMapping("/vnpay")
    public ResponseEntity<?> createVNPayPayment(@RequestBody PaymentRequestDTO req) throws Exception {
        return ResponseEntity.ok(vnPayService.createVNPayPayment(req));
    }

    @PostMapping("/momo")
    public ResponseEntity<?> createMoMoPayment(@RequestBody PaymentRequestDTO req) throws Exception {
        return ResponseEntity.ok(moMoService.createMoMoPayment(req));
    }
}
