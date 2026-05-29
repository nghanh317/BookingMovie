package com.example.service.MovieReview;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.example.dto.MovieReviewDTO;
import com.example.entity.Accounts;
import com.example.entity.Movies;
import com.example.entity.MovieReviews;
import com.example.form.MovieReview.CreateMovieReview;
import com.example.form.MovieReview.MovieReviewFilterForm;
import com.example.form.MovieReview.UpdateMovieReview;
import com.example.repository.MovieReviewRepository;
import com.example.repository.TicketRepository;
import com.example.specification.MovieReviewSpecification;

@Service
public class MovieReviewService implements IMovieReviewService{
	
	@Autowired
	private MovieReviewRepository movieReviewRepository;

	@Autowired
	private TicketRepository ticketRepository;

	@Autowired
	private ModelMapper modelMapper;
	
	@Autowired
	private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

	@jakarta.annotation.PostConstruct
	public void dropUniqueIndex() {
		try {
			jdbcTemplate.execute("ALTER TABLE movie_reviews DROP INDEX account_id_2");
		} catch (Exception e) {
			// Ignore if index doesn't exist
		}
	}

	@Override
	public Page<MovieReviewDTO> getAllMovieReview(Pageable pageable, MovieReviewFilterForm filterform) {
		Specification<MovieReviews> where = MovieReviewSpecification.buildWhere(filterform);
		Page<MovieReviews> reviewPage = movieReviewRepository.findAll(where, pageable);
		
		List<MovieReviewDTO> dtos = modelMapper.map(
				reviewPage.getContent(), 
				new TypeToken<List<MovieReviewDTO>>() {}.getType()
			    );
		Page<MovieReviewDTO> dtoPage = new PageImpl<>(dtos, pageable, reviewPage.getTotalElements());
		return dtoPage;
	}
	@Override
	public void createMovieReview(CreateMovieReview form) {
		boolean hasPurchased = ticketRepository.hasUserPurchasedMovie(form.getAccountId(), form.getMovieId());
		if (!hasPurchased) {
			throw new IllegalStateException("Bạn cần mua vé xem phim này trước khi đánh giá.");
		}

		java.util.Optional<MovieReviews> existingOpt = form.getTicketId() != null 
				? movieReviewRepository.findByTicketId(form.getTicketId()) 
				: java.util.Optional.empty();
		
		if (existingOpt.isPresent()) {
			MovieReviews existingReview = existingOpt.get();
			existingReview.setRating(form.getRating());
			existingReview.setComment(form.getComment());
			movieReviewRepository.save(existingReview);
		} else {
			MovieReviews createReview = new MovieReviews(form.getRating(), form.getComment());
			
			Accounts account = new Accounts();
			account.setId(form.getAccountId());
			createReview.setAccount(account);
			
			Movies movies = new Movies();
			movies.setId(form.getMovieId());
			createReview.setMovie(movies);
			
			createReview.setTicketId(form.getTicketId());
			
			movieReviewRepository.save(createReview);
		}
	}

	@Override
	public void updateMovieReview (UpdateMovieReview form , Integer id) {
		MovieReviews updateReview = movieReviewRepository.findById(id).get();
		updateReview.setComment(form.getComment());
		movieReviewRepository.save(updateReview);
	}

	@Override
	public void deleteMovieReview(Integer id) {
		MovieReviews delete = movieReviewRepository.findById(id).get();
		delete.setIsDeleted(true);
		movieReviewRepository.save(delete);
		
	}
	


}
