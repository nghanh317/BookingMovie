package com.example.form.Tickets;

import com.example.entity.Tickets;

import lombok.Data;

@Data
public class TicketFilterForm {

	private Tickets.PaymentStatus paymentStatus;
	
	private Tickets.Status status;
	
	private Integer accountId;
}
