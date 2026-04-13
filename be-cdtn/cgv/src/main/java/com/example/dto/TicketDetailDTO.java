package com.example.dto;

import java.math.BigDecimal;


import lombok.Data;

@Data
public class TicketDetailDTO {

	private Integer id;
	
	private Integer ticketId;
	
	private Integer productId;
	
	private Integer quantity;
	
	private BigDecimal unitPrice;
	
	private BigDecimal totalPrice;
}
