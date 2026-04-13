package com.example.service.Movie;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.example.dto.DateDTO;
import com.example.dto.MovieDTO;
import com.example.entity.Movies;
import com.example.entity.Slots;
import com.example.form.Movie.CreateMovieForm;
import com.example.form.Movie.MovieFilterForm;
import com.example.form.Movie.UpdateMovieForm;
import com.example.repository.MovieRepository;
import com.example.repository.SlotRepository;
import com.example.specification.MovieSpecification;

@Service
public class MovieService implements IMovieService{
	
	@Autowired
	private MovieRepository movieRepository;
	
	@Autowired
	private ModelMapper modelMapper;
	
	@Autowired
	private SlotRepository slotRepository;
	@Override
	public Page<MovieDTO> getAllMovie(Pageable pageable , MovieFilterForm filterform) {
		Specification<Movies> where = MovieSpecification.buildWhere(filterform);
	    Page<Movies> moviePage = movieRepository.findAll(where, pageable);
	    
	    List<MovieDTO> dtos = modelMapper.map(
	        moviePage.getContent(),
	        new TypeToken<List<MovieDTO>>() {}.getType()
	    );
	    
	    Page<MovieDTO> dtoPage = new PageImpl<>(dtos, pageable, moviePage.getTotalElements());
	    return dtoPage;
	}
	@Override
	public MovieDTO getById(Integer id) {
	    Movies movie = movieRepository.findById(id).get();
	    return modelMapper.map(movie, MovieDTO.class);
	}
	
	@Override
	public List<DateDTO> getShowDatesByMovieId(Integer movieId) {
	    List<Slots> slots = slotRepository.findByMoviesIdOrderByShowTime(movieId);
	    
	    Set<String> uniqueDates = new LinkedHashSet<>();
	    List<DateDTO> dateDTOs = new ArrayList<>();
	    
	    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
	    
	    for (Slots slot : slots) {
	        String dateString = sdf.format(slot.getShowTime());
	        if (uniqueDates.add(dateString)) {
	            DateDTO dto = new DateDTO();
	            dto.setDate(slot.getShowTime());
	            dateDTOs.add(dto);
	        }
	    }
	    
	    return dateDTOs;
	}
	
	@Override
	public void createMovie (CreateMovieForm form) {
		Movies createMovie = new Movies(form.getTitle(), form.getDescription(), form.getDuration(), form.getReleaseDate(), form.getDirector(), form.getCast(), form.getGenre(), form.getLanguage());
		movieRepository.save(createMovie);
	}
	@Override
	public void updateMovie(Integer id, UpdateMovieForm form) {
		Movies updateMovie = movieRepository.findById(id).get();
		updateMovie.setTitle(form.getTitle());	
		updateMovie.setDuration(form.getDuration());
		updateMovie.setDirector(form.getDirector());
		updateMovie.setCast(form.getCast());
		updateMovie.setGenre(form.getGenre());
		updateMovie.setLanguage(form.getLanguage());
		updateMovie.setDescription(form.getDescription());
		updateMovie.setReleaseDate(form.getReleaseDate());
		updateMovie.setPosterUrl(form.getPosterUrl());
		
		movieRepository.save(updateMovie);
		
	}
	@Override
	public void deleteMovie(Integer id) {
		Movies delete = movieRepository.findById(id).get();
		delete.setIsDeleted(true);
		movieRepository.save(delete);
		
		
	}
}
