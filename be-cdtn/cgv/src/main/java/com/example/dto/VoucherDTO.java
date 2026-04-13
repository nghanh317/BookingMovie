package com.example.dto;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class VoucherDTO {
    private Integer id;
    private String voucherCode;
    private String description;
    private BigDecimal discountValue;
    private String discountType;
    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountAmount;
    private Boolean isActive;
}