package com.example.dto;

import java.util.List;

import com.example.entity.Rooms.Status;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
public class RoomDTO {
	
	private Integer id;
	    
	private String cinemasName;
	
	private String roomName;
	
	private String roomType;
	
	private Integer totalSeats;
	
	private Status status;
	
	private List<SeatDTO> seats;
	
@Data
@NoArgsConstructor
	public static class SeatDTO{
	
	private Integer id;
	
	private String seatRow;
		
	private Integer seatNumber;
	
	private Status status;
	
	private String seatTypesName;
}
}
