package com.example.service.Reviews;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.dto.ReviewsDTO;
import com.example.form.Review.CreateReview;
import com.example.form.Review.ReviewFilterForm;
import com.example.form.Review.UpdateReview;

public interface IReviewService {
	
	Page<ReviewsDTO> getAllReview ( Pageable pageable , ReviewFilterForm filterform);
	
	void createReview(CreateReview form);
	
	void updateReview (UpdateReview form , Integer id);
	
	void deleteReview (Integer id );


}
