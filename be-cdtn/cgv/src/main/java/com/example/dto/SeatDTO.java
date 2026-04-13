package com.example.dto;

import com.example.entity.Seats.Status;

import lombok.Data;

@Data
public class SeatDTO {
	
	private Integer id;
	
    private Integer roomsId;
    
    private String roomsName;
    
    private String seatRow;
    
    private Integer seatNumber;
    
    private Integer seatTypesId;
    
    private String seatTypeName;

    private Status status;
}
