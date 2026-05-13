package com.example.form.Payment;

import lombok.Data;

@Data
public class PaymentRequestForm {
    private Integer ticketId;
    private String bankCode; // VD: VNBANK, INTCARD (có thể để trống)
    private String language; // "vn" hoặc "en"
}
