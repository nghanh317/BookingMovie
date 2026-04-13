package com.example.service.MovieCinema;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.example.dto.MovieCinemaDTO;
import com.example.entity.MovieCinema;
import com.example.form.MovieCinema.MovieCinemaFilterForm;
import com.example.repository.MovieCinemaRepository;
import com.example.specification.MovieCinemaSpecification;

@Service
public class MovieCinemaService implements IMovieCinemaService{
	
	@Autowired
	private MovieCinemaRepository movieCinemaRepository;

	public Page<MovieCinemaDTO> getAllMovieCinema(Pageable pageable, MovieCinemaFilterForm filterform) {
		Specification<MovieCinema> where = MovieCinemaSpecification.buildWhere(filterform);
		Page<MovieCinema> movieCinemaPage = movieCinemaRepository.findAll(where, pageable);
		List<MovieCinemaDTO> dtos = movieCinemaPage.getContent().stream()
		.map(movieCinema ->{
			MovieCinemaDTO dto = new MovieCinemaDTO();
			dto.setMovieid(movieCinema.getPk().getMovieId());
			dto.setMovieName(movieCinema.getMovies().getTitle());
			dto.setCinemaId(movieCinema.getPk().getCinemaId());
			dto.setCinemaName(movieCinema.getCinemas().getCinemaName());
			return dto;

	}).collect(Collectors.toList());
		return new PageImpl<>(dtos, pageable, movieCinemaPage.getTotalElements());
	
	}	

}
