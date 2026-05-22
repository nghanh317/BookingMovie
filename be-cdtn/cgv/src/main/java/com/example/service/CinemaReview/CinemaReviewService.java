package com.example.service.CinemaReview;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.example.dto.CinemaReviewDTO;
import com.example.entity.Accounts;
import com.example.entity.Cinemas;
import com.example.entity.CinemaReviews;
import com.example.form.CinemaReview.CreateCinemaReview;
import com.example.form.CinemaReview.CinemaReviewFilterForm;
import com.example.form.CinemaReview.UpdateCinemaReview;
import com.example.repository.CinemaReviewRepository;
import com.example.repository.TicketRepository;
import com.example.specification.CinemaReviewSpecification;

@Service
public class CinemaReviewService implements ICinemaReviewService{
	
	@Autowired
	private CinemaReviewRepository cinemaReviewRepository;

	@Autowired
	private TicketRepository ticketRepository;

	@Autowired
	private ModelMapper modelMapper;
	
	@Override
	public Page<CinemaReviewDTO> getAllCinemaReview(Pageable pageable, CinemaReviewFilterForm filterform) {
		Specification<CinemaReviews> where = CinemaReviewSpecification.buildWhere(filterform);
		Page<CinemaReviews> reviewPage = cinemaReviewRepository.findAll(where, pageable);
		
		List<CinemaReviewDTO> dtos = modelMapper.map(
				reviewPage.getContent(), 
				new TypeToken<List<CinemaReviewDTO>>() {}.getType()
			    );
		Page<CinemaReviewDTO> dtoPage = new PageImpl<>(dtos, pageable, reviewPage.getTotalElements());
		return dtoPage;
	}

	@Override
	public void createCinemaReview(CreateCinemaReview form) {
		boolean hasVisited = ticketRepository.hasUserVisitedCinema(form.getAccountId(), form.getCinemaId());
		if (!hasVisited) {
			throw new IllegalStateException("Bạn cần đến rạp này ít nhất một lần trước khi đánh giá.");
		}

		CinemaReviews createReview = new CinemaReviews(form.getRating(), form.getComment());
		
		Accounts account = new Accounts();
		account.setId(form.getAccountId());
		createReview.setAccount(account);
		
		Cinemas cinema = new Cinemas();
		cinema.setId(form.getCinemaId());
		createReview.setCinema(cinema);
		
		cinemaReviewRepository.save(createReview);
	}

	@Override
	public void updateCinemaReview (UpdateCinemaReview form , Integer id) {
		CinemaReviews updateReview = cinemaReviewRepository.findById(id).get();
		updateReview.setComment(form.getComment());
		cinemaReviewRepository.save(updateReview);
	}

	@Override
	public void deleteCinemaReview(Integer id) {
		CinemaReviews delete = cinemaReviewRepository.findById(id).get();
		delete.setIsDeleted(true);
		cinemaReviewRepository.save(delete);
	}


}
