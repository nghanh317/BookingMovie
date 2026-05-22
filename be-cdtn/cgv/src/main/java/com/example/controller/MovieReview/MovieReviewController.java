package com.example.controller.MovieReview;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.MovieReviewDTO;
import com.example.form.MovieReview.CreateMovieReview;
import com.example.form.MovieReview.MovieReviewFilterForm;
import com.example.form.MovieReview.UpdateMovieReview;
import com.example.service.MovieReview.MovieReviewService;

@RestController
@RequestMapping ("api/v1/movie-reviews")
public class MovieReviewController {
	
	@Autowired
	private MovieReviewService movieReviewService;
	
	@GetMapping
	Page<MovieReviewDTO> getAllMovieReview (Pageable pageable , MovieReviewFilterForm filterform){
		return movieReviewService.getAllMovieReview(pageable, filterform);
	}
	
	@PostMapping
	public void createMovieReview (@RequestBody CreateMovieReview form) {
		movieReviewService.createMovieReview(form);
	}
	@PutMapping("/{id}")
	public void updateMovieReview (@RequestBody UpdateMovieReview form , @PathVariable Integer id) {
		movieReviewService.updateMovieReview(form, id);
	}
	@DeleteMapping("/{id}")
	public void deleteMovieReview (@PathVariable Integer id) {
		movieReviewService.deleteMovieReview(id);
	}

}
