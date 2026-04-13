package com.example.form.Movie;

import java.util.Date;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CreateMovieForm {

	private String title;
	
	private String description;
	
	private Integer duration;
	
	private Date releaseDate;
	
	private String director;
	
	private String cast;
	
	private String genre;
	
	private String language;
	
	
}
