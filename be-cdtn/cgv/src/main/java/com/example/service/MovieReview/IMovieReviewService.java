package com.example.service.MovieReview;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.dto.MovieReviewDTO;
import com.example.form.MovieReview.CreateMovieReview;
import com.example.form.MovieReview.MovieReviewFilterForm;
import com.example.form.MovieReview.UpdateMovieReview;

public interface IMovieReviewService {
	
	Page<MovieReviewDTO> getAllMovieReview ( Pageable pageable , MovieReviewFilterForm filterform);
	
	void createMovieReview(CreateMovieReview form);
	
	void updateMovieReview (UpdateMovieReview form , Integer id);
	
	void deleteMovieReview (Integer id );


}
