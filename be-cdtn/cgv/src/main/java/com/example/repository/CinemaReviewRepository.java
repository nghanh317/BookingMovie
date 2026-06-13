package com.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.example.entity.CinemaReviews;

@Repository
public interface CinemaReviewRepository extends JpaRepository<CinemaReviews, Integer>, JpaSpecificationExecutor<CinemaReviews>{
	java.util.Optional<CinemaReviews> findByTicketId(Integer ticketId);

}
