package com.example.form.Cinema;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CreateCinemaForm {

	
	private String cinemaName;
	
	private String address;
	
	private String phone;
	
	private String email;

	private Integer provinceId;

}
