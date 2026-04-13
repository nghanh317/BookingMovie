package com.example.form.Seat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSeatForm {
	private String seatRow;
	private Integer seatNumber;
	private Integer roomsId;
	private Integer seatTypesId;
	private String status; 
}