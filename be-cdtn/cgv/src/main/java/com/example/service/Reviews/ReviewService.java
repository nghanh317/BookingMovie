package com.example.service.Reviews;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.example.dto.ReviewsDTO;
import com.example.entity.Accounts;
import com.example.entity.Movies;
import com.example.entity.Reviews;
import com.example.form.Review.CreateReview;
import com.example.form.Review.ReviewFilterForm;
import com.example.form.Review.UpdateReview;
import com.example.repository.ReviewRepository;
import com.example.specification.ReviewSpecification;

@Service
public class ReviewService implements IReviewService{
	
	@Autowired
	private ReviewRepository reviewRepository;

	@Autowired
	private ModelMapper modelMapper;
	
	@Override
	public Page<ReviewsDTO> getAllReview(Pageable pageable, ReviewFilterForm filterform) {
		Specification<Reviews> where = ReviewSpecification.buildWhere(filterform);
		Page<Reviews> reviewPage = reviewRepository.findAll(where, pageable);
		
		List<ReviewsDTO> dtos = modelMapper.map(
				reviewPage.getContent(), 
				new TypeToken<List<ReviewsDTO>>() {}.getType()
			    );
		Page<ReviewsDTO> dtoPage = new PageImpl<>(dtos, pageable, reviewPage.getTotalElements());
		return dtoPage;
	}
	@Override
	public void createReview(CreateReview form) {
		Reviews createReview = new Reviews(form.getRating(), form.getComment());
		
		Accounts account = new Accounts();
		account.setId(form.getAccountId());
		createReview.setAccount(account);
		
		Movies movies = new Movies();
		movies.setId(form.getMovieId());
		createReview.setMovie(movies);
		
		reviewRepository.save(createReview);
	}

	@Override
	public void updateReview (UpdateReview form , Integer id) {
		Reviews updateReview = reviewRepository.findById(id).get();
		updateReview.setComment(form.getComment());
		reviewRepository.save(updateReview);
	}

	@Override
	public void deleteReview(Integer id) {
		Reviews delete = reviewRepository.findById(id).get();
		delete.setIsDeleted(true);
		reviewRepository.save(delete);
		
	}
	


}
