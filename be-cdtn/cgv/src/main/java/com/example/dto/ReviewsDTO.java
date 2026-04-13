package com.example.dto;

import java.util.Date;

import lombok.Data;

@Data
public class ReviewsDTO {

	private Integer id;
	
	private Integer accountId;
	
	private Integer movieId;
	
	private Double rating;
	
	private String comment;
	
	private Date createDate;
	
	private Date updateDate;
	
}
