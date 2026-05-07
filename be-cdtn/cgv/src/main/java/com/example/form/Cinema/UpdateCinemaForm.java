package com.example.form.Cinema;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UpdateCinemaForm {
	private String cinemaName;
	
	private String address;
	
	private String phone;
	
	private String email;
}
