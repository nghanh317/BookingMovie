package com.example.dto;


import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

import com.example.entity.Cinemas;

@Data
public class CinemaDTO {
	private Integer id;
	
	private String provincesName;

	private String cinemaName;
	    
	private String address;
	    
	private BigDecimal latitude;
	  
	private BigDecimal longitude;
	
	private Cinemas.Status status;

	private String phone;
	    
	private String email;
	    
	private Date createDate;
	
	private List<RoomDTO> rooms;
	
	@Data
	@NoArgsConstructor
	public static class RoomDTO{
		
		private Integer id;
		
		private String roomName;
		
		private String roomType;
		
		private List<SlotDTO> slots;
		
		@Data
		@NoArgsConstructor
		public static class SlotDTO {
			
			private Integer id;
			
			private Date showTime;
			
			private Date endTime;
			
			private BigDecimal price;
		}
	}

}
