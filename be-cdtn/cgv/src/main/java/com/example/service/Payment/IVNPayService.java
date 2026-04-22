package com.example.service.Payment;

import com.example.dto.Payment.PaymentRequestDTO;
import com.example.dto.Payment.PaymentResponseDTO;

public interface IVNPayService {
    PaymentResponseDTO createVNPayPayment(PaymentRequestDTO req) throws Exception;
}
