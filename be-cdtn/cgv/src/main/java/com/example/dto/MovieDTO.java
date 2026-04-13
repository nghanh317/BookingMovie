package com.example.dto;

import lombok.Data;

import java.util.Date;

import com.example.entity.Movies.Status;

@Data
public class MovieDTO {
	private Integer id;
		
	private String title;
	    
	private String description;
	    
	private Integer duration;
	
	private Date releaseDate;
	    
	private String director;
	   
	private String cast;
	  
	private String genre;
	    
	private String language;
	    
	private String posterUrl;
	    
	private String trailerUrl;
	
	private Status status;

	private Date createDate;
	     
	private Date updateDate;
	
//	private List<SlotDTO> slots;
	
//	@Data
//	@NoArgsConstructor
//	static class SlotDTO{
//		private Integer id;
//		
//		private Date showTime;
//		
//		private Date endTime;
//	}
}
