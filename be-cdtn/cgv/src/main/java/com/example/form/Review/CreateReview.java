package com.example.form.Review;

import lombok.Data;

@Data
public class CreateReview {

	private Integer accountId;
	
	private Integer movieId;
	
	private Double rating;
	
	private String comment;
}
