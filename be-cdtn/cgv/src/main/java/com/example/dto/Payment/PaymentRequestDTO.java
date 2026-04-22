package com.example.dto.Payment;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentRequestDTO {
    private long amount;
    private String orderInfo;
    private String returnUrl;
}
