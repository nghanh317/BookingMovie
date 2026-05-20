package com.example.form.Cinema;

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

	private String imageUrl;
	
	private Double latitude;
	
	private Double longitude;
}
