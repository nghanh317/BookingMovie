package com.example.form.Room;



import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CreateRoomForm {

	private Integer cinemaId;
	
	private String roomName;
	
	private String roomType;
	
}
