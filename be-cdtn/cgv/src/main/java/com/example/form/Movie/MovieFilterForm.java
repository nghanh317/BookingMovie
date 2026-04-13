package com.example.form.Movie;

import com.example.entity.Movies;

import lombok.Data;

@Data
public class MovieFilterForm {

	private String search;
	
	private Movies.Status status;
	
	private String title;
}
