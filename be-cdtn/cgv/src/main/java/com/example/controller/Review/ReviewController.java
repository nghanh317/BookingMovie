package com.example.controller.Review;

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

import com.example.dto.ReviewsDTO;
import com.example.form.Review.CreateReview;
import com.example.form.Review.ReviewFilterForm;
import com.example.form.Review.UpdateReview;
import com.example.service.Reviews.ReviewService;

@RestController
@RequestMapping ("api/v1/reviews")
public class ReviewController {
	
	@Autowired
	private ReviewService reviewService;
	
	@GetMapping
	Page<ReviewsDTO> getAllReview (Pageable pageable , ReviewFilterForm filterform){
		return reviewService.getAllReview(pageable, filterform);
	}
	
	@PostMapping
	public void createReview (@RequestBody CreateReview form) {
		reviewService.createReview(form);
	}
	@PutMapping("/{id}")
	public void updateReview (@RequestBody UpdateReview form , @PathVariable Integer id) {
		reviewService.updateReview(form, id);
	}
	@DeleteMapping("/{id}")
	public void deleteReview (@PathVariable Integer id) {
		reviewService.deleteReview(id);
	}

}
