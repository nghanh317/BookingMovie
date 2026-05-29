package com.example.form.MovieReview;

import lombok.Data;

@Data
public class CreateMovieReview {

	private Integer accountId;
	
	private Integer movieId;
	
	private Double rating;
	
	private String comment;
	
	private Integer ticketId;
}
