package com.example.form.TicketDetail;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class CreateTicketDetail {

	private Integer ticketId;
	
	private Integer productId;
	
	private Integer quantity;
	
	private BigDecimal unitPrice;
	
	private BigDecimal totalPrice;
}
