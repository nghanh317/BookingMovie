package com.example.dto;

import java.util.Date;

import lombok.Data;

@Data
public class CinemaReviewDTO {

	private Integer id;
	
	private Integer accountId;
	
	private String accountFullName;
	
	private Integer cinemaId;
	
	private Double rating;
	
	private String comment;
	
	private Date createDate;
	
	private Date updateDate;
	
}
