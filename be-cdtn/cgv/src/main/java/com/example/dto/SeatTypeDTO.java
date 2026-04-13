package com.example.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class SeatTypeDTO {
	 private Integer id;
	 	
	 private String typeName;
	    
	 private BigDecimal priceMultiplier;
	    
	 private String description;
	    
}
