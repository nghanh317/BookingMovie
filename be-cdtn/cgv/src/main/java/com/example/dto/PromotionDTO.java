package com.example.dto;

import java.math.BigDecimal;
import java.util.Date;

import com.example.entity.Promotions.DiscountType;
import com.example.entity.Promotions.Status;

import lombok.Data;

@Data
public class PromotionDTO {

	private Integer id;
	
	private String promotionCode;
	
	private String promotionName;
	
	private String description;
	
	private DiscountType discountType;
	
	private BigDecimal discountValue;
	
	private BigDecimal maxDiscountAmount;
	
	private BigDecimal minOrderAmount;
	
	private Integer usageLimit;
	
	private Integer usageCount;
	
	private Integer usagePerUser;
	
	private Date startDate;
	
	private Date endDate;
	
	private String applicableDay;
	
	private String applicableMovie;
	
	private String applicableCinema;
	
	private Status status;
	
	private String imageUrl;
	
	private Date createDate;
	
	private Date updateDate;
}
