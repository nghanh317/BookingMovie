package com.example.dto;

//import java.util.Date;
//import java.util.List;

import lombok.Data;
//import lombok.NoArgsConstructor;

@Data
public class ProvinceDTO {
	
    private Integer id;
    
    private String provinceName;
    
//    private List<CinemaDTO> cinemas;
//    
//    @Data
//    @NoArgsConstructor
//	public
//    static class CinemaDTO{
//    	private Integer id;
//    	private String cinemaName;
//    	private String phone;
//    	private String email;
//    	
//    	private List<RoomDTO> rooms;
//    	
//    	@Data
//    	@NoArgsConstructor
//		public
//    	static class RoomDTO{
//    		private Integer id;
//    		
//    		private String roomName;
//    		
//    		private String roomType;
//    		
//    		private List<SlotDTO> slots;
//    		
//    		@Data
//    		@NoArgsConstructor
//    		public static class SlotDTO {
//    			private Integer id;
//    			
//    			private Date showTime;
//    			
//    			private Date endTime;
//    		}
//    	}
//    }
    
}
