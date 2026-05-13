package com.example.service.Payment;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

import com.example.form.Payment.PaymentRequestForm;

public interface IPaymentService {
    String createVnpayUrl(PaymentRequestForm form, HttpServletRequest request);
    void handleVnpayCallback(HttpServletRequest request, HttpServletResponse response) throws IOException;
}
