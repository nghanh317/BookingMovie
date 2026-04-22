package com.example.service.Payment;

import java.nio.charset.StandardCharsets;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Service;

import com.example.config.Payment.MoMoConfig;
import com.example.dto.Payment.PaymentRequestDTO;
import com.example.dto.Payment.PaymentResponseDTO;

@Service
public class MoMoService implements IMoMoService {

    @Override
    public PaymentResponseDTO createMoMoPayment(PaymentRequestDTO req) throws Exception {
        String orderId = req.getOrderInfo() + "_" + System.currentTimeMillis();
        String amount = String.valueOf(req.getAmount());
        String orderInfo = "Thanh toan ve " + req.getOrderInfo();
        String returnUrl = req.getReturnUrl() != null ? req.getReturnUrl() : "http://localhost:5173/payment/callback";
        String notifyUrl = "http://localhost:8080/api/v1/payments/momo-notify"; // Cấu hình tuỳ ý
        String requestId = String.valueOf(System.currentTimeMillis());
        String extraData = "";

        // Chữ ký (signature) MoMo
        String rawHash = "accessKey=" + MoMoConfig.momo_AccessKey +
                "&amount=" + amount +
                "&extraData=" + extraData +
                "&ipnUrl=" + notifyUrl +
                "&orderId=" + orderId +
                "&orderInfo=" + orderInfo +
                "&partnerCode=" + MoMoConfig.momo_PartnerCode +
                "&redirectUrl=" + returnUrl +
                "&requestId=" + requestId +
                "&requestType=captureWallet";

        String signature = hmacSHA256(MoMoConfig.momo_SecretKey, rawHash);

        // Mock Redirect:
        String mockMockPayUrl = returnUrl + "?status=SUCCESS&orderId=" + orderId + "&signature=" + signature;

        PaymentResponseDTO result = new PaymentResponseDTO();
        result.setStatus("OK");
        result.setMessage("Successfully Created MoMo URL");
        result.setUrl(mockMockPayUrl); 
        return result;
    }

    private static String hmacSHA256(String key, String data) {
        try {
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            byte[] hash = sha256_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return "";
        }
    }
}
