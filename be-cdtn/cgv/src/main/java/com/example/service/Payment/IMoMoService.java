package com.example.service.Payment;

import com.example.dto.Payment.PaymentRequestDTO;
import com.example.dto.Payment.PaymentResponseDTO;

public interface IMoMoService {
    PaymentResponseDTO createMoMoPayment(PaymentRequestDTO req) throws Exception;
}
