package com.example.config.Payment;

import org.springframework.context.annotation.Configuration;

@Configuration
public class VNPayConfig {
    public static final String vnp_PayUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    public static final String vnp_ReturnUrl = "http://localhost:5173/payment/callback";
    public static final String vnp_TmnCode = "YOUR_TMN_CODE"; 
    public static final String hashSecret = "YOUR_HASH_SECRET";
}
