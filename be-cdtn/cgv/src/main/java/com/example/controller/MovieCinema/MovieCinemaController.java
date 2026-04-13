package com.example.controller.MovieCinema;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.MovieCinemaDTO;
import com.example.form.MovieCinema.MovieCinemaFilterForm;
import com.example.service.MovieCinema.IMovieCinemaService;

@RestController
@RequestMapping ("api/v1/movieCinemas")
public class MovieCinemaController {
	
	@Autowired
	private IMovieCinemaService service;
	
	@GetMapping
	public Page<MovieCinemaDTO> getAllMovieCinema (Pageable pageable, MovieCinemaFilterForm filterform){
		return service.getAllMovieCinema(pageable, filterform);
	}

}
