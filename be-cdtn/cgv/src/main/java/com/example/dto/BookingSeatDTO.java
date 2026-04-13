package com.example.dto;

import java.math.BigDecimal;


import lombok.Data;

@Data
public class BookingSeatDTO {
	
	private Integer id;
	
	private Integer ticketsId;
	
	private Integer seatsId;
	
	private BigDecimal seatPrice;

}
