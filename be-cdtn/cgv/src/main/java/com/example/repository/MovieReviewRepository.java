package com.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.example.entity.MovieReviews;

import java.util.Optional;

@Repository
public interface MovieReviewRepository extends JpaRepository<MovieReviews, Integer>, JpaSpecificationExecutor<MovieReviews>{
	Optional<MovieReviews> findByTicketId(Integer ticketId);

}
