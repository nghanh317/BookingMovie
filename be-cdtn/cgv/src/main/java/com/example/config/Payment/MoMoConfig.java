package com.example.config.Payment;

import org.springframework.context.annotation.Configuration;

@Configuration
public class MoMoConfig {
    public static final String momo_PayUrl = "https://test-payment.momo.vn/v2/gateway/api/create";
    public static final String momo_PartnerCode = "MOMO"; 
    public static final String momo_AccessKey = "YOUR_ACCESS_KEY";
    public static final String momo_SecretKey = "YOUR_SECRET_KEY";
}
