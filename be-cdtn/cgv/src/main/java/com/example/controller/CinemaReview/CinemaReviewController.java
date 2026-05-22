package com.example.controller.CinemaReview;

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

import com.example.dto.CinemaReviewDTO;
import com.example.form.CinemaReview.CreateCinemaReview;
import com.example.form.CinemaReview.CinemaReviewFilterForm;
import com.example.form.CinemaReview.UpdateCinemaReview;
import com.example.service.CinemaReview.CinemaReviewService;

@RestController
@RequestMapping ("api/v1/cinema-reviews")
public class CinemaReviewController {
	
	@Autowired
	private CinemaReviewService cinemaReviewService;
	
	@GetMapping
	Page<CinemaReviewDTO> getAllCinemaReview (Pageable pageable , CinemaReviewFilterForm filterform){
		return cinemaReviewService.getAllCinemaReview(pageable, filterform);
	}
	
	@PostMapping
	public void createCinemaReview (@RequestBody CreateCinemaReview form) {
		cinemaReviewService.createCinemaReview(form);
	}

	@PutMapping("/{id}")
	public void updateCinemaReview (@RequestBody UpdateCinemaReview form , @PathVariable Integer id) {
		cinemaReviewService.updateCinemaReview(form, id);
	}

	@DeleteMapping("/{id}")
	public void deleteCinemaReview (@PathVariable Integer id) {
		cinemaReviewService.deleteCinemaReview(id);
	}

}
