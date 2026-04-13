package com.example.dto;

import java.math.BigDecimal;
import java.util.Date;

import lombok.Data;

@Data
public class PromotionUsageDTO {

	private Integer id;
	
	private Integer accountsId;
	
	private Integer promotionsId;
	
	private Integer ticketsId;
	
	private BigDecimal discountAmount;
	
	private Date usedAt;
}
