package com.example.form.SeatType;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CreateSeatTypeForm {

	private String typeName;
	
	private String description;
}
