package com.example.form.Room;

//import com.example.entity.Rooms;

import lombok.Data;

@Data
public class RoomFilterForm {

	private String search;
	
	private Integer seatId;
	
	private Integer roomId;
	
//	private Rooms.Status status;
}
