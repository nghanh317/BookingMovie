package com.example.form.CinemaReview;

import lombok.Data;

@Data
public class CreateCinemaReview {

	private Integer accountId;
	
	private Integer cinemaId;
	
	private Double rating;
	
	private String comment;
	
	private Integer ticketId;
}
