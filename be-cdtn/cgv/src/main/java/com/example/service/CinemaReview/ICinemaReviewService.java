package com.example.service.CinemaReview;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.dto.CinemaReviewDTO;
import com.example.form.CinemaReview.CreateCinemaReview;
import com.example.form.CinemaReview.CinemaReviewFilterForm;
import com.example.form.CinemaReview.UpdateCinemaReview;

public interface ICinemaReviewService {
	
	Page<CinemaReviewDTO> getAllCinemaReview ( Pageable pageable , CinemaReviewFilterForm filterform);
	
	void createCinemaReview(CreateCinemaReview form);
	
	void updateCinemaReview (UpdateCinemaReview form , Integer id);
	
	void deleteCinemaReview (Integer id );


}
