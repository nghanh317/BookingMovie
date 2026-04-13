package com.example.form.Cinema;

import com.example.entity.Cinemas;

import lombok.Data;

@Data
public class CinemaFilterForm {

	private String search;
	
	private Cinemas.Status status;
	
    private Integer movieId;
    
    private String date;
    
    private Integer provinceId;
}
