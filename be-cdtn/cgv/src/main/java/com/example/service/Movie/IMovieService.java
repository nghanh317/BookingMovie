package com.example.service.Movie;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.dto.DateDTO;
import com.example.dto.MovieDTO;
import com.example.form.Movie.CreateMovieForm;
import com.example.form.Movie.MovieFilterForm;
import com.example.form.Movie.UpdateMovieForm;

public interface IMovieService {

	Page<MovieDTO> getAllMovie(Pageable pageable, MovieFilterForm filterForm);
	
	MovieDTO getById (Integer id);
	
	List<DateDTO> getShowDatesByMovieId(Integer movieId);
	
	void createMovie (CreateMovieForm form);
	
	void updateMovie (Integer id, UpdateMovieForm form);
	
	void deleteMovie (Integer id);

}
