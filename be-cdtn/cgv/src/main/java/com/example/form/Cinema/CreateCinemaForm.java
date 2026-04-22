package com.example.form.Cinema;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateCinemaForm {

	private String cinemaName;
	
	private String address;
	
	private String phone;
	
	private String email;

	private Integer provinceId;
	
	// Tọa độ tự động từ Geocoding
	private BigDecimal latitude;
	
	private BigDecimal longitude;
}
