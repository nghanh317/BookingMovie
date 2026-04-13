package com.example.service.MovieCinema;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.dto.MovieCinemaDTO;
import com.example.form.MovieCinema.MovieCinemaFilterForm;

public interface IMovieCinemaService {

	Page<MovieCinemaDTO> getAllMovieCinema (Pageable pageable,MovieCinemaFilterForm filterform);
}
