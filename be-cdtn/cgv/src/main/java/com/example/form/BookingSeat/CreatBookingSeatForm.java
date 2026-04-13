package com.example.form.BookingSeat;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class CreatBookingSeatForm {
	
	private Integer ticketsId;
	
	private Integer seatsId;
	
	private BigDecimal seatPrice;

}
