package com.example.controller.Movie;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.DateDTO;
import com.example.dto.MovieDTO;
import com.example.form.Movie.CreateMovieForm;
import com.example.form.Movie.MovieFilterForm;
import com.example.form.Movie.UpdateMovieForm;
import com.example.service.Movie.IMovieService;

@RestController
@RequestMapping ( "api/v1/movies")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class MovieController{
	
	@Autowired
	private IMovieService movieService;
	
	@GetMapping
	public Page<MovieDTO> getAllMovie (Pageable pageable, MovieFilterForm filterform){
		return movieService.getAllMovie(pageable, filterform);
	}
	@GetMapping ("/{id}")
	public MovieDTO getById (@PathVariable Integer id) {
		return movieService.getById(id);
	}
	@GetMapping("/{id}/dates")
    public ResponseEntity<List<DateDTO>> getShowDatesByMovieId(@PathVariable Integer id) {
        List<DateDTO> dates = movieService.getShowDatesByMovieId(id);
        return ResponseEntity.ok(dates);
    }
	@PostMapping
	public void createMovie (@RequestBody CreateMovieForm form) {
		 movieService.createMovie(form);
	}
	@PutMapping ("/{id}")
	public void updateMovie ( 
			@PathVariable Integer id,
			@RequestBody UpdateMovieForm form
			) {
		movieService.updateMovie(id, form);
	}
	@DeleteMapping ("/{id}")
	public void deleteMovie (@PathVariable Integer id) {
		movieService.deleteMovie(id);
	}

}
