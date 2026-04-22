package com.example.form.Movie;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UpdateMovieForm {
	
	private String title;
	
	private String description;
	
	private Integer duration;
	
	@JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Ho_Chi_Minh")
	private Date releaseDate;
	
	private String director;
	
	private String cast;
	
	private String genre;
	
	private String language;
	
	private String posterUrl;
	
	private String trailerUrl;
	
	private String status;
}
